import { Writable } from "node:stream";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { getRequestContext, resolveRequestId, runWithContext } from "./context";
import { REDACT_PATHS } from "./logger";

describe("request context", () => {
  it("propagates through async calls", async () => {
    const seen = await runWithContext({ requestId: "req-12345678" }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return getRequestContext()?.requestId;
    });
    expect(seen).toBe("req-12345678");
    expect(getRequestContext()).toBeUndefined();
  });

  it("only accepts well-formed inbound request ids", () => {
    expect(resolveRequestId("abc-12345678")).toBe("abc-12345678");
    expect(resolveRequestId("bad id\n")).not.toBe("bad id\n");
    expect(resolveRequestId(undefined)).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("logger redaction", () => {
  it("never writes secrets", () => {
    const lines: string[] = [];
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });
    const logger = pino({ redact: { paths: REDACT_PATHS, censor: "[REDACTED]" } }, stream);
    logger.info(
      { password: "hunter2", user: { token: "abc" }, headers: { authorization: "Bearer x" } },
      "x",
    );
    expect(lines.join("")).not.toMatch(/hunter2|"abc"|Bearer x/);
  });
});
