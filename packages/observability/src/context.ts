import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * Per-request / per-job context propagated through async calls. The logger
 * attaches `requestId` automatically, giving end-to-end correlation from the
 * HTTP request through services into background jobs.
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  apiKeyId?: string;
  jobId?: string;
  queue?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/** Mutates the active context (e.g. once the user has been authenticated). */
export function setContextValues(values: Partial<RequestContext>): void {
  const store = storage.getStore();
  if (store) Object.assign(store, values);
}

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

/** Accepts a well-formed inbound correlation id or generates a new one. */
export function resolveRequestId(inbound: string | null | undefined): string {
  return inbound && REQUEST_ID_PATTERN.test(inbound) ? inbound : randomUUID();
}

export const REQUEST_ID_HEADER = "x-request-id";
