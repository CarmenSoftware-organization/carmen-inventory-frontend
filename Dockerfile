FROM node:20-slim AS base
RUN npm install -g bun

# ─── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else bun install; fi

# ─── Builder ─────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Server-only (used at build time for API proxy config)
ARG BACKEND_URL
ARG X_APP_ID
ENV BACKEND_URL=$BACKEND_URL
ENV X_APP_ID=$X_APP_ID

# Public (inlined into JS bundle at build time by Next.js)
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_X_APP_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_X_APP_ID=$NEXT_PUBLIC_X_APP_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

RUN if [ -f bun.lock ]; then bun run build; \
    else npm run build; fi

# ─── Runner ──────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Server-only runtime env (can be overridden by docker-compose environment)
ARG BACKEND_URL
ARG X_APP_ID
ENV BACKEND_URL=$BACKEND_URL
ENV X_APP_ID=$X_APP_ID

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
