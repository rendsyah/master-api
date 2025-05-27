# Use base image (alpine) for development stage
FROM node:22.14.0-alpine AS development
# Set the working directory
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy all file to workdir
COPY . .

# Use base image (alpine) for builder stage
FROM node:22.14.0-alpine AS builder
# Set the working directory
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy all file to workdir
COPY . .
# Build service
RUN npm run build

# Use base image (alpine) for deps stage
FROM node:22.14.0-alpine AS deps
# Set the working directory
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm ci --omit=dev --ignore-scripts

# Use base image (alpine) for production stage
FROM node:22.14.0-alpine AS production
# Set the working directory
WORKDIR /vol/app
# Install curl for healthcheck
RUN apk add --no-cache curl
# Copy dependencies and the compiled application
COPY --from=builder /vol/app/dist ./dist
COPY --from=deps /vol/app/node_modules ./node_modules

# Arguments and Environment Variables
ARG API_PORT
ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

# Check container health by pinging the /api/v1/health endpoint.
# Marks the container unhealthy if the check fails.
HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
CMD curl -f http://localhost:${API_PORT}/api/v1/health || exit 1

# Execute command
CMD ["node", "dist/main"]