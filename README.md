# 🌌 ExoScope — NASA Exoplanet Data Engineering & Analytics Platform

[![CI](https://github.com/FXV6624/Data-Engineering-Platform/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/FXV6624/Data-Engineering-Platform/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.114%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-8-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack data engineering and analytics platform for **extracting, cleaning, enriching, querying, and visualizing exoplanetary data** from the **NASA Exoplanet Archive (TAP API)**.

The platform combines an automated data pipeline, a REST API, a React client with interactive filtering, **Prometheus and Grafana observability**, and an **admin management suite**.


---

## 📌 Table of Contents

1. [Key Features](#key-features)
2. [System Architecture](#-system-architecture)
3. [Astrophysical Models & Design Decisions](#-astrophysical-models--design-decisions)
   - [Habitability Scoring & Confidence](#1-habitability-scoring--confidence-kopparapu-et-al-2013)
   - [Planetary Classification](#2-planetary-classification-chen--kipping-2017)
   - [Bulk Composition Estimation](#3-bulk-composition-estimation-zeng-et-al-2016-2019)
   - [Dual-Layer Imagery Engine](#4-dual-layer-imagery-engine-nasa-images-api--fallbacks)
4. [Administrative Capabilities (Control Center)](#-administrative-capabilities-control-center)
5. [Technology Stack](#-technology-stack)
6. [Service URLs & Ports](#-service-urls--ports)
7. [API Capabilities](#-api-capabilities)
8. [Observability & Monitoring](#-observability--monitoring)
9. [Getting Started (Docker)](#-getting-started-docker)
10. [Local & Hybrid Development](#-local--hybrid-development)
11. [Testing & Quality Assurance](#-testing--quality-assurance)
12. [Production Deployment Guide](#-production-deployment-guide)
13. [Project Directory Structure](#-project-directory-structure)
14. [Environment Variables](#-environment-variables)
15. [License](#-license)

---

## Key Features

| **Domain**                           | **Capabilities**                                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ETL Pipeline**                     | • Automated ingestion from the NASA TAP service (`pscomppars` via ADQL).<br>• Physical constraint validation and unit normalization.<br>• Pluggable loading strategies (`UPSERT`, `INSERT`, `RELOAD`) with batch processing.<br>• Scheduled execution with configurable intervals.                          |
| **Scientific Analysis & Enrichment** | • Habitability scoring based on Kopparapu et al. (2013).<br>• Probabilistic planetary classification based on Chen & Kipping (2017).<br>• Internal composition estimation using Zeng et al. (2016, 2019) mass-radius models.<br>• Confidence scoring based on measurement completeness and model precision. |
| **REST API**                         | • Multi-criteria search, pagination, and dynamic sorting.<br>• Selective field filtering to reduce response payloads.<br>• CSV, JSON, and Parquet exports with optional ZIP compression.<br>• Redis caching and API rate limiting.                                                                          |
| **Admin Operations**                 | • Admin-only JWT authentication with secure password hashing.<br>• Manual ETL execution with configurable limits, loading strategies, and `dry_run` mode.<br>• Scheduler management, including pause, resume, and frequency updates.<br>• Configurable habitability thresholds.<br>• Cache management.      |
| **Frontend UI**                      | • React single-page application with Tailwind CSS.<br>• Virtualized exoplanet table with column visibility and search.<br>• Detailed exoplanet profiles with imagery, orbital parameters, and composition data.<br>• Admin dashboard with pipeline execution reports and notifications.                     |
| **Observability**                    | • Prometheus metrics for HTTP requests, database latency, and ETL execution.<br>• Container, PostgreSQL, and Redis monitoring.<br>• Grafana dashboards for API performance and pipeline health.<br>• Structured logging with correlation IDs (`X-Request-ID`).                                              |

---

## 🏗️ System Architecture

```text
                                  ┌──────────────────────────────────────────┐
                                  │           NASA Exoplanet Archive         │
                                  │           (TAP API / pscomppars)         │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       ▼ ADQL sync
┌─────────────────────────┐               ┌──────────────────────────────────┐
│      Web Browser        │               │         FastAPI Backend          │
│   (React 19 + Vite 7)   │ ── HTTP/REST ──▶ │ • Catalog Explorer & Exports     │
│ • TanStack Router & Query│               │ • Admin JWT Authentication       │
│ • Tailwind CSS v4 & Sonner│              │ • ExoplanetETL Engine            │
└─────────────────────────┘               │ • APScheduler Background Runner  │
                                          └─────────┬──────────────┬─────────┘
                                                    │              │
                                     SQLModel/ORM   │              │ Caching &
                                     Connection Pool│              │ Rate Limiting
                                                    ▼              ▼
                                          ┌────────────────┐ ┌───────────────┐
                                          │   PostgreSQL   │ │     Redis     │
                                          │     (v18)      │ │   (v8-alpine) │
                                          └────────┬───────┘ └───────┬───────┘
                                                   │                 │
┌──────────────────────────────────────────────────┴─────────────────┴───────┐
│                           Observability & Telemetry                        │
│   ┌─────────────────────┐    ┌────────────────────┐    ┌───────────────┐   │
│   │     Prometheus      │ ──▶│      Grafana       │    │   cAdvisor    │   │
│   │  (Metrics Scraper)  │    │ (Dashboards & Logs)│    │  (Containers) │   │
│   └─────────────────────┘    └────────────────────┘    └───────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Astrophysical Models & Design Decisions

Raw astronomical observations from NASA are enriched using peer-reviewed astrophysical models:

### 1. Habitability Scoring & Confidence (Kopparapu et al., 2013)
- **Two-Tier Assessment**: Combines Habitable Zone (HZ) stellar flux boundaries (40% weight) with planetary physical parameters (60% weight: $T_{\text{eq}}$, radius, density, eccentricity, and stellar temperature via Gaussian similarity).
- **HZ Boundaries**: Classifies planets into conservative HZ (score: `1.0`), optimistic HZ (score: `0.70`), or non-habitable with exponential decay outside boundaries.
- **Confidence Metric ($C \in [0, 1]$)**: Calculated as $\text{Data Completeness} \times \text{Model Precision}$. Penalizes indirect flux estimations ($S = L / a^2$) and missing stellar temperatures.

### 2. Planetary Classification (Chen & Kipping, 2017)
Categorizes planets into four physical regimes based on radius ($R_\oplus$) and mass ($M_\oplus$):
- **Terrestrial**: $R_p < 1.23$, $M_p < 2.0$ (compact rocky bodies).
- **Super-Earth**: $1.23 \le R_p < 2.0$, $2.0 \le M_p < 10.0$ (massive rocky / water worlds).
- **Neptune-like**: $2.0 \le R_p < 6.0$, $10.0 \le M_p < 130.0$ (volatile-dominated envelopes).
- **Gas Giant**: $R_p \ge 6.0$, $M_p \ge 130.0$ (hydrogen-helium gas giants).
- **Confidence**: High baseline ($0.90$) when mass and radius agree, smoothed with a logistic penalty near classification boundaries.

### 3. Bulk Composition Estimation (Zeng et al., 2016, 2019)
- **Mass-Radius Curves ($R = \alpha M^\beta$)**: Evaluates minimum normalized distance to theoretical models: Iron Core, Silicate / Rocky (Earth-like), Water World (50% $\text{H}_2\text{O}$), Volatile-Rich, and Hydrogen-Helium gas envelopes.
- **Confidence**: Decays exponentially with distance from theoretical curves. Falls back to mean density heuristics when mass is unavailable.

### 4. Dual-Layer Imagery Engine (NASA Images API & Fallbacks)
- **On-Demand Resolution & Persistence**: During ingestion, each planet is assigned a default illustration based strictly on its calculated **composition** (`rocky`, `water_world`, `ice`, `hydrogen_helium`, etc.). When a user opens an exoplanet's details profile (`GET /api/v1/exoplanets/{id}`), if the image has not yet been resolved, the backend triggers an on-demand lookup to the **NASA Images API** (`images-api.nasa.gov`), persists the found image URL in PostgreSQL, and invalidates the Redis cache for future requests.
- **NASA Images API Lookup**: Queries NASA's media archive using normalized planet designations (e.g. `Kepler-186 f` $\rightarrow$ `Kepler-186f`), filters by relevance on title/description, and caches responses in memory (`@lru_cache`).
- **Composition-Based Fallbacks**: If no official photograph or artist illustration exists in the NASA archive, the client displays the default visual based exclusively on the planet's bulk composition, flagged in the UI with an `AI-generated photo based on composition` badge (or `NASA Archive Photo` when verified).

---

## 🎛️ Administrative Capabilities (Control Center)

Administrators have access to a dedicated suite to orchestrate and monitor the platform:

1. **ETL Pipeline Ingestion Strategies**:
   - **`upsert` (Recommended)**: Idempotent run. Inserts new planets and updates existing entries if astronomical values were revised by NASA.
   - **`insert`**: Append-only mode. Only records brand-new discoveries, skipping existing entries without modifying them.
   - **`reload` (Destructive)**: Truncates the exoplanet table and re-ingests the entire catalog from NASA.
   - **`dry_run`**: Executes the entire extract, transform, and enrich cycle, generating a full report without writing to PostgreSQL.
   - **`persist_run`**: Writes execution telemetry (`started_at`, `duration`, `inserted`, `updated`, `errors`) into the `etlrun` audit table.
2. **Scheduler Automation**:
   - Runtime control of the background APScheduler job (`exoplanet_etl`).
   - Start, stop, or pause scheduled runs.
   - Reconfigure ingestion frequency on the fly (`1h`, `6h`, `12h`, `24h`, or custom seconds) without restarting containers.
3. **Habitability Thresholds Management**:
   - Sliders to configure the **Score Threshold** (default: `80.0`) and **Confidence Threshold** (default: `0.70`).
   - Instantly recalculates and updates summary statistics on the Dashboard and Catalog.
4. **Global Cache Purge**:
   - Instantly invalidates all Redis key patterns (`exoplanets-cache*`, `*exoplanet*`) and in-memory caches.
5. **Administrator Account Management (`/admin/users`)**:
   - **Admin-Only Account System**: The platform has no public registration or regular user accounts; the entire catalog, search, and export functionality is open and publicly accessible.
   - **Bootstrap & Delegation**: The initial administrator is seeded automatically on deployment via `FIRST_ADMIN` and `FIRST_ADMIN_PASSWORD` from `.env`. Only an authenticated admin can invite or create additional administrator accounts.
   - **Lifecycle Controls**: Admin profile updates, email/password management, and account deletion protected by self-deletion guards.

---

## 💻 Technology Stack

Every library, tool, and framework listed below is verified against the codebase configuration:

### Backend & Data Processing
- **Language:** Python 3.10+
- **API Framework:** FastAPI `>=0.114.2`, Starlette, Pydantic v2, SQLModel `0.0.39`
- **Database & Driver:** PostgreSQL 18, `psycopg` (binary) `>=3.1.13`, SQLAlchemy 2.0, Alembic `>=1.19.1`
- **Caching & Rate Limiting:** Redis 8 (`redis-py` `>=6.0.0`), `fastapi-cache2` `>=0.2.2`, `slowapi` `>=0.1.10`
- **Task Scheduling:** APScheduler `>=3.11.3`
- **Export & Serialization:** PyArrow `>=25.0.0` (Parquet), Python standard `csv`, `json`, `zipfile`
- **Security:** `pwdlib` (Argon2, Bcrypt), `pyjwt` `>=2.8.0`, `python-multipart`
- **Network & Resilience:** `requests`, `httpx`, `tenacity` `>=8.2.3`
- **Email:** `emails` `>=0.6`, `jinja2` `>=3.1.4`

### Frontend Client
- **Framework & Language:** React 19 (`19.1.1`), TypeScript 5.9 (`5.9.3`), Vite 7 (`7.3.0`)
- **Routing & State:** TanStack Router `1.163+`, TanStack Query v5 (`5.90+`), TanStack Table `8.21+`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` `4.1+`, `tailwindcss` `4.2+`)
- **UI Components:** Radix UI primitives (`@radix-ui/react-*`), Lucide Icons, Sonner (toasts)
- **Forms & Validation:** React Hook Form `7.68+`, Zod `4.4+`, `@hookform/resolvers`
- **API Client:** Generated via `@hey-api/openapi-ts` from backend OpenAPI specifications

### Testing & Quality Tooling
- **Backend Quality:** `pytest` (389 tests, 95% coverage), `coverage` `7.4+`, `ruff` `0.16+`, `mypy` (strict)
- **Pre-commit Automation:** `prek` `>=0.2.24` (fast Rust-based pre-commit runner)
- **Frontend Quality:** Playwright `1.58.2` (53 E2E tests across Chromium), Biome `2.5.2` (linter & formatter)

### Infrastructure & Telemetry
- **Proxy & Ingress:** Traefik 3.6 (Reverse proxy, Let's Encrypt SSL, subdomain routing)
- **Observability:** Prometheus, Grafana OSS, cAdvisor, Postgres Exporter, Redis Exporter
- **Containerization:** Docker Engine, Docker Compose

---

## 🌐 Service URLs & Ports

When running with Docker Compose in local development mode:

| Service | Local URL | Subdomain URL (`DOMAIN=localhost.tiangolo.com`) | Description |
|---|---|---|---|
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | `http://dashboard.localhost.tiangolo.com` | Exoplanet Explorer & Admin UI |
| **Backend REST API** | [http://localhost:8000](http://localhost:8000) | `http://api.localhost.tiangolo.com` | FastAPI API Root |
| **Interactive Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | `http://api.localhost.tiangolo.com/docs` | OpenAPI interactive documentation |
| **Alternative Docs (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | `http://api.localhost.tiangolo.com/redoc` | Clean ReDoc API reference |
| **Traefik Dashboard** | [http://localhost:8090](http://localhost:8090) | `http://localhost.tiangolo.com:8090` | Ingress routes & middleware status |
| **Mailcatcher (Web)** | [http://localhost:1080](http://localhost:1080) | `http://localhost.tiangolo.com:1080` | Local email capture sandbox |
| **Mailcatcher (SMTP)** | `localhost:1025` | `localhost:1025` | SMTP port for backend email delivery |
| **Adminer (Database)** | [http://localhost:8080](http://localhost:8080) | `http://localhost.tiangolo.com:8080` | Web UI for PostgreSQL inspection |
| **Grafana** | [http://localhost:3000](http://localhost:3000) | — | Observability dashboards (`admin` / `changethis`) |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | — | Direct metrics query console |

---

## 📡 API Capabilities

### 🌍 Public Endpoints (No Authentication Required)
- `GET /api/v1/exoplanets/`: Paginated search with filtering by star, discovery year, method, habitability score, and sorting.
- `GET /api/v1/exoplanets/{id}`: Detailed planet profile with astronomical metrics and photo enrichment.
- `GET /api/v1/exoplanets/stats`: Aggregate dataset metrics (discoveries per decade, methods, habitability distribution).
- `GET /api/v1/exports/export`: Dataset exporter supporting `format=csv`, `format=json`, and `format=parquet` with optional `compress=true` and custom `fields`.
- `GET /api/v1/utils/health-check/`: System liveness probe.

### 🔒 Admin Endpoints (Requires Admin Bearer Token)
*(The platform has no public signup; accounts are strictly for platform administrators, and new admins can only be invited/created by existing admins).*
- `POST /api/v1/login/access-token`: OAuth2 password flow to obtain JWT bearer token.
- `POST /api/v1/etl/run`: Trigger manual ETL pipeline execution (`limit`, `dry_run`, `load_mode`, `persist_run`).
- `GET /api/v1/etl/last_run`: Inspect latest ETL execution report and metrics.
- `GET /api/v1/scheduler/`: Get current status of automated scheduler and next trigger timestamps.
- `POST /api/v1/scheduler/start` & `POST /api/v1/scheduler/stop`: Control background scheduler execution.
- `PATCH /api/v1/scheduler/`: Adjust scheduled execution interval on the fly.
- `POST /api/v1/utils/purge-cache/`: Purge Redis and in-memory cache.
- `GET /api/v1/users/` & `POST /api/v1/users/`: Admin user management.

---

## 📊 Observability & Monitoring

The platform provides a pre-configured monitoring stack:

1. **Prometheus Metrics:**
   - FastAPI request durations, error rates, and throughput.
   - ETL pipeline counters (records processed, batch durations, errors).
   - PostgreSQL queries, buffer hits, connection pool utilization.
   - Redis memory, command frequency, and cache hit/miss rates.
   - Host & container CPU/memory usage via cAdvisor.
2. **Grafana Dashboards:**
   - Pre-provisioned dashboards located in `monitoring/grafana/dashboards/`.
   - Access at `http://localhost:3000` (User: `admin`, Password: `changethis`).

---

## 🚀 Getting Started (Docker)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+) or Docker Engine
- [Git](https://git-scm.com/)

### 2. Setup Environment
```bash
git clone https://github.com/FXV6624/Data-Engineering-Platform.git
cd Data-Engineering-Platform

# Copy environment variables template
cp .env.example .env
```

Ensure your `.env` file contains your initial admin credentials:
```dotenv
FIRST_ADMIN=admin@example.com
FIRST_ADMIN_PASSWORD=changethis
SECRET_KEY=changethis
```

### 3. Launch Stack
```bash
docker compose up -d
```

*(Alternatively, use `docker compose watch` to enable file synchronization between host and containers in development).*

To monitor service initialization and check logs:
```bash
docker compose logs -f
# Or inspect a specific service
docker compose logs -f backend
```

The backend container will run database migrations (`prestart.sh`) and initialize the admin account automatically. Open `http://localhost:5173` to explore the catalog.

To stop all services:
```bash
docker compose down
```

---

## 🛠️ Local & Hybrid Development

You can run individual services locally on your host machine while keeping infrastructure (PostgreSQL, Redis, Traefik) running in Docker.

### Running Backend Locally
1. Stop the backend container:
   ```bash
   docker compose stop backend
   ```
2. Navigate to `backend/` and sync dependencies using `uv`:
   ```bash
   cd backend
   uv sync
   ```
3. Run database migrations:
   ```bash
   uv run alembic upgrade head
   ```
4. Start the FastAPI development server:
   ```bash
   uv run fastapi dev app/main.py
   ```

### Running Frontend Locally
1. Stop the frontend container:
   ```bash
   docker compose stop frontend
   ```
2. Navigate to `frontend/` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Generate the OpenAPI client (synchronizes TypeScript schemas with FastAPI):
   ```bash
   npm run generate-client
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Subdomain Testing with `localhost.tiangolo.com`
The domain `localhost.tiangolo.com` automatically resolves to `127.0.0.1`. You can test production-like subdomain routing locally:
1. In your `.env` file, set:
   ```dotenv
   DOMAIN=localhost.tiangolo.com
   ```
2. Restart the stack:
   ```bash
   docker compose up -d
   ```
3. Access services via their subdomains:
   - Frontend: `http://dashboard.localhost.tiangolo.com`
   - Backend API: `http://api.localhost.tiangolo.com`
   - API Docs: `http://api.localhost.tiangolo.com/docs`

### Email Testing & Sandbox (Mailcatcher)
The backend generates responsive HTML emails (templated via Jinja2) for **administrator password recovery** (`/password-recovery/{email}`) and **new admin onboarding**:
- **Local Sandbox**: When running with Docker Compose, **Mailcatcher** runs automatically, listening on SMTP port `1025`. No real emails leave your machine.
- **Web Mailbox**: Open [http://localhost:1080](http://localhost:1080) in your browser to inspect intercepted emails, test password reset tokens, and verify HTML rendering in real time.
- **Production Delivery**: To deliver real emails in production, set your provider's SMTP credentials in `.env` (`SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAILS_FROM_EMAIL`, and `SMTP_TLS=True`).

### Pre-commit Code Quality Hooks (`prek`)
This repository uses `prek` (a fast Rust-based alternative to pre-commit) to enforce formatting and linting rules:
```bash
cd backend

# Install git hook locally
uv run prek install -f

# Run all quality checks manually across the repository
uv run prek run --all-files
```

---

## 🧪 Testing & Quality Assurance

### Backend Test Suite (389 Tests, 95% Coverage)
The backend test suite validates unit logic, database transactions, ETL pipelines, and API security.

```bash
cd backend

# 1. Run full test suite with pytest
uv run pytest

# 2. Run test suite collecting code coverage
uv run coverage run -m pytest

# 3. View terminal coverage summary report
uv run coverage report

# 4. Generate interactive HTML coverage report
uv run coverage html
```
To open the interactive coverage report in your browser:
- **Windows (PowerShell):** `Start-Process htmlcov\index.html`
- **macOS:** `open htmlcov/index.html`
- **Linux:** `xdg-open htmlcov/index.html`

#### Static Analysis & Linting
```bash
cd backend

# Strict type checking with Mypy
uv run mypy app

# Fast linting and formatting with Ruff
uv run ruff check .
uv run ruff format --check .
```

### Frontend Test Suite (53 Playwright E2E Tests)
Playwright validates end-to-end user flows including authentication, catalog search, filters, export modal, and admin controls.

```bash
cd frontend

# Run Biome checks (linting & formatting)
npm run lint

# TypeScript compilation & production build check
npm run build

# Run Playwright End-to-End browser test suite
npx playwright test

# Run Playwright in interactive UI mode
npx playwright test --ui
```

---

## 🚢 Production Deployment Guide

ExoScope is designed to be deployed using Docker Compose behind a **Traefik Reverse Proxy** that automates Let's Encrypt SSL certificates.

### 1. Server & DNS Requirements
- A cloud server (Ubuntu 22.04+ recommended) with Docker Engine installed.
- DNS records pointing to your server's public IP:
  - Base domain: `example.com`
  - Wildcard record: `*.example.com` (routes `api.example.com`, `dashboard.example.com`, etc.)

### 2. Standalone Traefik Proxy Setup
Deploy Traefik once on the server to handle incoming HTTPS connections for all stacks:

1. Create a dedicated directory:
   ```bash
   mkdir -p /opt/traefik-public
   cd /opt/traefik-public
   ```
2. Copy `compose.traefik.yml` to the directory.
3. Create the shared public Docker network:
   ```bash
   docker network create traefik-public
   ```
4. Set required Traefik environment variables:
   ```bash
   export DOMAIN=example.com
   export EMAIL=admin@example.com
   export USERNAME=admin
   export PASSWORD=your_secure_password
   export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
   ```
5. Launch Traefik:
   ```bash
   docker compose -f compose.traefik.yml up -d
   ```

### 3. Deploying ExoScope
1. Clone the repository on the server:
   ```bash
   git clone https://github.com/FXV6624/Data-Engineering-Platform.git /opt/exoscope
   cd /opt/exoscope
   ```
2. Configure production `.env` (generate strong random secrets using `python -c "import secrets; print(secrets.token_urlsafe(32))"`):
   ```dotenv
   DOMAIN=example.com
   ENVIRONMENT=production
   FRONTEND_HOST=https://dashboard.example.com
   SECRET_KEY=generate_a_random_32_character_key
   FIRST_ADMIN=admin@example.com
   FIRST_ADMIN_PASSWORD=strong_admin_password
   POSTGRES_PASSWORD=strong_postgres_password
   ```
3. Deploy the application:
   ```bash
   docker compose -f compose.yml up -d --build
   ```
Traefik automatically discovers the containers via Docker labels, provisions Let's Encrypt SSL certificates, and routes:
- `https://dashboard.example.com` $\rightarrow$ Frontend React App
- `https://api.example.com` $\rightarrow$ FastAPI Backend REST API

---

## 📁 Project Directory Structure

```text
.
├── .github/                      # CI/CD workflows (ci.yml, code-quality.yml, playwright.yml)
├── backend/                      # FastAPI backend service
│   ├── app/
│   │   ├── alembic/              # Database migrations
│   │   ├── api/                  # REST API routes & dependencies
│   │   ├── core/                 # Config, security, database, Redis cache, rate limiter
│   │   ├── etl/                  # ETL pipeline engine (extract, transform, enrich, load)
│   │   │   └── enrich/           # Scientific algorithms (habitability, planet_class, composition)
│   │   ├── exports/              # Export strategies (CSV, JSON, Parquet via PyArrow)
│   │   ├── models.py             # SQLModel entities (User, Exoplanet, ETLRun)
│   │   ├── repositories/         # Database query & persistence layers
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic orchestration & NASA image resolver
│   │   ├── initial_data.py       # Database seeder
│   │   └── main.py               # Application entrypoint & middleware
│   ├── tests/                    # 389 Pytest unit, integration, and API tests
│   └── pyproject.toml            # Python dependencies and tool configs
│
├── frontend/                     # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── client/               # Auto-generated OpenAPI SDK
│   │   ├── components/           # UI components, Admin tables, Exoplanet catalog
│   │   ├── hooks/                # Custom React hooks (useAuth, useExoplanetExport)
│   │   ├── routes/               # TanStack Router file-based pages
│   │   └── routeTree.gen.ts      # Generated router tree
│   ├── tests/                    # 53 Playwright E2E test specs
│   └── package.json              # Frontend dependencies and scripts
│
├── monitoring/                   # Observability infrastructure
│   ├── grafana/                  # Grafana dashboards & provisioning datasources
│   └── prometheus.yml            # Prometheus scrape configs
│
├── compose.yml                   # Production container stack definitions
├── compose.override.yml          # Local development overrides & volume mounts
├── compose.traefik.yml           # Standalone production Traefik proxy definition
├── .env                          # Local environment variables
└── README.md                     # Platform documentation
```

---

## ⚙️ Environment Variables

Key configuration variables defined in `.env`:

| Variable | Description | Default / Example |
|---|---|---|
| `DOMAIN` | Base domain name for routing and Let's Encrypt | `localhost` |
| `ENVIRONMENT` | Runtime environment (`local`, `staging`, `production`) | `local` |
| `FRONTEND_HOST` | Host address of the frontend (used for email reset links) | `http://localhost:5173` |
| `SECRET_KEY` | Secret key for JWT encryption | `changethis` |
| `FIRST_ADMIN` | Primary administrator account email | `admin@example.com` |
| `FIRST_ADMIN_PASSWORD` | Primary administrator account password | `changethis` |
| `POSTGRES_SERVER` | PostgreSQL server hostname | `localhost` (local) / `db` (docker) |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | PostgreSQL database name | `app` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `changethis` |
| `REDIS_HOST` | Redis host | `localhost` (local) / `redis` (docker) |
| `REDIS_PORT` | Redis port | `6379` |
| `ETL_SCHEDULER_ENABLED` | Whether the automated ETL scheduler starts on launch | `true` |
| `ETL_SCHEDULER_INTERVAL_SECONDS` | Ingestion cycle frequency in seconds | `86400` (24 hours) |
| `SMTP_HOST` | Outgoing SMTP server hostname | `mailcatcher` |
| `SMTP_PORT` | Outgoing SMTP server port | `1025` |

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
