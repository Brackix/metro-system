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
├── compose.yml                 # 🐳 Docker Compose — infrastructure services only
├── build.sh                    # 🔨 Start infrastructure (auto-detects local IP)
├── build-apks.sh               # 📱 Build Expo dev APKs locally (one-time)
├── start-dev.sh                # 🚀 Start Metro dev servers for hot reload
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
| [Node.js](https://nodejs.org/) | ≥ 20 | Expo dev servers |
| [Android SDK](https://developer.android.com/studio) | API 35+ | Building Expo APKs |
| Java JDK | 17+ | Android builds |
| Bash | ≥ 4.0 | Build scripts |

### 1. Clone the repository

```bash
git clone https://github.com/Brackix/metro-system.git
cd metro-system
```

### 2. Build development APKs (one-time)

```bash
./build-apks.sh
```

This builds debug APKs for both mobile apps and installs them on your connected Android device. You only need to do this **once** (or when native dependencies change).

You can also build them individually:

```bash
./build-apks.sh metro-app    # just the passenger app
./build-apks.sh nfc           # just the NFC receiver
```

### 3. Start infrastructure services

```bash
./build.sh
```

This starts the infrastructure via Docker Compose:

1. **PostgreSQL** database on port `5432`
2. **Backend API** (Express + Prisma) on port `4000`
3. **Dashboard** (Next.js) on port `3000`
4. **Web Turnstile** on port `5000`

To run in **detached mode** (background):

```bash
./build.sh -d
```

### 4. Start Expo dev servers

```bash
./start-dev.sh
```

This starts Metro bundlers for both Expo apps. Your phone's dev builds will connect automatically and you get **hot reload** — code changes reflect instantly without rebuilding.

---

## 🐳 Docker Compose (Infrastructure)

Docker Compose runs **only infrastructure services**, not the mobile apps.

### Services

| Service | Image / Build | Container Name | Ports | Description |
|---------|---------------|----------------|-------|-------------|
| `db` | `postgres:16` | `metro_postgres_db` | `5432` | PostgreSQL database |
| `backend` | Built from `./metro-app-backend/Dockerfile` | `metro_backend` | `4000` | REST API (Express + Prisma) |
| `dashboard` | Built from `./metro-app-dashboard/Dockerfile` | `metro_dashboard` | `3000` | Admin dashboard (Next.js) |
| `turnstile` | Built from `./metroapp-web-turnstile/Dockerfile` | `metro_turnstile` | `5000` | Web turnstile interface |

### Commands

```bash
# Start infrastructure
./build.sh

# Start in background
./build.sh -d

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v

# Rebuild a specific service
docker compose build backend
docker compose build dashboard

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f db
```

---

## 🌐 Automatic IP Detection

All three scripts (`build.sh`, `build-apks.sh`, `start-dev.sh`) **auto-detect your local network IP** so the mobile apps always point to the correct backend URL.

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

These can be set when running `build.sh`, `build-apks.sh`, or `start-dev.sh`:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | `4000` | Port appended to the detected IP |
| `API_URL` | *(auto-detected)* | Full override — skips IP detection |
| `METRO_PORT` | `8081` | Metro bundler port for metro-app |
| `NFC_PORT` | `8082` | Metro bundler port for NFC receiver |

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

### Build dev APK

```bash
./build-apks.sh metro-app
```

Or manually:

```bash
cd metro-app
npm install --legacy-peer-deps
npx expo run:android
```

### Development with hot reload

After installing the dev APK on your phone:

```bash
./start-dev.sh             # starts Metro bundler on port 8081
```

Open the app on your phone — it connects to the Metro bundler and you get instant hot reload.

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

### Build dev APK

```bash
./build-apks.sh nfc
```

Or manually:

```bash
cd metroapp-phoneNFChandle
npm install
npx expo run:android
```

### Development with hot reload

After installing the dev APK on your phone:

```bash
./start-dev.sh             # starts Metro bundler on port 8082
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

### APK build fails — Android SDK not found

Make sure `ANDROID_HOME` is set and the SDK is installed:

```bash
export ANDROID_HOME=$HOME/Android/Sdk   # Linux
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
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

### Metro bundler not connecting to phone

Make sure your phone and computer are on the **same Wi-Fi network**. The dev build connects to the Metro bundler using your local IP.

---

## 📄 License

Private project — all rights reserved.
