import { and, eq, schema, type Database } from "@olnktr/db";
import type { JobProducer } from "@olnktr/jobs";
import type { Logger } from "@olnktr/observability";
import { AppError, errors } from "@olnktr/types";
import type { PaymentProviderRegistry } from "../providers/registry";
import { WebhookVerificationError, type WebhookAck } from "../providers/types";
import type { BillingEventProcessor } from "./processor";

/**
 * Webhook receipt: verify → persist in the inbox (unique provider event id) →
 * enqueue processing. If the queue is unavailable the event is processed
 * inline; if that fails too we return 5xx so the provider retries later.
 * Duplicate deliveries are acknowledged without reprocessing.
 */
export interface WebhookIngestorDeps {
  db: Database;
  providers: PaymentProviderRegistry;
  jobs: JobProducer;
  processor: BillingEventProcessor;
  logger: Logger;
}

export const billingJobId = (billingEventId: string) => `billing-event-${billingEventId}`;

export function createWebhookIngestor(deps: WebhookIngestorDeps) {
  return {
    async receive(
      providerId: string,
      rawBody: string,
      headers: Headers,
    ): Promise<WebhookAck & { duplicate: boolean }> {
      if (!deps.providers.has(providerId)) throw errors.notFound("Webhook endpoint");
      const provider = deps.providers.get(providerId);
      if (rawBody.length > 1_000_000)
        throw new AppError("PAYLOAD_TOO_LARGE", "Webhook payload too large");

      let verified;
      try {
        verified = await provider.verifyWebhook({ rawBody, headers });
      } catch (error) {
        if (error instanceof WebhookVerificationError) {
          deps.logger.warn(
            { provider: providerId, reason: error.message },
            "billing webhook rejected",
          );
          throw new AppError("UNAUTHORIZED", "Invalid webhook signature");
        }
        throw error;
      }

      const [inserted] = await deps.db
        .insert(schema.billingEvents)
        .values({
          provider: providerId,
          providerEventId: verified.providerEventId,
          type: verified.type,
          payload: { events: verified.events },
        })
        .onConflictDoNothing({
          target: [schema.billingEvents.provider, schema.billingEvents.providerEventId],
        })
        .returning({ id: schema.billingEvents.id });

      let eventId = inserted?.id;
      if (!eventId) {
        const [existing] = await deps.db
          .select({ id: schema.billingEvents.id, status: schema.billingEvents.status })
          .from(schema.billingEvents)
          .where(
            and(
              eq(schema.billingEvents.provider, providerId),
              eq(schema.billingEvents.providerEventId, verified.providerEventId),
            ),
          );
        if (!existing) throw errors.internal("Billing event disappeared");
        if (existing.status === "processed" || existing.status === "ignored") {
          deps.logger.info(
            { provider: providerId, eventId: existing.id },
            "duplicate billing webhook acknowledged",
          );
          return { ...provider.webhookAck, duplicate: true };
        }
        eventId = existing.id;
      }

      try {
        await deps.jobs.enqueue(
          "billing",
          "process-event",
          { billingEventId: eventId },
          { jobId: billingJobId(eventId) },
        );
      } catch (error) {
        deps.logger.warn(
          { err: error, eventId },
          "billing queue unavailable; processing webhook inline",
        );
        await deps.processor.process(eventId);
      }
      return { ...provider.webhookAck, duplicate: false };
    },
  };
}

export type WebhookIngestor = ReturnType<typeof createWebhookIngestor>;
