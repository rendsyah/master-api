# ====================================================
# BASE IMAGE WITH PNPM
# ====================================================
FROM node:22.16.0-alpine AS base

# Enable Corepack and activate the latest pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ====================================================
# BUILDER STAGE
# ====================================================
FROM base AS builder
WORKDIR /vol/app

# Copy package.json and lockfile first to leverage Docker layer cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Build the application
RUN pnpm run build

# ====================================================
# RUNTIME DEPENDENCIES STAGE
# ====================================================
FROM base AS runtime-deps
WORKDIR /vol/app

# Copy package manifest and lockfile
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies and skip postinstall scripts
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# ====================================================
# FINAL PRODUCTION IMAGE
# ====================================================
FROM node:22.16.0-alpine AS production
WORKDIR /vol/app

# Install curl for container health check
RUN apk add --no-cache curl

# Copy compiled application and runtime dependencies
COPY --from=builder /vol/app/dist ./dist
COPY --from=runtime-deps /vol/app/node_modules ./node_modules

# Copy the entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Environment variable and exposed port
ARG API_PORT
ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

# Health check to verify service availability
HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${API_PORT}/api/v1/health || exit 1

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]