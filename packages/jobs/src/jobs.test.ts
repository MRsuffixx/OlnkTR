import { describe, expect, it } from "vitest";
import { createInMemoryJobProducer, defaultJobOptions, parseJobPayload } from "./index";

describe("job contracts", () => {
  it("validates payloads on enqueue", async () => {
    const producer = createInMemoryJobProducer();
    await expect(
      producer.enqueue("billing", "process-event", { billingEventId: "not-a-uuid" }),
    ).rejects.toThrow();
  });

  it("deduplicates by jobId", async () => {
    const producer = createInMemoryJobProducer();
    const payload = { billingEventId: "8d8ac610-566d-4ef0-9c22-186b2a5ed793" };
    await producer.enqueue("billing", "process-event", payload, { jobId: "evt-1" });
    await producer.enqueue("billing", "process-event", payload, { jobId: "evt-1" });
    expect(producer.take("billing")).toHaveLength(1);
  });

  it("uses exponential backoff by default", () => {
    expect(defaultJobOptions("billing").backoff).toEqual({ type: "exponential", delay: 5000 });
  });

  it("rejects unknown jobs", () => {
    expect(() => parseJobPayload("email", "nope" as never, {})).toThrow(/Unknown job/);
  });
});
