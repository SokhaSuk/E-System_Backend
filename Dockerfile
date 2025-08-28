# -----------------------------
# Builder stage
# -----------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev) to build TypeScript
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application (outputs to dist)
RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
	&& adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/server.js"]
