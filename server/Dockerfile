# Build server
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY shared/package*.json shared/
RUN npm install --workspace=server --workspace=shared
COPY server server
COPY shared shared
RUN npm run build --workspace=server

# Production image
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
RUN npm install --omit=dev --workspace=server
COPY --from=build /app/server/dist server/dist
ENV NODE_ENV=production
WORKDIR /app/server
EXPOSE 5000
CMD ["node", "dist/index.js"]
