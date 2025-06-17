# Base Image 22.16.0-alpine
FROM node:22.16.0-alpine AS base

# Use base image (alpine) for builder stage
FROM base AS builder
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy all file to workdir
COPY . .
# Build service
RUN npm run build

# Use base image (alpine) for runtime-deps stage
FROM base AS runtime-deps
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm ci --omit=dev --ignore-scripts

# Use base image (alpine) for production stage
FROM base AS production
WORKDIR /vol/app
# Install curl for healthcheck
RUN apk add --no-cache curl
# Copy dependencies and the compiled application
COPY --from=builder /vol/app/dist ./dist
COPY --from=runtime-deps /vol/app/node_modules ./node_modules

# Arguments and environment variables
ARG API_PORT
ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

# Check container health by pinging the /api/v1/health endpoint.
# Marks the container unhealthy if the check fails.
HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
CMD curl -f http://localhost:${API_PORT}/api/v1/health || exit 1

# Copy the entrypoint script into the image.
# Ensure the entrypoint script is executable.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use the script as the container entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]