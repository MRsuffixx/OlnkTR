import { Queue } from "bullmq";
import { afterAll, describe, expect, it } from "vitest";
import { bullPrefix, createBullJobProducer, createRedisConnection } from "./index";

const redisUrl = process.env.TEST_REDIS_URL ?? "redis://localhost:63799/15";
const prefix = `olnktr-test-${Date.now()}`;

describe("BullMQ producer (integration)", () => {
  const connection = createRedisConnection(redisUrl, "producer");
  const producer = createBullJobProducer({ connection, keyPrefix: prefix });

  afterAll(async () => {
    const queue = new Queue("billing", { connection, prefix: bullPrefix(prefix) });
    await queue.obliterate({ force: true });
    await queue.close();
    await producer.close();
    connection.disconnect();
  });

  it("enqueues idempotently with a deterministic job id", async () => {
    const payload = { billingEventId: "8d8ac610-566d-4ef0-9c22-186b2a5ed793" };
    const first = await producer.enqueue("billing", "process-event", payload, { jobId: "evt-abc" });
    const second = await producer.enqueue("billing", "process-event", payload, {
      jobId: "evt-abc",
    });
    expect(first).toBe("evt-abc");
    expect(second).toBe("evt-abc");
    const queue = new Queue("billing", { connection, prefix: bullPrefix(prefix) });
    expect(await queue.getJobCounts("waiting")).toMatchObject({ waiting: 1 });
    await queue.close();
  });

  it("fails fast with SERVICE_UNAVAILABLE when Redis is unreachable", async () => {
    const dead = createRedisConnection("redis://127.0.0.1:1/0", "producer");
    const deadProducer = createBullJobProducer({ connection: dead, keyPrefix: prefix });
    const started = Date.now();
    await expect(
      deadProducer.enqueue("billing", "process-event", {
        billingEventId: "8d8ac610-566d-4ef0-9c22-186b2a5ed793",
      }),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    expect(Date.now() - started).toBeLessThan(5_000);
    await deadProducer.close();
    dead.disconnect();
  });
});
