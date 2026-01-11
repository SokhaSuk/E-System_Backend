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
COPY services/user ./services/user

# Install dependencies
RUN npm install

# Build shared library
RUN npm run build --workspace=@e-system/shared

# Build service
RUN npm run build --workspace=@e-system/user-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/user ./services/user
COPY --from=builder /app/tsconfig.base.json ./

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 4002

# Start the service
CMD ["node", "services/user/dist/server.js"]
