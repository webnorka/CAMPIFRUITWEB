# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app
# Note the 'app/' prefix for source files to support root context
COPY app/package*.json ./
RUN npm install --legacy-peer-deps
COPY app/ .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Production stage
FROM node:20-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
EXPOSE 3001
CMD ["node", "server.js"]
