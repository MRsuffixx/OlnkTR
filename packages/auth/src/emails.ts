import { eq, schema } from "@olnktr/db";
import type { CreateAuthDeps } from "./server";

/**
 * Sends auth emails through the email queue; falls back to direct delivery
 * when the queue is unavailable so sign-up and password reset keep working
 * during a Redis outage.
 */
export function createEmailDispatcher(
  deps: Pick<CreateAuthDeps, "db" | "jobs" | "logger" | "sendEmailDirect">,
) {
  return {
    async send(input: {
      to: string;
      userId: string;
      template: "verify-email" | "reset-password";
      props: Record<string, string>;
    }) {
      const [prefs] = await deps.db
        .select({ locale: schema.userPreferences.locale })
        .from(schema.userPreferences)
        .where(eq(schema.userPreferences.userId, input.userId));
      const message = {
        to: input.to,
        template: input.template,
        locale: prefs?.locale === "tr" ? ("tr" as const) : ("en" as const),
        props: input.props,
      };
      try {
        await deps.jobs.enqueue("email", "send", message);
      } catch (error) {
        if (!deps.sendEmailDirect) throw error;
        deps.logger.warn(
          { err: error, template: input.template },
          "email queue unavailable; sending directly",
        );
        await deps.sendEmailDirect(message);
      }
    },
  };
}
