# syntax=docker/dockerfile:1.7
# OlnkTR web application (Next.js standalone output). Multi-stage, non-root.

ARG NODE_VERSION=24.22.2
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.34.9 && apk add --no-cache libc6-compat

# --- dependencies (cached by lockfile only) ---------------------------------
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile

# --- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --frozen-lockfile
ARG NEXT_PUBLIC_DEFAULT_LOCALE=en
ENV NODE_ENV=production NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE}
RUN pnpm --filter @olnktr/web build

# --- runtime ----------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache tini && addgroup -S -g 1001 olnktr && adduser -S -u 1001 -G olnktr olnktr
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=olnktr:olnktr /app/apps/web/.next/standalone ./
COPY --from=build --chown=olnktr:olnktr /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=olnktr:olnktr /app/apps/web/public ./apps/web/public
USER olnktr
EXPOSE 3000
STOPSIGNAL SIGTERM
# tini forwards signals and reaps zombies; Next.js shuts down gracefully on SIGTERM.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
