#!/usr/bin/env bash
# ==============================================================================
# build.sh — Auto-detect local IP → build & start the Metro System infrastructure
#
# This starts ONLY the infrastructure services:
#   • PostgreSQL database
#   • Backend API (Express + Prisma)
#   • Dashboard (Next.js)
#   • Web Turnstile
#
# For Expo mobile apps, see:
#   ./build-apks.sh   — build development APKs (one-time)
#   ./start-dev.sh    — start Metro dev servers for hot reload
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

API_PORT="${API_PORT:-4000}"

# ── Detect local network IP ─────────────────────────────────────────────────────
detect_local_ip() {
    local ip=""

    # Method 1: ip route (most reliable on Linux)
    if command -v ip &>/dev/null; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
    fi

    # Method 2: hostname -I (Linux fallback)
    if [[ -z "$ip" ]] && command -v hostname &>/dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    # Method 3: ifconfig (macOS / older Linux)
    if [[ -z "$ip" ]] && command -v ifconfig &>/dev/null; then
        ip=$(ifconfig 2>/dev/null \
            | grep 'inet ' \
            | grep -v '127.0.0.1' \
            | head -1 \
            | awk '{print $2}' \
            | sed 's/addr://')
    fi

    if [[ -z "$ip" ]]; then
        echo "localhost"
    else
        echo "$ip"
    fi
}

LOCAL_IP=$(detect_local_ip)
export API_URL="http://${LOCAL_IP}:${API_PORT}/api"

echo "============================================================"
echo "  🚇  Metro System — Infrastructure Services"
echo "============================================================"
echo ""
echo "  📡  Detected local IP:  ${LOCAL_IP}"
echo "  🌐  API_URL:            ${API_URL}"
echo ""
echo "  Services starting:"
echo "    • PostgreSQL         → localhost:5432"
echo "    • Backend API        → localhost:${API_PORT}"
echo "    • Dashboard          → localhost:3000"
echo "    • Turnstile          → localhost:5000"
echo ""
echo "  📱  For mobile apps, run separately:"
echo "    • ./build-apks.sh    (one-time: build & install dev APKs)"
echo "    • ./start-dev.sh     (start Metro dev servers)"
echo ""
echo "============================================================"
echo ""

# ── Build & start infrastructure ─────────────────────────────────────────────────
docker compose up --build "$@"
