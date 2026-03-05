# 🚇 Metro System

A complete metro/transit system composed of multiple services — a mobile app for passengers, an admin dashboard, a backend API, an NFC handler, and a web turnstile interface.

---

## 📁 Project Structure

```
metro-system/
├── metro-app/                  # 📱 Passenger mobile app (Expo / React Native)
├── metro-app-backend/          # ⚙️  REST API backend (Express + Prisma + TypeScript)
├── metro-app-dashboard/        # 🖥️  Admin dashboard (Next.js)
├── metroapp-phoneNFChandle/    # 📡 NFC reader companion app (Expo)
├── metroapp-web-turnstile/     # 🚪 Web-based turnstile interface (Node.js)
├── compose.yml                 # 🐳 Docker Compose — orchestrates all services
├── build.sh                    # 🔨 One-command build script (auto-detects local IP)
├── .env.example                # 📋 Environment variable template
└── VERSIONS.md                 # 📌 Component version tracking
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Docker](https://docs.docker.com/get-docker/) | ≥ 24.0 | Container runtime |
| [Docker Compose](https://docs.docker.com/compose/) | ≥ 2.20 | Service orchestration |
| Bash | ≥ 4.0 | Build scripts |

> [!IMPORTANT]
> Make sure Docker has at least **6 GB of RAM** allocated. The Android APK build (Gradle) needs ~4 GB of heap.
> Check this in **Docker Desktop → Settings → Resources**.

### 1. Clone the repository

```bash
git clone https://github.com/Brackix/metro-system.git
cd metro-system
```

### 2. Build & run everything

```bash
./build.sh
```

That's it. This single command will:

1. **Auto-detect** your machine's local network IP (e.g. `192.168.20.30`)
2. **Start PostgreSQL** and wait until it's healthy
3. **Start the backend API** (Express + Prisma) on port `4000`, connected to the database
4. **Start the dashboard** (Next.js) on port `3000`
5. **Build the Expo Android APK** with `API_URL=http://<your-ip>:4000/api` baked in
6. **Output the APK** to a Docker volume for extraction

To run in **detached mode** (background):

```bash
./build.sh -d
```

---

## 🐳 Docker Compose

### Services

| Service | Image / Build | Container Name | Ports | Description |
|---------|---------------|----------------|-------|-------------|
| `db` | `postgres:16` | `metro_postgres_db` | `5432` | PostgreSQL database |
| `backend` | Built from `./metro-app-backend/Dockerfile` | `metro_backend` | `4000` | REST API (Express + Prisma) |
| `dashboard` | Built from `./metro-app-dashboard/Dockerfile` | `metro_dashboard` | `3000` | Admin dashboard (Next.js) |
| `metro-app` | Built from `./metro-app/Dockerfile` | `metro_app_builder` | — | Builds the passenger Android APK |
| `turnstile` | Built from `./metroapp-web-turnstile/Dockerfile` | `metro_turnstile` | `5000` | Web turnstile interface |
| `nfc-receiver` | Built from `./metroapp-phoneNFChandle/Dockerfile` | `metro_nfc_builder` | — | Builds the NFC receiver APK |

### Commands

```bash
# Build and start all services
./build.sh

# Build and start in background
./build.sh -d

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v

# Rebuild a specific service
docker compose build backend        # just the backend
docker compose build metro-app      # just the APK builder

# View logs
docker compose logs -f
docker compose logs -f backend       # just the backend API
docker compose logs -f metro-app     # just the app builder
docker compose logs -f db            # just the database
```

### Extracting the APK

After the build completes, extract the APK from the container:

```bash
# Copy from the container to your host
docker cp metro_app_builder:/output/ ./metro-app/build-output/

# Or use the standalone build script (also auto-detects IP)
cd metro-app && ./build-android.sh
```

The APK can be sideloaded directly onto any Android device.

---

## 🌐 Automatic IP Detection

A core feature of this setup is that the **local network IP is auto-detected** every time you build, so the mobile app always points to the correct backend URL.

### How it works

```
build.sh (host)
  │
  ├─ Detects local IP via:
  │    1. ip route get 1.1.1.1    (Linux — most reliable)
  │    2. hostname -I              (Linux fallback)
  │    3. ifconfig                 (macOS / older Linux)
  │
  ├─ Exports API_URL=http://<detected-ip>:4000/api
  │
  └─ docker compose up --build
       │
       └─ compose.yml passes ${API_URL} as a build arg
            │
            └─ Dockerfile writes API_URL to .env
                 │
                 └─ react-native-dotenv bakes it into the JS bundle
                      │
                      └─ Final APK connects to http://<your-ip>:4000/api
```

### Override the IP manually

If auto-detection picks the wrong interface, override it:

```bash
# Via environment variable
API_URL=http://10.0.0.5:4000/api ./build.sh

# Or change the port
API_PORT=8080 ./build.sh

# Or pass directly to docker compose
API_URL=http://10.0.0.5:4000/api docker compose up --build
```

---

## ⚙️ Environment Variables

### Root `.env.example`

Copy and configure:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://192.168.20.30:4000/api` | Backend URL for the mobile app |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `Brackix123` | PostgreSQL password |
| `DB_HOST` | `100.89.126.5` | Database host (Tailscale IP or `localhost`) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `metroapp` | Database name |
| `PORT` | `4000` | Backend API port |
| `FRONTEND_URL` | `http://localhost:3000` | Dashboard URL (for CORS) |
| `DATABASE_URL` | *(composed)* | Prisma connection string |

### Build script variables

These can be set when running `build.sh` or `build-android.sh`:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | `4000` | Port appended to the detected IP |
| `API_URL` | *(auto-detected)* | Full override — skips IP detection |
| `IMAGE_NAME` | `metro-app-android` | Docker image name |
| `OUTPUT_DIR` | `./build-output` | Where to save the APK (standalone script only) |

---

## 📱 Metro App (Mobile)

**Location:** `metro-app/`
**Tech:** Expo SDK 54 · React Native 0.81 · TypeScript

The passenger-facing mobile app for the metro system. Features include:

- 🗺️ Station maps with directions (`react-native-maps`)
- 📍 Location-based nearby stations (`expo-location`)
- 🔐 Biometric authentication (`expo-local-authentication`)
- 📡 NFC card interaction (`react-native-nfc-manager`)
- 🔒 Secure credential storage (`expo-secure-store`)

### Standalone APK build

If you only want to build the mobile APK without starting the database:

```bash
cd metro-app
./build-android.sh
```

### Local development (without Docker)

```bash
cd metro-app
cp .env.example .env        # Set your API_URL
npm install --legacy-peer-deps
npx expo start
```

### Dockerfile overview

The `metro-app/Dockerfile` uses a **two-stage build**:

| Stage | Base | Purpose |
|-------|------|---------|
| **builder** | `node:20-bookworm` | JDK 17 + Android SDK (API 35) + NDK + Gradle → builds APK |
| **output** | `alpine:3.20` | Tiny image holding just the final `.apk` |

**Android SDK components installed:**

- `platform-tools` — ADB, fastboot
- `platforms;android-35` — Target API level
- `build-tools;35.0.0` — Build toolchain
- `ndk;27.1.12297006` — Native code compilation

---

## ⚙️ Metro App Backend

**Location:** `metro-app-backend/`
**Tech:** Express 5 · Prisma ORM · TypeScript · PostgreSQL

### Dockerfile overview

The `metro-app-backend/Dockerfile` uses a **two-stage build**:

| Stage | Base | Purpose |
|-------|------|---------|
| **builder** | `node:22-slim` | Installs all deps, generates Prisma client, compiles TypeScript |
| **production** | `node:22-slim` | Production deps only, compiled `dist/`, Prisma client |

**Environment variables baked in as defaults** (overridden by compose):

| Variable | Default (in Docker) | Description |
|----------|---------------------|-------------|
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `Brackix123` | PostgreSQL password |
| `DB_HOST` | `metro_postgres_db` | Points to the compose `db` service |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `metroapp` | Database name |
| `PORT` | `4000` | API server port |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `DATABASE_URL` | *(composed at runtime)* | Built from `DB_*` vars on container start |

### Local development (without Docker)

```bash
cd metro-app-backend
cp .env.example .env        # Configure database credentials
npm install
npx prisma db pull          # Introspect existing database
npx prisma generate         # Generate Prisma client
npm run dev                 # Start dev server on port 4000
```

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload (via `tsx`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run check-db` | Test database connectivity |

---

## 🖥️ Metro App Dashboard

**Location:** `metro-app-dashboard/`
**Tech:** Next.js 15 · Tailwind CSS · TypeScript

The admin dashboard for managing the metro system.

### Dockerfile overview

The `metro-app-dashboard/Dockerfile` uses a **two-stage build**:

| Stage | Base | Purpose |
|-------|------|---------|
| **builder** | `node:22-slim` | Installs deps, builds Next.js production bundle |
| **production** | `node:22-slim` | Serves the built app via `next start` on port 3000 |

`NEXT_PUBLIC_API_URL` is passed as a **build arg** (required at build time because Next.js inlines `NEXT_PUBLIC_*` vars into the JS bundle).

### Local development (without Docker)

```bash
cd metro-app-dashboard
cp .env.example .env        # Set NEXT_PUBLIC_API_URL
npm install --legacy-peer-deps
npm run dev                 # Start on port 3000
```

---

## 📡 NFC Phone Handler

**Location:** `metroapp-phoneNFChandle/`
**Tech:** Expo SDK 54 · React Native 0.81 · TypeScript

Companion app for reading NFC transit cards. This app is **fully self-contained** — it reads NFC tags on-device and POSTs validation results to the web turnstile. **No environment variables needed.**

### Dockerfile overview

Same two-stage Android SDK approach as `metro-app`:

| Stage | Base | Purpose |
|-------|------|---------|
| **builder** | `node:20-bookworm` | JDK 17 + Android SDK (API 35) + NDK + Gradle → builds APK |
| **output** | `alpine:3.20` | Tiny image holding just the `.apk` |

### Extract the APK

```bash
docker cp metro_nfc_builder:/output/ ./nfc-build-output/
```

---

## 🚧 Web Turnstile

**Location:** `metroapp-web-turnstile/`
**Tech:** Express 5 · Vanilla JS/CSS/HTML

Web interface that simulates a turnstile gate. **Self-contained** — the frontend polls its own backend (same server) via relative URLs. No external API URL needed.

### How it works

The server exposes two endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/validar` | Receives `{ "valido": true/false }` from NFC apps |
| `GET` | `/api/estado` | Frontend polls this every **1 second** to check for new events |

The frontend (`public/script.js`) calls `fetch('/api/estado')` in a `setInterval` loop. When an NFC app POSTs a validation, the turnstile UI animates acceptance or rejection.

### Dockerfile overview

Single-stage, very lightweight:

```
node:22-slim → npm ci → node server.js (port 5000)
```

### Local development (without Docker)

```bash
cd metroapp-web-turnstile
npm install
node server.js              # Starts on port 5000
```

---

## 🗄️ Database

The system uses **PostgreSQL 16**, managed via Docker Compose.

### Connection details (default)

| Parameter | Value |
|-----------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `metroapp` |
| User | `postgres` |
| Password | `Brackix123` |

### Access the database directly

```bash
# Via Docker
docker exec -it metro_postgres_db psql -U postgres -d metroapp

# Or with any PostgreSQL client
psql -h localhost -p 5432 -U postgres -d metroapp
```

### Data persistence

Database data is stored in the `postgres_data` Docker volume. It survives `docker compose down` but is removed with `docker compose down -v`.

---

## 🏗️ Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   📱 Metro App   │────▶│  ⚙️  Backend API  │────▶│  🗄️ PostgreSQL   │
│  (React Native)  │     │  (Express/Prisma) │     │    (Docker)      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                               ▲      ▲
                               │      │
                ┌──────────────┘      └──────────────┐
                │                                     │
   ┌────────────────────┐              ┌──────────────────────┐
   │  🖥️ Dashboard       │              │  📡 NFC Handler       │
   │  (Next.js)          │              │  (Expo)               │
   └─────────────────────┘              └───────────────────────┘
                                                  │
                                       ┌──────────────────────┐
                                       │  🚪 Web Turnstile     │
                                       │  (Node.js)            │
                                       └───────────────────────┘
```

---

## 📌 Versions

See [VERSIONS.md](./VERSIONS.md) for component version tracking and repository links.

| Component | Version | Repository |
|-----------|---------|------------|
| Backend | v1.0 | [metro-app-backend](https://github.com/Brackix/metro-app-backend) |
| Mobile App | v1.0 | [metro-app](https://github.com/Brackix/metro-app) |
| Dashboard | v1.0 | [metro-app-dashboard](https://github.com/Brackix/metro-app-dashboard) |
| Web Turnstile | v1.0 | [metroapp-web-turnstile](https://github.com/Brackix/metroapp-web-turnstile) |
| NFC Handler | v1.0 | [metroapp-phoneNFChandle](https://github.com/Brackix/metroapp-phoneNFChandle) |

---

## 🐛 Troubleshooting

### Build fails with out-of-memory error

Increase Docker's memory allocation to at least **6 GB**:
- **Docker Desktop:** Settings → Resources → Memory → 6.00 GB

### APK build takes too long

The first build downloads ~2 GB of Android SDK + Gradle dependencies. Subsequent builds use Docker layer caching and should be much faster. To force a clean rebuild:

```bash
docker compose build --no-cache metro-app
```

### Wrong IP detected

Override manually:

```bash
API_URL=http://192.168.1.100:4000/api ./build.sh
```

### Database connection refused

Make sure the `db` service is running and healthy:

```bash
docker compose ps
docker compose logs db
```

### Port 5432 already in use

Stop any local PostgreSQL instance:

```bash
sudo systemctl stop postgresql
# or
brew services stop postgresql
```

---

## 📄 License

Private project — all rights reserved.
