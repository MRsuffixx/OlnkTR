import { createServer, type Server } from "node:http";
import { Queue, Worker, type Job } from "bullmq";
import {
  bullPrefix,
  defaultJobOptions,
  MAINTENANCE_SCHEDULES,
  QUEUE_NAMES,
  type QueueName,
} from "@olnktr/jobs";
import { reportError, runWithContext, withSpan, type Logger } from "@olnktr/observability";
import type { WorkerContainer } from "./container";
import type { Processor } from "./processors/index";

const CONCURRENCY: Record<QueueName, number> = {
  analytics: 10,
  email: 5,
  billing: 2,
  media: 3,
  maintenance: 1,
};

export interface WorkerRuntime {
  workers: Worker[];
  queues: Map<QueueName, Queue>;
  health: Server;
  shutdown(signal: string): Promise<void>;
}

function logJob(logger: Logger, queue: QueueName) {
  return {
    completed(job: Job, result: unknown) {
      logger.info(
        {
          queue,
          jobId: job.id,
          name: job.name,
          attempts: job.attemptsMade,
          durationMs:
            job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined,
          result,
        },
        "job completed",
      );
    },
    failed(job: Job | undefined, error: Error) {
      const finalAttempt = !job || job.attemptsMade >= (job.opts.attempts ?? 1);
      const fields = {
        queue,
        jobId: job?.id,
        name: job?.name,
        attempts: job?.attemptsMade,
        finalAttempt,
      };
      if (finalAttempt) reportError(logger, error, fields);
      else logger.warn({ ...fields, err: error }, "job failed; will retry with backoff");
    },
  };
}

export async function startRuntime(
  container: WorkerContainer,
  processors: Record<QueueName, Processor>,
): Promise<WorkerRuntime> {
  const { env, logger } = container;
  const prefix = bullPrefix(env.REDIS_KEY_PREFIX);
  const queues = new Map<QueueName, Queue>();
  const workers: Worker[] = [];

  for (const queueName of QUEUE_NAMES) {
    const queue = new Queue(queueName, {
      connection: container.workerRedis,
      prefix,
      defaultJobOptions: defaultJobOptions(queueName),
    });
    queue.on("error", (error) =>
      logger.warn({ err: error, queue: queueName }, "queue connection error"),
    );
    queues.set(queueName, queue);

    const processor = processors[queueName];
    const worker = new Worker(
      queueName,
      async (job) =>
        runWithContext(
          { requestId: `job-${queueName}-${job.id}`, jobId: job.id, queue: queueName },
          () =>
            withSpan(
              `job ${queueName}/${job.name}`,
              {
                "messaging.system": "bullmq",
                "messaging.destination.name": queueName,
                "messaging.message.id": job.id ?? "",
                "olnktr.job.attempt": job.attemptsMade + 1,
              },
              () => processor(job.name, job.data),
            ),
        ),
      {
        connection: container.workerRedis,
        prefix,
        concurrency: CONCURRENCY[queueName],
        autorun: true,
      },
    );
    const log = logJob(logger, queueName);
    worker.on("completed", (job, result) => log.completed(job, result));
    worker.on("failed", (job, error) => log.failed(job, error));
    worker.on("error", (error) =>
      logger.warn({ err: error, queue: queueName }, "worker error (will reconnect)"),
    );
    workers.push(worker);
  }

  // Repeatable maintenance jobs (idempotent upsert of job schedulers).
  const maintenance = queues.get("maintenance")!;
  for (const schedule of MAINTENANCE_SCHEDULES) {
    await maintenance
      .upsertJobScheduler(
        `schedule:${schedule.name}`,
        { pattern: schedule.pattern, tz: "UTC" },
        { name: schedule.name, data: {} },
      )
      .catch((error: unknown) =>
        logger.error({ err: error, schedule: schedule.name }, "failed to register job scheduler"),
      );
  }

  let shuttingDown = false;
  const health = createServer((request, response) => {
    void (async () => {
      const send = (status: number, body: unknown) => {
        response.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify(body));
      };
      if (request.url === "/health") {
        const redisOk = container.workerRedis.status === "ready";
        return send(!shuttingDown ? 200 : 503, {
          status: shuttingDown ? "shutting_down" : redisOk ? "ok" : "degraded",
          redis: container.workerRedis.status,
          workers: workers.map((worker) => ({ name: worker.name, running: worker.isRunning() })),
        });
      }
      if (request.url === "/queues") {
        try {
          const entries = await Promise.all(
            [...queues].map(async ([name, queue]): Promise<[string, Record<string, number>]> => [
              name,
              await queue.getJobCounts("waiting", "active", "delayed", "failed", "completed"),
            ]),
          );
          const counts = Object.fromEntries(entries);
          return send(200, { queues: counts });
        } catch {
          return send(503, { error: "redis unavailable" });
        }
      }
      send(404, { error: "not found" });
    })();
  });
  // Bound to localhost by default; container healthchecks run inside the container.
  health.listen(env.WORKER_HEALTH_PORT, process.env.WORKER_HEALTH_HOST ?? "127.0.0.1");

  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "worker shutting down: finishing active jobs");
    const timeout = new Promise((resolve) => setTimeout(resolve, 30_000));
    await Promise.race([Promise.allSettled(workers.map((worker) => worker.close())), timeout]);
    await Promise.allSettled([...queues.values()].map((queue) => queue.close()));
    await new Promise<void>((resolve) => health.close(() => resolve()));
    logger.info("worker stopped");
  }

  logger.info({ queues: QUEUE_NAMES, healthPort: env.WORKER_HEALTH_PORT }, "worker started");
  return { workers, queues, health, shutdown };
}
