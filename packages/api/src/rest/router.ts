import { z } from "zod";
import type { AuthenticatedApiKey } from "@olnktr/core";
import {
  runWithContext,
  resolveRequestId,
  REQUEST_ID_HEADER,
  reportError,
  withSpan,
} from "@olnktr/observability";
import { AppError, errors } from "@olnktr/types";
import {
  analyticsEventInputSchema,
  createLinkInputSchema,
  createProfileInputSchema,
  updateLinkInputSchema,
  type ApiKeyScope,
} from "@olnktr/validators";
import type { Container } from "../container";
import { getClientIp } from "../http/client-ip";
import { errorResponse } from "../http/errors";
import { rateLimitHeaders } from "../http/rate-limit";

/**
 * Versioned public REST API (`/api/v1/*`) for third-party integrations.
 *
 * Conventions:
 *  - Auth: `Authorization: Bearer olnk_<prefix>_<secret>` (API keys, scoped)
 *  - Success: `{ "data": ... }`; errors: `{ "error": { code, message, details?, requestId } }`
 *  - Rate limit per key from the owner's plan (`api.requests_per_minute`), RateLimit-* headers
 *  - Breaking changes ship under a new prefix (/api/v2); v1 stays stable.
 */
interface RouteContext {
  request: Request;
  params: Record<string, string>;
  query: URLSearchParams;
  key: AuthenticatedApiKey | null;
  container: Container;
  clientIp: string | null;
}

interface Route {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  pattern: string;
  auth: "public" | "api_key";
  scope?: ApiKeyScope;
  status?: number;
  handler: (ctx: RouteContext) => Promise<unknown>;
}

const MAX_BODY_BYTES = 64 * 1024;

async function readJson(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) throw new AppError("PAYLOAD_TOO_LARGE", "Request body too large");
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw errors.badRequest("Malformed JSON body");
  }
}

const isoDate = z.iso.date();

const routes: Route[] = [
  {
    method: "GET",
    pattern: "/health",
    auth: "public",
    handler: async ({ container }) => {
      await container.database.ping();
      return { status: "ok", version: "v1" };
    },
  },
  {
    method: "GET",
    pattern: "/profiles",
    auth: "api_key",
    scope: "profiles:read",
    handler: ({ container, key }) =>
      container.core.profiles.list(key!.actor, key!.actor.organizationId),
  },
  {
    method: "POST",
    pattern: "/profiles",
    auth: "api_key",
    scope: "profiles:write",
    status: 201,
    handler: async ({ container, key, request }) => {
      const input = createProfileInputSchema.parse(await readJson(request));
      return container.core.profiles.create(key!.actor, {
        ...input,
        organizationId: key!.actor.organizationId,
      });
    },
  },
  {
    method: "GET",
    pattern: "/profiles/:id",
    auth: "api_key",
    scope: "profiles:read",
    handler: ({ container, key, params }) =>
      container.core.profiles.get(key!.actor, z.uuid().parse(params.id)),
  },
  {
    method: "PATCH",
    pattern: "/profiles/:id",
    auth: "api_key",
    scope: "profiles:write",
    handler: async ({ container, key, params, request }) => {
      const body = z
        .object({
          displayName: z.string().max(80).optional(),
          bio: z.string().max(500).nullish(),
          published: z.boolean().optional(),
        })
        .strict()
        .parse(await readJson(request));
      const profileId = z.uuid().parse(params.id);
      let profile = await container.core.profiles.update(key!.actor, {
        profileId,
        displayName: body.displayName,
        bio: body.bio,
      });
      if (body.published !== undefined)
        profile = await container.core.profiles.setPublished(key!.actor, profileId, body.published);
      return profile;
    },
  },
  {
    method: "DELETE",
    pattern: "/profiles/:id",
    auth: "api_key",
    scope: "profiles:write",
    status: 204,
    handler: async ({ container, key, params }) => {
      await container.core.profiles.delete(key!.actor, z.uuid().parse(params.id));
      return null;
    },
  },
  {
    method: "GET",
    pattern: "/links",
    auth: "api_key",
    scope: "links:read",
    handler: ({ container, key, query }) =>
      container.core.links.list(key!.actor, z.uuid().parse(query.get("profileId"))),
  },
  {
    method: "POST",
    pattern: "/links",
    auth: "api_key",
    scope: "links:write",
    status: 201,
    handler: async ({ container, key, request }) =>
      container.core.links.create(key!.actor, createLinkInputSchema.parse(await readJson(request))),
  },
  {
    method: "PATCH",
    pattern: "/links/:id",
    auth: "api_key",
    scope: "links:write",
    handler: async ({ container, key, params, request }) => {
      const body = z
        .object({
          title: z.string().max(120).optional(),
          url: z.string().max(2048).optional(),
          isActive: z.boolean().optional(),
        })
        .strict()
        .parse(await readJson(request));
      return container.core.links.update(
        key!.actor,
        updateLinkInputSchema.parse({ ...body, linkId: params.id }),
      );
    },
  },
  {
    method: "DELETE",
    pattern: "/links/:id",
    auth: "api_key",
    scope: "links:write",
    status: 204,
    handler: async ({ container, key, params }) => {
      await container.core.links.delete(key!.actor, z.uuid().parse(params.id));
      return null;
    },
  },
  {
    method: "GET",
    pattern: "/analytics",
    auth: "api_key",
    scope: "analytics:read",
    handler: ({ container, key, query }) =>
      container.core.analytics.summary(key!.actor, {
        profileId: z.uuid().parse(query.get("profileId")),
        from: isoDate.parse(query.get("from")),
        to: isoDate.parse(query.get("to")),
      }),
  },
  {
    // Public, unauthenticated event collection (used by public profile pages).
    method: "POST",
    pattern: "/analytics/events",
    auth: "public",
    status: 202,
    handler: async ({ container, request, clientIp }) => {
      const limit = await container.rateLimiter.consume(`collect:${clientIp ?? "anon"}`, 120, 60);
      if (!limit.allowed) throw errors.rateLimited(limit.retryAfterSeconds);
      const event = analyticsEventInputSchema.parse(await readJson(request, 8 * 1024));
      const headers = request.headers;
      const result = await container.analyticsIngest.ingest(event, {
        ip: clientIp,
        userAgent: headers.get("user-agent"),
        country: headers.get(container.env.ANALYTICS_COUNTRY_HEADER),
        optOut: headers.get("dnt") === "1" || headers.get("sec-gpc") === "1",
      });
      return { accepted: result.accepted };
    },
  },
];

function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index++) {
    const expected = patternParts[index]!;
    const actual = decodeURIComponent(pathParts[index]!);
    if (expected.startsWith(":")) params[expected.slice(1)] = actual;
    else if (expected !== actual) return null;
  }
  return params;
}

export function createRestApi(container: Container) {
  async function authenticate(request: Request): Promise<AuthenticatedApiKey> {
    const header = request.headers.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw errors.unauthorized("Missing API key");
    const key = await container.core.apiKeys.authenticate(token);
    if (!key) throw errors.unauthorized("Invalid API key");
    return key;
  }

  return {
    /** Handles a request whose path is relative to /api/v1 (e.g. "/profiles/123"). */
    async handle(request: Request, path: string): Promise<Response> {
      const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
      return runWithContext({ requestId }, async () => {
        const baseHeaders: Record<string, string> = {
          "X-Request-Id": requestId,
          "API-Version": "1",
          "Cache-Control": "no-store",
        };
        try {
          const candidates = routes
            .map((route) => ({ route, params: match(route.pattern, path) }))
            .filter((entry) => entry.params);
          if (candidates.length === 0) throw errors.notFound("Endpoint");
          const found = candidates.find((entry) => entry.route.method === request.method);
          if (!found) {
            return errorResponse(new AppError("BAD_REQUEST", "Method not allowed"), requestId, {
              ...baseHeaders,
              Allow: candidates.map((entry) => entry.route.method).join(", "),
            });
          }
          const { route, params } = found as { route: Route; params: Record<string, string> };
          const env = container.env;
          const clientIp = getClientIp(request.headers, {
            trustProxy: env.TRUST_PROXY,
            header: env.CLIENT_IP_HEADER,
          });

          let key: AuthenticatedApiKey | null = null;
          if (route.auth === "api_key") {
            key = await authenticate(request);
            const limit = await container.rateLimiter.consume(
              `api:${key.actor.apiKeyId}`,
              key.requestsPerMinute,
              60,
            );
            Object.assign(baseHeaders, rateLimitHeaders(limit));
            if (!limit.allowed) throw errors.rateLimited(limit.retryAfterSeconds);
            if (route.scope && !key.actor.scopes.includes(route.scope))
              throw errors.forbidden("API key is missing the required scope");
            void container.core.apiKeys
              .recordUsage(key.actor.apiKeyId)
              .catch((error: unknown) =>
                container.logger.warn({ err: error }, "api usage tracking failed"),
              );
          }

          const data = await withSpan(
            `REST ${route.method} /api/v1${route.pattern}`,
            { "http.request.method": route.method, "http.route": `/api/v1${route.pattern}` },
            () =>
              route.handler({
                request,
                params,
                query: new URL(request.url).searchParams,
                key,
                container,
                clientIp,
              }),
          );
          if (route.status === 204)
            return new Response(null, { status: 204, headers: baseHeaders });
          return Response.json({ data }, { status: route.status ?? 200, headers: baseHeaders });
        } catch (error) {
          reportError(container.logger, error, { path, method: request.method });
          return errorResponse(error, requestId, baseHeaders);
        }
      });
    },
  };
}

export type RestApi = ReturnType<typeof createRestApi>;
