/** Owner of a tenant-scoped resource. Personal resources belong to a user. */
export type OwnerRef =
  { type: "user"; userId: string } | { type: "organization"; organizationId: string };

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export type Awaitable<T> = T | Promise<T>;

/** Injectable clock — services take this instead of calling `new Date()` directly. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
