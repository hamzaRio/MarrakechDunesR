# --- Build Stage ---
FROM node:20-slim AS build
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package.json* ./shared/ 2>/dev/null || true

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

# Start the server
CMD ["node", "server/dist/index.js"]