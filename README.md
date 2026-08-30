# 🌌 NASA Exoplanet Data Engineering Platform

[![CI/CD Pipeline](https://github.com/franciscopastor37/Data-Engineering-Platform/actions/workflows/tests.yml/badge.svg)](https://github.com/franciscopastor37/Data-Engineering-Platform/actions)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, full-stack data engineering and analytics platform designed to **extract, clean, enrich, query, and visualize exoplanetary data** directly from the **NASA Exoplanet Archive (TAP API)**.

The platform couples an automated data pipeline with a high-throughput REST API, a dynamic React client, a production monitoring stack (Prometheus + Grafana), and a fine-grained admin management suite.

---

## 📌 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [ETL & Data Engineering Pipeline](#-etl--data-engineering-pipeline)
- [Technology Stack](#-technology-stack)
- [Service URLs & Ports](#-service-urls--ports)
- [API Capabilities](#-api-capabilities)
- [Observability & Monitoring](#-observability--monitoring)
- [Getting Started (Docker)](#-getting-started-docker)
- [Local Development Setup](#-local-development-setup)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## ✨ Key Features

| Domain | Capabilities |
|---|---|
| **ETL Pipeline** | • Automated TAP API extraction from NASA.<br>• Data validation via Pydantic & SQLModel.<br>• Strategic batch loading (`UPSERT`, `INSERT`, `RELOAD`).<br>• Automated recurring runs via APScheduler with runtime configurable intervals. |
| **Data Enrichment** | • Habitability scoring & confidence rating algorithms.<br>• Planetary classification (Terrestrial, Super-Earth, Neptune-like, Gas Giant).<br>• Composition estimation based on density and equilibrium temperature.<br>• Dynamic NASA image lookup with smart asset fallbacks. |
| **Public Analytics API** | • Open endpoints for exploration, search, pagination, and sorting.<br>• Complex multi-field filtering (distance, habitability, discovery year/method).<br>• Export dataset to **CSV**, **JSON**, and **Parquet** formats with optional ZIP compression.<br>• Redis caching layer with selective cache invalidation. |
| **Admin Operations** | • Admin-only authentication with JWT security.<br>• Full ETL control (trigger manual runs, dry-run mode, configure batch size).<br>• Interactive scheduler management (pause, resume, adjust frequency).<br>• Administrator account management. |
| **Frontend UI** | • Public exoplanet catalog with cosmic dark theme & glassmorphism.<br>• Interactive sorting, filtering, and deep-dive planet inspection modal/pages.<br>• Responsive admin dashboard with live ETL metrics and scheduler toggles. |
| **Observability** | • Prometheus scraping application metrics, PostgreSQL, Redis, and container metrics (cAdvisor).<br>• Pre-configured Grafana dashboards for throughput, latencies, and pipeline health.<br>• Structured JSON application logging with unique Request IDs (`X-Request-ID`). |

---

## 🏗️ System Architecture

```text
                                  ┌──────────────────────────────────────────┐
                                  │           NASA Exoplanet Archive         │
                                  │                 (TAP API)                │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       ▼
┌─────────────────────────┐               ┌──────────────────────────────────┐
│      Web Browser        │               │         FastAPI Backend          │
│   (React + Vite UI)     │ ── HTTP/REST ──▶ │ • Public Explorer & Export APIs │
│ • TanStack Router       │               │ • Admin JWT Authentication       │
│ • Tailwind CSS & Lucide │               │ • ExoplanetETL Engine            │
└─────────────────────────┘               │ • APScheduler Background Runner  │
                                          └─────────┬──────────────┬─────────┘
                                                    │              │
                                    SQLModel/ORM   │              │ Caching &
                                    Connection Pool│              │ Rate Limiting
                                                    ▼              ▼
                                          ┌────────────────┐ ┌───────────────┐
                                          │   PostgreSQL   │ │     Redis     │
                                          │   (Database)   │ │ (Cache Store) │
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

## 🔄 ETL & Data Engineering Pipeline

The ETL pipeline (`ExoplanetETL`) is engineered around clean architectural principles:

```text
[ Extract ] ──▶ [ Transform ] ──▶ [ Enrich ] ──▶ [ Load ] ──▶ [ Cache Invalidation ]
```

1. **Extraction (`app.etl.extract`):**
   - Queries NASA TAP endpoint via ADQL (`SELECT ... FROM ps`).
   - Normalizes raw astronomical column names into snake_case raw schemas.
2. **Transformation (`app.etl.transform`):**
   - Validates astronomical physical constraints (mass, radius, orbital periods).
   - Handles missing fields, units coercion, and data sanitization.
3. **Enrichment (`app.etl.enrich`):**
   - **Habitability Score:** Computed using Earth Similarity Index (ESI) approximations factoring flux, equilibrium temperature, and radius.
   - **Planet Classification:** Rules-based categorization into *Terrestrial*, *Super Earth*, *Neptune-like*, *Gas Giant*, and *Unknown*.
   - **Composition:** Density-based heuristics calculating iron, silicate, water, and volatile envelopes.
   - **Visuals:** Auto-resolves NASA photo archives or assigns composition-tailored artistic renders.
4. **Loading (`app.etl.load`):**
   - **Strategy Pattern:** Supports `UPSERT` (idempotent updates based on planet + star unique constraint), `INSERT` (append-only), or `RELOAD` (truncate and rewrite).
   - Executed in configurable batches to balance memory footprint and transaction overhead.
5. **Execution Reporting & Cache Flush:**
   - Yields detailed `ETLReport` with exact timings per step, persisted into the `etlrun` audit table.
   - Triggers `clear_cache_sync()` across Redis namespaces to maintain real-time API freshness.

---

## 💻 Technology Stack

### Backend & Data Processing
- **Language:** Python 3.10+
- **API Framework:** FastAPI, Starlette, Pydantic v2, SQLModel
- **Database & Migrations:** PostgreSQL 16, SQLAlchemy 2.0, Alembic
- **Caching & Limiter:** Redis 7, SlowAPI, FastAPI-Cache
- **Scheduler:** APScheduler (Advanced Python Scheduler)
- **Data Formats:** Pandas, PyArrow (Parquet), JSON, CSV

### Frontend Client
- **Framework:** React 19, TypeScript 5.9, Vite
- **Routing & State:** TanStack Router, TanStack React Query v5, TanStack Table
- **Styling & Components:** Tailwind CSS v4, shadcn/ui, Radix UI primitives, Lucide Icons

### Quality & Tooling
- **Package Management:** `uv` (ultra-fast Python package resolver) & `npm`
- **Linting & Formatting:** Ruff, Mypy (strict typing), Biome
- **Testing:** Pytest, pytest-asyncio, Playwright E2E

### Infrastructure & Telemetry
- **Containers:** Docker, Docker Compose, Traefik Reverse Proxy
- **Metrics:** Prometheus, Grafana, cAdvisor, Postgres Exporter, Redis Exporter

---

## 🌐 Service URLs & Ports

When running with Docker Compose in local development mode:

| Service | URL | Description | Credentials |
|---|---|---|---|
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | Main user catalog & admin panel | — |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | REST API root | — |
| **Interactive Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | OpenAPI documentation & explorer | — |
| **Alternative Docs (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Clean ReDoc API reference | — |
| **Grafana** | [http://localhost:3000](http://localhost:3000) | Performance & metrics dashboards | `admin` / `changethis` |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | Direct Prometheus query console | — |
| **Adminer** | [http://localhost:8080](http://localhost:8080) | Web-based database management UI | Postgres credentials |

---

## 📡 API Capabilities

### 🌍 Public Endpoints (No Authentication Required)
- `GET /api/v1/exoplanets/`: Paginated search with filtering by star, discovery year, method, habitability score, and sorting.
- `GET /api/v1/exoplanets/{id}`: Detailed planet profile with astronomical metrics and photo enrichment.
- `GET /api/v1/exoplanets/stats`: Aggregate dataset metrics (discoveries per decade, methods, habitability distribution).
- `GET /api/v1/exports/export`: Dataset exporter supporting `format=csv`, `format=json`, and `format=parquet` with optional `compress=true`.
- `GET /api/v1/utils/health-check/`: System liveness probe.

### 🔒 Admin Endpoints (Requires Admin Bearer Token)
- `POST /api/v1/login/access-token`: OAuth2 password flow to obtain JWT bearer token.
- `POST /api/v1/etl/run`: Trigger manual ETL pipeline execution with configurable parameters (`limit`, `dry_run`, `load_mode`).
- `GET /api/v1/etl/last_run`: Inspect latest ETL execution report and metrics.
- `GET /api/v1/scheduler/`: Get current status of automated scheduler and next trigger timestamps.
- `POST /api/v1/scheduler/start` & `POST /api/v1/scheduler/stop`: Control background scheduler state.
- `PATCH /api/v1/scheduler/`: Adjust scheduled execution interval on the fly.
- `GET /api/v1/users/` & `POST /api/v1/users/`: Admin user management (list and create admins).

---

## 📊 Observability & Monitoring

The monitoring stack collects multi-tier metrics out of the box:

1. **Application Metrics:**
   - HTTP request volume, status codes, and latency percentiles.
   - ETL pipeline runs: records extracted, transformed, inserted, and errors.
2. **Infrastructure Metrics:**
   - PostgreSQL connection pool status, cache hit ratios, and query latencies.
   - Redis memory consumption, command rates, and hit/miss ratios.
   - Docker container CPU, memory usage, and network I/O via cAdvisor.
3. **Dashboards:**
   - Pre-provisioned Grafana dashboards located in `monitoring/grafana/dashboards/`.

---

## 🚀 Getting Started (Docker)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (version 24.0+)
- [Git](https://git-scm.com/)

### 2. Clone and Configure
```bash
git clone https://github.com/franciscopastor37/Data-Engineering-Platform.git
cd Data-Engineering-Platform
```

Copy the environment template:
```bash
cp .env.example .env   # On Windows: copy .env.example .env (or adjust .env)
```

Configure your initial admin credentials in `.env`:
```env
FIRST_ADMIN=admin@example.com
FIRST_ADMIN_PASSWORD=your_secure_password
```

### 3. Launch Services
```bash
docker compose up -d --build
```

The database migrations and initial admin account are automatically created during startup. Access the frontend at `http://localhost:5173` and the API docs at `http://localhost:8000/docs`.

To shut down:
```bash
docker compose down
```

---

## 🛠️ Local Development Setup

If you prefer running services directly on your host machine:

### Backend Setup
1. **Install `uv` (recommended) or Python 3.10+**:
   ```bash
   cd backend
   uv sync
   ```
2. **Run database migrations**:
   ```bash
   uv run alembic upgrade head
   ```
3. **Seed initial admin**:
   ```bash
   uv run python app/initial_data.py
   ```
4. **Start backend development server**:
   ```bash
   uv run fastapi dev app/main.py
   ```

### Frontend Setup
1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Generate API client (syncs with OpenAPI schema)**:
   ```bash
   npm run generate-client
   ```
3. **Start frontend server**:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing & Quality Assurance

### Backend Test Suite (300+ Automated Tests)
The test suite validates units, database integration, repositories, ETL pipelines, and API routes against real and mocked backends.

```bash
cd backend

# Run complete test suite with pytest
uv run pytest

# Run with verbose output and coverage
uv run pytest -v --cov=app

# Run static type checking
uv run mypy app

# Run code style formatting & linter
uv run ruff check .
```

### Frontend Test Suite (E2E & Linting)
```bash
cd frontend

# Run TypeScript compilation & Vite build check
npm run build

# Run Biome linter and formatter
npm run lint

# Run Playwright End-to-End browser tests
npm test
```

---

## 📁 Project Directory Structure

```text
.
├── .github/                      # CI/CD workflows (GitHub Actions)
├── backend/                      # FastAPI backend service
│   ├── app/
│   │   ├── alembic/              # Database migration versions
│   │   ├── api/                  # REST API routes & dependencies
│   │   ├── core/                 # Config, security, database, Redis cache
│   │   ├── etl/                  # ETL pipeline engine (extract, transform, enrich, load)
│   │   ├── models/               # SQLModel entities (User, Exoplanet, ETLRun)
│   │   ├── repositories/         # Database persistence layers
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic orchestration
│   │   ├── initial_data.py       # Database seeder
│   │   └── main.py               # FastAPI application entry point
│   ├── tests/                    # 300+ Unit, Integration, and API tests
│   └── pyproject.toml            # Python dependencies and tool configs
│
├── frontend/                     # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── client/               # Auto-generated OpenAPI client
│   │   ├── components/           # UI components, Admin tables, Exoplanet catalog
│   │   ├── hooks/                # Custom React hooks (useAuth, useCustomToast)
│   │   ├── routes/               # TanStack Router file-based pages
│   │   └── routeTree.gen.ts      # Generated router tree
│   ├── tests/                    # Playwright E2E test specs
│   └── package.json              # Frontend dependencies and scripts
│
├── monitoring/                   # Observability infrastructure
│   ├── grafana/                  # Grafana dashboards & datasources
│   └── prometheus/               # Prometheus scrape configs & alert rules
│
├── compose.yml                   # Production container definitions
├── compose.override.yml          # Local development container overrides
├── .env                          # Environment secrets and configuration
└── README.md                     # Platform documentation
```

---

## ⚙️ Environment Variables

Key variables defined in `.env`:

| Variable | Description | Default |
|---|---|---|
| `ENVIRONMENT` | Application mode (`local`, `staging`, `production`) | `local` |
| `SECRET_KEY` | JWT token encryption key | `changethis` |
| `FIRST_ADMIN` | Primary administrator email | `admin@example.com` |
| `FIRST_ADMIN_PASSWORD` | Primary administrator password | `changethis` |
| `POSTGRES_SERVER` | PostgreSQL host | `db` |
| `POSTGRES_DB` | PostgreSQL database name | `app` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `changethis` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `ETL_SCHEDULE_INTERVAL_HOURS` | Default automated ETL run interval | `24` |

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
