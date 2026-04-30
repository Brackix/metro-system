# ==============================================================================
# Metro App Backend — Express + Prisma + TypeScript
#
# Usage via compose:  ./build.sh   (starts db + backend together)
# Standalone:         docker build -t metro-backend .
#                     docker run --env-file .env -p 4000:4000 metro-backend
# ==============================================================================

# ── Stage 1: Build ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install OpenSSL (required by Prisma engine binaries)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency manifests & prisma schema first (layer caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Production ────────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests & prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Re-generate Prisma client for the production image
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# ── Environment variables (defaults from .env.example) ──────────────────────────
# These are defaults — override via compose environment or --env-file
ENV DB_USER=postgres \
    DB_PASSWORD=Brackix123 \
    DB_HOST=metro_postgres_db \
    DB_PORT=5432 \
    DB_NAME=metroapp \
    PORT=4000 \
    FRONTEND_URL=http://localhost:3000 \
    NODE_ENV=production

# Prisma needs DATABASE_URL at runtime — compose from individual vars at startup
ENV DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Switch to non-root user
USER appuser

# Expose the API port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:${PORT}/api/stations').then(r => { if (!r.ok) throw new Error(); process.exit(0); }).catch(() => process.exit(1))"

# Start the server — sync schema first, then launch
CMD sh -c 'export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public" && npx prisma db push --skip-generate && node dist/index.js'