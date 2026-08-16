# =========================================================
# Client (Vite + React SPA) — Production Dockerfile
# =========================================================

# ---- Stage 1: deps ----
# Install dependencies only — cached separately so code changes
# don't force a full node_modules reinstall.
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Stage 2: build ----
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env (baked into the static bundle by Vite)
ARG VITE_API_URL=/api/v1/
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

# ---- Stage 3: runtime ----
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run as non-root
RUN addgroup -g 1001 -S appgroup \
    && adduser -S appuser -u 1001 -G appgroup \
    && chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]


