# ==============================================================================
# Metro App Dashboard — Next.js 15
#
# Usage via compose:  ./build.sh
# Standalone:         docker build --build-arg NEXT_PUBLIC_API_URL=http://<IP>:4000/api -t metro-dashboard .
#                     docker run -p 3000:3000 metro-dashboard
# ==============================================================================

# ── Stage 1: Build ──────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Next.js needs NEXT_PUBLIC_* vars at build time (they get inlined into the JS bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the production bundle
RUN npm run build

# ── Stage 2: Production ────────────────────────────────────────────────────────
FROM node:22-slim AS production

WORKDIR /app

# Copy the standalone output + static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
