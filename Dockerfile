# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/
COPY shared/package.json shared/
RUN npm install
COPY . .
RUN npm run build --workspace=client && npm run build --workspace=server

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
RUN npm install --omit=dev
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist
COPY --from=build /app/attached_assets attached_assets
ENV NODE_ENV=production
EXPOSE 5000
HEALTHCHECK CMD curl -f http://localhost:5000/api/health || exit 1
CMD ["node", "server/dist/index.js"]
