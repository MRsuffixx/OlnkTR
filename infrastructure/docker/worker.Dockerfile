# syntax=docker/dockerfile:1.7
# OlnkTR background worker + migration runner. Multi-stage, non-root.

ARG NODE_VERSION=24.22.2
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN npm install -g pnpm@10.34.9

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile

FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --frozen-lockfile
# Bundle workspace sources (esbuild) and install only third-party production deps, flat.
RUN pnpm --filter @olnktr/worker build \
 && pnpm --filter @olnktr/worker deploy --prod --legacy --config.node-linker=hoisted /out \
 && cp -r apps/worker/dist /out/dist

FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache tini && addgroup -S -g 1001 olnktr && adduser -S -u 1001 -G olnktr olnktr
WORKDIR /app
ENV NODE_ENV=production WORKER_HEALTH_HOST=0.0.0.0
COPY --from=build --chown=olnktr:olnktr /out/node_modules ./node_modules
COPY --from=build --chown=olnktr:olnktr /out/package.json ./package.json
COPY --from=build --chown=olnktr:olnktr /out/dist ./dist
USER olnktr
EXPOSE 3101
STOPSIGNAL SIGTERM
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
