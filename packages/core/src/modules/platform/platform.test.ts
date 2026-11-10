import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "../audit/index";
import { rolloutBucket } from "./service";

describe("feature flag rollout", () => {
  it("assigns stable buckets in [0, 100)", () => {
    const bucket = rolloutBucket("new-editor", "user-1");
    expect(rolloutBucket("new-editor", "user-1")).toBe(bucket);
    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(100);
  });

  it("spreads subjects roughly evenly", () => {
    const enabled = Array.from(
      { length: 2000 },
      (_, index) => rolloutBucket("flag", `user-${index}`) < 25,
    ).filter(Boolean).length;
    expect(enabled).toBeGreaterThan(400);
    expect(enabled).toBeLessThan(600);
  });
});

describe("audit metadata sanitization", () => {
  it("drops sensitive keys at any depth", () => {
    expect(
      sanitizeAuditMetadata({
        password: "x",
        token: "y",
        nested: { apiKey: "z", secretHash: "h", keep: true },
        list: [{ cookie: "c", ok: 1 }],
      }),
    ).toEqual({ nested: { keep: true }, list: [{ ok: 1 }] });
  });
});
