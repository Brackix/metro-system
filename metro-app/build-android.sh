#!/usr/bin/env bash
# ==============================================================================
# build-android.sh — Auto-detect local IP and build the Expo Android APK
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

API_PORT="${API_PORT:-4000}"
IMAGE_NAME="${IMAGE_NAME:-metro-app-android}"
OUTPUT_DIR="${OUTPUT_DIR:-./build-output}"

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

    # Fallback
    if [[ -z "$ip" ]]; then
        echo "localhost"
    else
        echo "$ip"
    fi
}

LOCAL_IP=$(detect_local_ip)
API_URL="http://${LOCAL_IP}:${API_PORT}/api"

echo "============================================================"
echo "  🏗️  Metro App — Android APK Builder"
echo "============================================================"
echo ""
echo "  📡  Detected local IP:  ${LOCAL_IP}"
echo "  🌐  API_URL:            ${API_URL}"
echo "  📦  Docker image:       ${IMAGE_NAME}"
echo "  📂  Output directory:   ${OUTPUT_DIR}"
echo ""
echo "============================================================"
echo ""

# ── Build the Docker image ───────────────────────────────────────────────────────
echo "🔨 Building Docker image..."
docker build \
    --build-arg API_URL="${API_URL}" \
    -t "${IMAGE_NAME}" \
    .

echo ""
echo "✅ Image built successfully!"
echo ""

# ── Extract the APK ──────────────────────────────────────────────────────────────
mkdir -p "${OUTPUT_DIR}"

echo "📲 Extracting APK..."
docker run --rm -v "$(pwd)/${OUTPUT_DIR}:/output" "${IMAGE_NAME}"

echo ""
echo "============================================================"
echo "  ✅  Done! APK is ready at:"
echo "      ${OUTPUT_DIR}/"
ls -lh "${OUTPUT_DIR}"/*.apk 2>/dev/null || echo "      (check the output directory)"
echo ""
echo "  📡  This APK connects to: ${API_URL}"
echo "============================================================"
