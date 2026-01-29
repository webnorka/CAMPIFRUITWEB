# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN ls -la
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/package*.json ./
RUN npm install --omit=dev
EXPOSE 3001
CMD ["node", "server.js"]
