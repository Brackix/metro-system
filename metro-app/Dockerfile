# ==============================================================================
# Expo Android APK Builder
# Builds a production .apk inside Docker — no local Android SDK required.
#
# Usage (recommended — auto-detects your local IP):
#   ./build-android.sh
#
# Manual usage:
#   docker build --build-arg API_URL=http://<YOUR_IP>:4000/api -t metro-app-android .
#   docker run --rm -v $(pwd)/build-output:/output metro-app-android
#
# The final APK will be copied to ./build-output/ on the host.
# ==============================================================================

# ── Stage 1: Android build environment ──────────────────────────────────────────
FROM node:20-bookworm AS builder

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# ── System dependencies ─────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    wget \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# ── Java environment ────────────────────────────────────────────────────────────
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# ── Android SDK ─────────────────────────────────────────────────────────────────
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

# Download and install Android command-line tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
    unzip -q cmdline-tools.zip && \
    mv cmdline-tools latest && \
    rm cmdline-tools.zip

# Accept all SDK licenses
RUN yes | sdkmanager --licenses > /dev/null 2>&1

# Install required SDK packages
# - platform-tools: adb, fastboot
# - platforms;android-35: target API for Expo SDK 54 / RN 0.81
# - build-tools;35.0.0: compile & package
# - ndk;27.1.12297006: native code compilation (required by react-native 0.81)
RUN sdkmanager --install \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;27.1.12297006"

# ── Build argument: local network IP for API_URL ───────────────────────────────
# Pass at build time:  --build-arg API_URL=http://192.168.x.x:4000/api
# The build-android.sh script does this automatically.
ARG API_URL=http://localhost:4000/api

# ── App workspace ───────────────────────────────────────────────────────────────
WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY .npmrc package.json package-lock.json ./

# Install JS dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Write the .env with the injected API_URL
RUN echo "API_URL=${API_URL}" > .env && \
    echo "🌐 API_URL baked into APK: ${API_URL}"

# ── Generate native android project if not present ──────────────────────────────
RUN npx expo prebuild --platform android --no-install

# ── Gradle: build the release APK ──────────────────────────────────────────────
WORKDIR /app/android

# Give Gradle wrapper execute permission
RUN chmod +x ./gradlew

# Build the release APK
RUN ./gradlew assembleRelease \
    --no-daemon \
    -Dorg.gradle.jvmargs="-Xmx4g -XX:+HeapDumpOnOutOfMemoryError"

# ── Stage 2: Slim output image ─────────────────────────────────────────────────
FROM alpine:3.20 AS output

RUN apk add --no-cache bash

# Copy the built APK from the builder stage
COPY --from=builder /app/android/app/build/outputs/apk/release/*.apk /apk/

# Create an output directory for easy volume-mount extraction
RUN mkdir -p /output

# Default: copy APK to /output so the user can volume-mount it
CMD ["sh", "-c", "cp /apk/*.apk /output/ && echo '✅ APK copied to /output/' && ls -lh /output/"]
