# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy tsconfig base
COPY tsconfig.base.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy service source
COPY services/auth ./services/auth

# Install dependencies
RUN npm install

# Build shared library
RUN npm run build --workspace=@e-system/shared

# Build service
RUN npm run build --workspace=@e-system/auth-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/auth ./services/auth
COPY --from=builder /app/tsconfig.base.json ./

# Expose port
EXPOSE 4001

# Start the service
CMD ["node", "services/auth/dist/server.js"]
