# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app
# Note the 'app/' prefix for source files to support root context
COPY app/package*.json ./
RUN npm install --legacy-peer-deps
COPY app/ .

# Supabase public (anon) keys — baked into frontend at build time
ENV VITE_SUPABASE_URL=https://fopjqjoxwelmrrfowbmv.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcGpxam94d2VsbXJyZm93Ym12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzMyNzcsImV4cCI6MjA4NDk0OTI3N30.W_wlLjJN8JetGJbbtO0gTmioMGk_nweFByShjsVFOgs

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
