# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci --production=false
RUN cd client && npm ci

# Copy source
COPY server/ ./server/
COPY client/ ./client/

# Build server
RUN cd server && npm run build

# Build client
RUN cd client && npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy server build
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules

# Copy client build (served by Express in production)
COPY --from=builder /app/client/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]
