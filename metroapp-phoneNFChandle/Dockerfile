# ==============================================================================
# NFC Receiver — Expo Android APK Builder
# Builds a production .apk inside Docker — no env vars needed.
#
# Usage via compose:  ./build.sh
# Standalone:         docker build -t nfc-receiver .
#                     docker run --rm -v $(pwd)/build-output:/output nfc-receiver
# ==============================================================================

# ── Stage 1: Android build environment ──────────────────────────────────────────
FROM node:20-bookworm AS builder

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

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
    unzip -q cmdline-tools.zip && \
    mv cmdline-tools latest && \
    rm cmdline-tools.zip

RUN yes | sdkmanager --licenses > /dev/null 2>&1

RUN sdkmanager --install \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;27.1.12297006"

# ── App workspace ───────────────────────────────────────────────────────────────
WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json ./

# Install JS dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# ── Generate native android project ────────────────────────────────────────────
RUN npx expo prebuild --platform android --no-install

# ── Gradle: build the release APK ──────────────────────────────────────────────
WORKDIR /app/android

RUN chmod +x ./gradlew

RUN ./gradlew assembleRelease \
    --no-daemon \
    -Dorg.gradle.jvmargs="-Xmx4g -XX:+HeapDumpOnOutOfMemoryError"

# ── Stage 2: Slim output image ─────────────────────────────────────────────────
FROM alpine:3.20 AS output

RUN apk add --no-cache bash

COPY --from=builder /app/android/app/build/outputs/apk/release/*.apk /apk/

RUN mkdir -p /output

CMD ["sh", "-c", "cp /apk/*.apk /output/ && echo '✅ NFC Receiver APK copied to /output/' && ls -lh /output/"]
