# Diblong Shop — premium multilingual ecommerce monorepo

This repository contains a production-oriented reference implementation for the **Diblong** brand:

- **Storefront**: Angular 19 (standalone components, SSR/prerender, Tailwind CSS, semantic HTML, per-page SEO helpers, JSON-LD, localized URL structure).
- **API**: NestJS 11 (REST, modular architecture, JWT access tokens + refresh cookies, RBAC, Swagger/OpenAPI, structured errors, Prisma ORM).
- **Database**: PostgreSQL + Prisma migrations + rich seed (catalog, CMS pages, shipping, promos, remote image import).

Primary public language is **Slovenian** (`/sl/...`), with **English** (`/en/...`) and **Croatian** (`/hr/...`).

## Repository layout

```
apps/
  api/        NestJS + Prisma + seed + uploads
  web/        Angular SSR storefront + admin shell
docker-compose.yml
package.json  npm workspaces (optional convenience scripts)
```

## Prerequisites

- Node.js **20.11+** (Angular CLI 21+ wants newer Node; this repo pins **Angular 19** for compatibility with Node 20.11).
- Docker (for Postgres).
- `npm` 10+.

> Note: Prisma **7** requires Node **20.19+**. This repo pins **Prisma 5.22** so it runs on Node **20.11**.

## Quick start (local)

### 1) Start Postgres

```bash
docker compose up -d postgres
```

Postgres is mapped to host port **5433** (to avoid collisions with a local `5432`).

### 2) Configure API environment

```bash
cp apps/api/.env.example apps/api/.env
```

Set strong secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (32+ chars).

### 3) Migrate + seed

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

Seed will:

- create roles (`CUSTOMER`, `STAFF`, `ADMIN`) and an admin user **`admin@diblong.com` / `Admin123!`**
- import the configured Diblong product images (downloaded into `apps/api/uploads`)
- create the full starter catalog (SL/EN/HR translations + SEO fields + related products)
- create shipping zones/rates for **SI**, **HR**, **DE**
- create CMS pages + homepage promo banner

### 4) Run API

```bash
cd apps/api
npm run start:dev
```

- REST base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs` (excluded from the `/api/v1` prefix)
- Static media: `http://localhost:3000/uploads/...`

### 5) Run Angular

```bash
cd apps/web
npm start
```

Storefront: `http://localhost:4200` (defaults to `/sl`).

### SSR note (sitemap + robots)

The Angular SSR server proxies:

- `GET /sitemap.xml` → `${API_BASE_URL}/sitemap.xml`
- `GET /robots.txt` → `${API_BASE_URL}/robots.txt`

Set `API_BASE_URL` when running the SSR server in production (defaults to `http://localhost:3000/api/v1`).

## Payments architecture (pluggable)

The API includes a **payment provider registry** (`PaymentsService`) with a **stub** provider that always authorizes. Replace/extend by registering additional providers in `apps/api/src/payments`.

## Admin / back office

There are two complementary surfaces:

1. **REST admin endpoints** under ` /api/v1/admin/*` (JWT required; `ADMIN`/`STAFF` roles depending on route).
2. **Angular admin shell** at `/admin` (scaffold UI + links to Swagger for full CRUD operations).

## Testing

### API unit tests

```bash
cd apps/api
npm test
```

### API e2e tests (supertest)

```bash
cd apps/api
npm run test:e2e
```

### Web unit tests (karma)

```bash
cd apps/web
npm test
```

### Web e2e smoke tests (Playwright)

Install browsers once:

```bash
cd apps/web
npx playwright install
```

Run the storefront + API locally, then:

```bash
cd apps/web
npm run e2e
```

## Production build

```bash
cd apps/web && npm run build
cd apps/api && npm run build
```

## Docker (API image sketch)

`apps/api/Dockerfile` is included as a starting point for containerizing the API with `prisma migrate deploy` at startup.

## Brand + SEO implementation highlights

- Localized storefront paths per language (`PATHS` in `apps/web/src/app/core/store-paths.ts`).
- SSR-friendly `provideHttpClient(withFetch())`.
- `SeoService` sets title/description/canonical/OpenGraph and hreflang alternates (product API returns `alternates`).
- Product pages emit JSON-LD `@graph` with **Product** + **BreadcrumbList**.

## Security notes

- Change default admin password immediately in any shared environment.
- Configure `WEB_ORIGIN` / CORS for your real domains.
- Prefer storing refresh tokens **HttpOnly** (already) and tightening cookie `secure` flags in production.
