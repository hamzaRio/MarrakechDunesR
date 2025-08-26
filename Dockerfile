# --- Build Stage ---
FROM node:20-slim AS build
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package.json ./shared/

# Configure npm for better reliability
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install all dependencies including dev dependencies with robust retry
RUN for i in 1 2 3; do \
        echo "Attempt $i of 3: Installing dependencies..." && \
        npm ci --legacy-peer-deps --prefer-offline --no-audit && break || \
        (echo "Attempt $i failed, cleaning cache and retrying..." && \
         npm cache clean --force && \
         sleep $((i * 5))); \
    done

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

# Configure npm for better reliability
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install only production dependencies with robust retry
RUN for i in 1 2 3; do \
        echo "Attempt $i of 3: Installing production dependencies..." && \
        npm ci --omit=dev --legacy-peer-deps --prefer-offline --no-audit && break || \
        (echo "Attempt $i failed, cleaning cache and retrying..." && \
         npm cache clean --force && \
         sleep $((i * 5))); \
    done

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