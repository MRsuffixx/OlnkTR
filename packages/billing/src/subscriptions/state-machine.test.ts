import { describe, expect, it } from "vitest";
import { SUBSCRIPTION_STATUSES } from "@olnktr/validators";
import {
  accessSource,
  assertTransition,
  canTransition,
  SUBSCRIPTION_TRANSITIONS,
} from "./state-machine";

const now = new Date("2026-06-01T00:00:00Z");
const future = new Date("2026-07-01T00:00:00Z");
const past = new Date("2026-05-01T00:00:00Z");
const base = { trialEndsAt: null, currentPeriodEnd: null, gracePeriodEndsAt: null, endedAt: null };

describe("subscription state machine", () => {
  it("defines transitions for every status", () => {
    expect(Object.keys(SUBSCRIPTION_TRANSITIONS).sort()).toEqual([...SUBSCRIPTION_STATUSES].sort());
  });

  it.each([
    ["incomplete", "active", true],
    ["trialing", "active", true],
    ["active", "past_due", true],
    ["past_due", "active", true],
    ["canceled", "expired", true],
    ["active", "active", true],
    ["expired", "active", false],
    ["canceled", "active", false],
    ["active", "incomplete", false],
    ["paused", "trialing", false],
  ] as const)("%s -> %s allowed=%s", (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });

  it("throws on invalid transitions", () => {
    expect(() => assertTransition("expired", "active")).toThrow(/Invalid subscription transition/);
  });
});

describe("access rules", () => {
  it("grants access to active subscriptions", () => {
    expect(accessSource({ ...base, status: "active" }, now)).toBe("subscription");
  });

  it("limits trials to the trial window", () => {
    expect(accessSource({ ...base, status: "trialing", trialEndsAt: future }, now)).toBe("trial");
    expect(accessSource({ ...base, status: "trialing", trialEndsAt: past }, now)).toBeNull();
  });

  it("honours the grace period for past_due", () => {
    expect(accessSource({ ...base, status: "past_due", gracePeriodEndsAt: future }, now)).toBe(
      "grace",
    );
    expect(accessSource({ ...base, status: "past_due", gracePeriodEndsAt: past }, now)).toBeNull();
  });

  it("keeps canceled subscriptions until the paid period ends", () => {
    expect(accessSource({ ...base, status: "canceled", currentPeriodEnd: future }, now)).toBe(
      "canceled_period",
    );
    expect(
      accessSource({ ...base, status: "canceled", currentPeriodEnd: future, endedAt: past }, now),
    ).toBeNull();
    expect(accessSource({ ...base, status: "canceled", currentPeriodEnd: past }, now)).toBeNull();
  });

  it.each(["incomplete", "paused", "expired"] as const)("denies %s", (status) => {
    expect(accessSource({ ...base, status, currentPeriodEnd: future }, now)).toBeNull();
  });
});
