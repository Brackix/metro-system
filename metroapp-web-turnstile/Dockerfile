# ==============================================================================
# Web Turnstile — Express server with static frontend
#
# Self-contained: the frontend polls its own /api/estado endpoint (relative),
# and NFC apps POST to /api/validar. No external API URL needed.
#
# Usage via compose:  ./build.sh
# Standalone:         docker build -t web-turnstile .
#                     docker run -p 5000:5000 web-turnstile
# ==============================================================================

FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
