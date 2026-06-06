# syntax=docker/dockerfile:1
#
# Multi-stage build for the Next.js + tRPC + Prisma app, tuned for Fly.io.
# Debian-slim (not Alpine) so Prisma's native query engine "just works"
# (Alpine/musl needs extra binaryTargets). pnpm comes via corepack.

# ---- base: shared runtime deps -------------------------------------------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
# openssl: required by Prisma's query engine at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ---- deps: install node_modules (cached on lockfile changes) --------------
FROM base AS deps
# .npmrc carries fetch-timeout/retry + network-concurrency tuning for flaky nets.
# pnpm-workspace.yaml carries the `onlyBuiltDependencies` allow-list — without it
# pnpm 11's strictDepBuilds aborts the install (ERR_PNPM_IGNORED_BUILDS).
# prisma/ is copied because `postinstall` runs `prisma generate`.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY prisma ./prisma
# Cache-mount the pnpm store so partial downloads survive across build attempts.
ENV npm_config_store_dir=/pnpm/store
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile

# ---- build: compile the Next.js app --------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
# DATABASE_URL isn't available at build time; env.js validation is skipped here
# and runs for real when the server boots with the injected DATABASE_URL.
ENV SKIP_ENV_VALIDATION=1 NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- runner: the image Fly actually runs ---------------------------------
FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Copy the whole built app (incl. node_modules + prisma CLI) so the Fly
# release_command can run `prisma db push` and `next start` works as-is.
COPY --from=build /app ./
EXPOSE 3000
CMD ["pnpm", "start"]
