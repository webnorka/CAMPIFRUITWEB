# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine as production-stage
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/src/data ./src/data
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/package*.json ./
RUN npm install --production
EXPOSE 3001
CMD ["node", "server.js"]
