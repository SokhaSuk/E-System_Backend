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
COPY services/grade ./services/grade

# Install dependencies
RUN npm install

# Build shared library
RUN npm run build --workspace=@e-system/shared

# Build service
RUN npm run build --workspace=@e-system/grade-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/grade ./services/grade
COPY --from=builder /app/tsconfig.base.json ./

# Expose port
EXPOSE 4005

# Start the service
CMD ["node", "services/grade/dist/server.js"]
