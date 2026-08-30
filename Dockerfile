# Dockerfile — put this at the root of rzv-client / rzv-pro / rzv-admin
# Requires next.config.js to have:  output: 'standalone'

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci; fi

FROM node:20-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* are inlined into the browser bundle at BUILD time. Setting them
# in the server's .env changes nothing — without them the Google button is
# hidden and any browser-side API call falls back to localhost.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL     NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL     NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL     NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Server-side fetches during the build (generateStaticParams, sitemap) need this.
ARG API_URL
ENV API_URL=$API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]