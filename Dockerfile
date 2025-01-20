# Use base image (alpine) for development stage
FROM node:18.18.0-alpine AS development
# Set the working directory
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy all file to workdir
COPY . .
# Build service
RUN npm run build

# Use base image (alpine) for production stage
FROM node:18.18.0-alpine AS production
# Set the working directory
WORKDIR /vol/app
# Copy only *.json to leverage docker caching
COPY package*.json ./
# Install dependencies
RUN npm ci --omit=dev
# Copy dependencies and the compiled application
COPY --from=development /vol/app/dist ./dist
COPY --from=development /vol/app/node_modules ./node_modules
# Set NODE ENV to production
ENV NODE_ENV production
# Expose port service
EXPOSE 5000
# Execute command
CMD ["node", "dist/main"]