import { Queue, type JobsOptions } from "bullmq";
import { errors } from "@olnktr/types";
import type { Redis } from "ioredis";
import { bullPrefix } from "./connection";
import {
  QUEUE_DEFAULTS,
  parseJobPayload,
  type JobName,
  type JobPayload,
  type QueueName,
} from "./definitions";

export interface EnqueueOptions {
  /** Deterministic id for idempotent enqueueing (duplicates are ignored by BullMQ). */
  jobId?: string;
  delayMs?: number;
}

export interface JobProducer {
  enqueue<Q extends QueueName, N extends JobName<Q>>(
    queue: Q,
    name: N,
    payload: JobPayload<Q, N>,
    options?: EnqueueOptions,
  ): Promise<string>;
  close(): Promise<void>;
}

export function defaultJobOptions(queue: QueueName): JobsOptions {
  const defaults = QUEUE_DEFAULTS[queue];
  return {
    attempts: defaults.attempts,
    backoff: { type: "exponential", delay: defaults.backoffMs },
    removeOnComplete: { age: defaults.keepCompletedSeconds, count: 10_000 },
    removeOnFail: { age: defaults.keepFailedSeconds },
  };
}

const ENQUEUE_TIMEOUT_MS = 3_000;

export function createBullJobProducer(options: {
  connection: Redis;
  keyPrefix: string;
}): JobProducer {
  const queues = new Map<QueueName, Queue>();
  const getQueue = (name: QueueName) => {
    let queue = queues.get(name);
    if (!queue) {
      queue = new Queue(name, {
        connection: options.connection,
        prefix: bullPrefix(options.keyPrefix),
        defaultJobOptions: defaultJobOptions(name),
      });
      queue.on("error", () => undefined);
      queues.set(name, queue);
    }
    return queue;
  };

  return {
    async enqueue(queue, name, payload, enqueueOptions = {}) {
      const data = parseJobPayload(queue, name, payload);
      let timer: NodeJS.Timeout | undefined;
      try {
        const job = await Promise.race([
          getQueue(queue).add(name, data, {
            jobId: enqueueOptions.jobId,
            delay: enqueueOptions.delayMs,
          }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("enqueue timed out")), ENQUEUE_TIMEOUT_MS);
          }),
        ]);
        return job.id ?? enqueueOptions.jobId ?? "";
      } catch (error) {
        throw Object.assign(errors.unavailable("Background job queue is unavailable"), {
          cause: error,
        });
      } finally {
        clearTimeout(timer);
      }
    },
    async close() {
      await Promise.allSettled([...queues.values()].map((queue) => queue.close()));
      queues.clear();
    },
  };
}

export interface RecordedJob {
  queue: QueueName;
  name: string;
  payload: unknown;
  jobId: string;
}

/**
 * In-process producer for tests and tooling. Records jobs (deduplicating by
 * jobId like BullMQ does) so tests can assert on them or run handlers directly.
 */
export function createInMemoryJobProducer(): JobProducer & {
  jobs: RecordedJob[];
  take(queue?: QueueName): RecordedJob[];
  failNext: boolean;
} {
  let counter = 0;
  const producer = {
    jobs: [] as RecordedJob[],
    failNext: false,
    async enqueue<Q extends QueueName, N extends JobName<Q>>(
      queue: Q,
      name: N,
      payload: JobPayload<Q, N>,
      enqueueOptions: EnqueueOptions = {},
    ): Promise<string> {
      await Promise.resolve();
      if (producer.failNext) {
        producer.failNext = false;
        throw errors.unavailable("Background job queue is unavailable");
      }
      const data = parseJobPayload(queue, name, payload);
      const jobId = enqueueOptions.jobId ?? `mem-${++counter}`;
      if (!producer.jobs.some((job) => job.queue === queue && job.jobId === jobId)) {
        producer.jobs.push({ queue, name, payload: data, jobId });
      }
      return jobId;
    },
    take(queue?: QueueName) {
      const taken = producer.jobs.filter((job) => !queue || job.queue === queue);
      producer.jobs = producer.jobs.filter((job) => !taken.includes(job));
      return taken;
    },
    close: () => Promise.resolve(),
  };
  return producer;
}
