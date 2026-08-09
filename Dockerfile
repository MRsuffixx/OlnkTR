# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.13.0
ARG PNPM_VERSION=11.9.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

ARG PNPM_VERSION

ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:${PATH}

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates dumb-init openssl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global "pnpm@${PNPM_VERSION}"

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN --mount=type=cache,id=olnktr-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-timeout 120000 \
    && pnpm config set network-concurrency 8 \
    && pnpm install --frozen-lockfile

FROM dependencies AS source

# Prisma only needs a syntactically valid URL while generating the client.
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

COPY . .

RUN pnpm db:generate

FROM source AS migrator

CMD ["pnpm", "db:migrate"]

FROM source AS builder

ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    SKIP_ENV_VALIDATION=1

RUN pnpm build

FROM base AS runner

ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
