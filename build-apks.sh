#!/usr/bin/env bash
# ==============================================================================
# build-apks.sh — Build Expo development APKs for Android
#
# Builds debug APKs for both mobile apps:
#   1. metro-app          (main passenger app)
#   2. metroapp-phoneNFChandle  (NFC receiver app)
#
# Prerequisites:
#   • Android SDK installed (ANDROID_HOME set)
#   • Java 17+
#   • Node.js 20+
#
# After building, install the APKs on your device and use ./start-dev.sh
# to start the Metro dev servers for hot reload.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

API_PORT="${API_PORT:-4000}"

# ── Check prerequisites ─────────────────────────────────────────────────────────
check_prereqs() {
    local missing=0

    if [[ -z "${ANDROID_HOME:-}" ]] && [[ -z "${ANDROID_SDK_ROOT:-}" ]]; then
        echo "❌  ANDROID_HOME is not set. Install the Android SDK and set ANDROID_HOME."
        missing=1
    fi

    if ! command -v java &>/dev/null; then
        echo "❌  Java not found. Install JDK 17+."
        missing=1
    fi

    if ! command -v node &>/dev/null; then
        echo "❌  Node.js not found. Install Node.js 20+."
        missing=1
    fi

    if [[ $missing -eq 1 ]]; then
        echo ""
        echo "Install missing prerequisites and try again."
        exit 1
    fi
}

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
echo "  🚇  Metro System — Build Development APKs"
echo "============================================================"
echo ""

check_prereqs

# ── Build metro-app ──────────────────────────────────────────────────────────────
build_metro_app() {
    echo "──────────────────────────────────────────────────────────────"
    echo "  📱  Building: metro-app (main passenger app)"
    echo "──────────────────────────────────────────────────────────────"
    echo ""

    cd "$SCRIPT_DIR/metro-app"

    # Write .env with API_URL pointing to local backend
    echo "API_URL=http://${LOCAL_IP}:${API_PORT}/api" > .env
    echo "  🌐  API_URL: http://${LOCAL_IP}:${API_PORT}/api"
    echo ""

    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        echo "  📦  Installing dependencies..."
        npm install --legacy-peer-deps
    fi

    # Build the development APK
    echo "  🔨  Building debug APK (targeting connected device)..."
    npx expo run:android --device

    echo ""
    echo "  ✅  metro-app APK built successfully!"
    echo ""
}

# ── Build NFC receiver ───────────────────────────────────────────────────────────
build_nfc_app() {
    echo "──────────────────────────────────────────────────────────────"
    echo "  📱  Building: NFC Receiver app"
    echo "──────────────────────────────────────────────────────────────"
    echo ""

    cd "$SCRIPT_DIR/metroapp-phoneNFChandle"

    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        echo "  📦  Installing dependencies..."
        npm install
    fi

    # Build the development APK
    echo "  🔨  Building debug APK (targeting connected device)..."
    npx expo run:android --device

    echo ""
    echo "  ✅  NFC Receiver APK built successfully!"
    echo ""
}

# ── Main ─────────────────────────────────────────────────────────────────────────
APP="${1:-all}"

case "$APP" in
    metro-app)
        build_metro_app
        ;;
    nfc)
        build_nfc_app
        ;;
    all)
        build_metro_app
        build_nfc_app
        ;;
    *)
        echo "Usage: $0 [metro-app|nfc|all]"
        echo "  metro-app  — Build only the main passenger app"
        echo "  nfc        — Build only the NFC receiver app"
        echo "  all        — Build both (default)"
        exit 1
        ;;
esac

echo "============================================================"
echo "  🎉  All APKs built! Install them on your device, then run:"
echo "       ./start-dev.sh"
echo "============================================================"
