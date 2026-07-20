import "server-only";

import { env } from "~/env";

export function getAppOrigin() {
  if (!env.NEXT_PUBLIC_APP_URL) {
    if (env.NODE_ENV === "production")
      throw new Error("NEXT_PUBLIC_APP_URL is required in production.");
    return "http://localhost:3000";
  }
  return new URL(env.NEXT_PUBLIC_APP_URL).origin;
}
