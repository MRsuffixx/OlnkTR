import { buildDevWebhook } from "@olnktr/billing";
import { and, eq, schema } from "@olnktr/db";
import { resolveSession } from "@olnktr/auth";
import {
  REQUEST_ID_HEADER,
  reportError,
  resolveRequestId,
  runWithContext,
} from "@olnktr/observability";
import { errors } from "@olnktr/types";
import type { Container } from "../container";
import { getClientIp } from "./client-ip";
import { isSameOrigin } from "./csrf";
import { errorResponse } from "./errors";

/**
 * Framework-agnostic HTTP handlers used by Next.js route files. Keeping them
 * here (instead of in route files) makes them unit/integration testable.
 */
export function createHttpHandlers(container: Container) {
  const { env, logger } = container;
  const ipOf = (request: Request) =>
    getClientIp(request.headers, { trustProxy: env.TRUST_PROXY, header: env.CLIENT_IP_HEADER });

  return {
    /** Liveness: the process is up. Never touches dependencies. */
    live(): Response {
      return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
    },

    /** Readiness: dependencies reachable. Redis/storage outages degrade (not fail) readiness. */
    async ready(): Promise<Response> {
      const check = async (fn: () => Promise<unknown>) => {
        const started = Date.now();
        try {
          await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
          ]);
          return { ok: true, latencyMs: Date.now() - started };
        } catch {
          return { ok: false, latencyMs: Date.now() - started };
        }
      };
      const [database, redis, storage] = await Promise.all([
        check(() => container.database.ping()),
        check(() => container.redis.ping()),
        check(() => container.storage.ping()),
      ]);
      const status = !database.ok ? "unavailable" : redis.ok && storage.ok ? "ok" : "degraded";
      return Response.json(
        { status, checks: { database, redis, storage } },
        { status: database.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
      );
    },

    /** Payment provider webhooks: raw body is required for signature verification. */
    async billingWebhook(request: Request, provider: string): Promise<Response> {
      const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
      return runWithContext({ requestId }, async () => {
        try {
          const ack = await container.webhooks.receive(
            provider,
            await request.text(),
            request.headers,
          );
          return new Response(ack.body, {
            status: ack.status,
            headers: { "Content-Type": ack.contentType },
          });
        } catch (error) {
          reportError(logger, error, { provider });
          return errorResponse(error, requestId);
        }
      });
    },

    /** Click-tracked redirect for profile links. Only stored, validated URLs are ever redirected to. */
    async linkRedirect(request: Request, linkId: string): Promise<Response> {
      if (!/^[0-9a-f-]{36}$/i.test(linkId)) return new Response("Not found", { status: 404 });
      const target = await container.core.links.resolveRedirect(linkId, new Date());
      if (!target) return new Response("Not found", { status: 404 });
      // Analytics never blocks the redirect.
      void container.analyticsIngest
        .ingest(
          {
            type: "link.click",
            profileId: target.profileId,
            linkId: target.linkId,
            referrer: request.headers.get("referer") ?? undefined,
          },
          {
            ip: ipOf(request),
            userAgent: request.headers.get("user-agent"),
            country: request.headers.get(env.ANALYTICS_COUNTRY_HEADER),
            optOut: request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1",
          },
        )
        .catch((error: unknown) => logger.warn({ err: error }, "click tracking failed"));
      return new Response(null, {
        status: 302,
        headers: {
          Location: target.url,
          "Cache-Control": "no-store",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      });
    },

    /** Public image delivery via short-lived signed storage URLs. */
    async media(mediaId: string): Promise<Response> {
      if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return new Response("Not found", { status: 404 });
      const url = await container.core.media.getPublicUrl(mediaId);
      if (!url) return new Response("Not found", { status: 404 });
      return new Response(null, {
        status: 302,
        headers: { Location: url, "Cache-Control": "public, max-age=300" },
      });
    },

    /**
     * Local development checkout (dev payment provider only). Renders a page
     * where the developer explicitly chooses an outcome; the choice is turned
     * into a signed webhook processed by the regular pipeline.
     */
    async devCheckoutPage(request: Request): Promise<Response> {
      if (!container.env.BILLING_PROVIDERS.includes("dev"))
        return new Response("Not found", { status: 404 });
      const session = await resolveSession(container.auth, container.database.db, request.headers);
      const checkoutId = new URL(request.url).searchParams.get("session") ?? "";
      if (!session || !/^[0-9a-f-]{36}$/i.test(checkoutId))
        return new Response("Not found", { status: 404 });
      const [checkout] = await container.database.db
        .select({
          id: schema.checkoutSessions.id,
          status: schema.checkoutSessions.status,
          planName: schema.plans.name,
          amount: schema.planPrices.amount,
          currency: schema.planPrices.currency,
          interval: schema.planPrices.interval,
        })
        .from(schema.checkoutSessions)
        .innerJoin(schema.plans, eq(schema.plans.id, schema.checkoutSessions.planId))
        .innerJoin(schema.planPrices, eq(schema.planPrices.id, schema.checkoutSessions.priceId))
        .where(
          and(
            eq(schema.checkoutSessions.id, checkoutId),
            eq(schema.checkoutSessions.createdByUserId, session.user.id),
            eq(schema.checkoutSessions.provider, "dev"),
          ),
        );
      if (!checkout) return new Response("Not found", { status: 404 });
      const escape = (value: string) =>
        value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dev checkout</title></head>
<body style="font-family:system-ui;max-width:480px;margin:48px auto;padding:0 16px">
<h1>Development checkout</h1><p>This simulates a payment provider. No real payment is made.</p>
<p><strong>${escape(checkout.planName)}</strong> — ${(checkout.amount / 100).toFixed(2)} ${escape(checkout.currency)} / ${escape(checkout.interval)}</p>
<p>Status: ${escape(checkout.status)}</p>
<form method="post"><input type="hidden" name="session" value="${checkout.id}">
<button name="outcome" value="success" type="submit">Simulate successful payment</button>
<button name="outcome" value="failure" type="submit">Simulate declined payment</button></form></body></html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    },

    async devCheckoutSubmit(request: Request): Promise<Response> {
      const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
      try {
        if (
          !container.env.BILLING_PROVIDERS.includes("dev") ||
          !container.env.DEV_BILLING_WEBHOOK_SECRET
        )
          throw errors.notFound();
        if (!isSameOrigin(request, env.APP_URL))
          throw errors.forbidden("Cross-site request rejected");
        const session = await resolveSession(
          container.auth,
          container.database.db,
          request.headers,
        );
        if (!session) throw errors.unauthorized();
        const form = await request.formData();
        const sessionField = form.get("session");
        const outcomeField = form.get("outcome");
        const checkoutId = typeof sessionField === "string" ? sessionField : "";
        const outcome = typeof outcomeField === "string" ? outcomeField : "";
        const [checkout] = await container.database.db
          .select({
            id: schema.checkoutSessions.id,
            amount: schema.planPrices.amount,
            currency: schema.planPrices.currency,
            interval: schema.planPrices.interval,
            trialDays: schema.plans.trialDays,
          })
          .from(schema.checkoutSessions)
          .innerJoin(schema.planPrices, eq(schema.planPrices.id, schema.checkoutSessions.priceId))
          .innerJoin(schema.plans, eq(schema.plans.id, schema.checkoutSessions.planId))
          .where(
            and(
              eq(schema.checkoutSessions.id, checkoutId),
              eq(schema.checkoutSessions.createdByUserId, session.user.id),
              eq(schema.checkoutSessions.status, "open"),
            ),
          );
        if (!checkout) throw errors.notFound("Checkout");
        const webhook = buildDevWebhook(
          container.env.DEV_BILLING_WEBHOOK_SECRET,
          outcome === "success"
            ? {
                kind: "checkout.completed",
                checkoutSessionId: checkout.id,
                status: "active",
                interval: checkout.interval,
                trialDays: 0,
                amount: checkout.amount,
                currency: checkout.currency,
              }
            : {
                kind: "checkout.failed",
                checkoutSessionId: checkout.id,
                amount: checkout.amount,
                currency: checkout.currency,
                reason: "Simulated decline",
              },
        );
        await container.webhooks.receive("dev", webhook.rawBody, webhook.headers);
        const target = new URL(
          `/settings/billing?checkout=${outcome === "success" ? "success" : "canceled"}`,
          env.APP_URL,
        );
        return new Response(null, { status: 303, headers: { Location: target.toString() } });
      } catch (error) {
        reportError(logger, error);
        return errorResponse(error, requestId);
      }
    },
  };
}

export type HttpHandlers = ReturnType<typeof createHttpHandlers>;
