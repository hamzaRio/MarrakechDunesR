# --- Build Stage ---
FROM node:20-slim AS build
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package.json* ./shared/

# Install all dependencies including dev dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build both client and server
RUN npm run build --workspace=client
RUN npm run build --workspace=server

# --- Production Stage ---
FROM node:20-slim AS prod
WORKDIR /app

# Install curl for health checks and clean cache
RUN apt-get update && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files for production dependencies
COPY --from=build /app/package*.json ./
COPY --from=build /app/server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built artifacts
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/attached_assets ./attached_assets

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "server/dist/index.js"]