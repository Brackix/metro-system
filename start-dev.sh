#!/usr/bin/env bash
# ==============================================================================
# start-dev.sh — Start Metro dev servers for both Expo apps
#
# Run this AFTER:
#   1. ./build.sh           (infrastructure is running)
#   2. ./build-apks.sh      (dev APKs installed on device)
#
# This starts Metro bundlers so the dev APKs get hot reload.
# Press Ctrl+C to stop both servers.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

API_PORT="${API_PORT:-4000}"
METRO_PORT="${METRO_PORT:-8081}"
NFC_PORT="${NFC_PORT:-8082}"

# ── Detect local network IP ─────────────────────────────────────────────────────
detect_local_ip() {
    local ip=""
    if command -v ip &>/dev/null; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
    fi
    if [[ -z "$ip" ]] && command -v hostname &>/dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    if [[ -z "$ip" ]] && command -v ifconfig &>/dev/null; then
        ip=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | sed 's/addr://')
    fi
    echo "${ip:-localhost}"
}

LOCAL_IP=$(detect_local_ip)

echo "============================================================"
echo "  🚇  Metro System — Expo Dev Servers"
echo "============================================================"
echo ""
echo "  📡  Local IP:    ${LOCAL_IP}"
echo "  🌐  API_URL:     http://${LOCAL_IP}:${API_PORT}/api"
echo ""
echo "  Dev servers:"
echo "    • metro-app       → port ${METRO_PORT}"
echo "    • NFC receiver    → port ${NFC_PORT}"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""
echo "============================================================"
echo ""

# ── Trap to kill both processes on Ctrl+C ────────────────────────────────────────
cleanup() {
    echo ""
    echo "🛑  Stopping dev servers..."
    kill $METRO_PID $NFC_PID 2>/dev/null || true
    wait $METRO_PID $NFC_PID 2>/dev/null || true
    echo "✅  All dev servers stopped."
}
trap cleanup EXIT INT TERM

# ── Write .env for metro-app ─────────────────────────────────────────────────────
echo "API_URL=http://${LOCAL_IP}:${API_PORT}/api" > "$SCRIPT_DIR/metro-app/.env"

# ── Start metro-app dev server ───────────────────────────────────────────────────
echo "🚀  Starting metro-app dev server on port ${METRO_PORT}..."
if [[ ! -d "$SCRIPT_DIR/metro-app/node_modules" ]]; then
    echo "  📦  Installing metro-app dependencies..."
    (cd "$SCRIPT_DIR/metro-app" && npm install --legacy-peer-deps)
fi
(cd "$SCRIPT_DIR/metro-app" && npx expo start --dev-client --port "$METRO_PORT") &
METRO_PID=$!

# ── Start NFC receiver dev server ────────────────────────────────────────────────
echo "🚀  Starting NFC receiver dev server on port ${NFC_PORT}..."
if [[ ! -d "$SCRIPT_DIR/metroapp-phoneNFChandle/node_modules" ]]; then
    echo "  📦  Installing NFC receiver dependencies..."
    (cd "$SCRIPT_DIR/metroapp-phoneNFChandle" && npm install)
fi
(cd "$SCRIPT_DIR/metroapp-phoneNFChandle" && npx expo start --dev-client --port "$NFC_PORT") &
NFC_PID=$!

# ── Wait for both ────────────────────────────────────────────────────────────────
wait $METRO_PID $NFC_PID
