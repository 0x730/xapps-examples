### XconectC Host (Laravel 12 Hosted Integrator Reference)

`xconectc-host` is the active Laravel hosted-integrator starter/reference app.

It is intentionally minimal. It demonstrates the hosted-integrator/session contract, not a
required product shell. Real integrators can keep their own authenticated Laravel app and
mount the same launcher, marketplace, single-xapp, bootstrap proxy, and bridge/session
routes inside that fuller application.

It is the Laravel counterpart to:

- [`integration-host`](../../../samples/tenants/integration-host/README.md) for the Node host path
- [`xconectc`](../xconectc/README.md) for the paired Laravel full-tenant path
- [`x-api`](../../../samples/tenants/x-api/README.md) for the Node tenant/backend path
- [`publisher-api`](../../../samples/publishers/publisher-api/README.md) for the sample publisher/executor lane

It keeps the host/integrator shell local, while the actual tenant-side xapps host APIs stay on `xconectc`.

This host is now self-contained and no longer loads its proof pages/assets from
the old shared proof layer.

This same host can also point at another compliant tenant backend without code
changes.

For example, to point `xconectc-host` at the Node `xconect` backend instead of
the Laravel `xconectc` backend, switch:

- `XCONECTC_HOST_BACKEND_BASE_URL=http://localhost:3312`
- `XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL=http://localhost:3312`
- `XCONECTC_HOST_BOOTSTRAP_API_KEY=<the xconect bootstrap key>`

That lets you keep the same Laravel proof host while testing the same browser
host contract against the Node tenant backend.

## What This Shape Looks Like

```mermaid
flowchart LR
  U[User browser] --> H[Laravel host app<br/>xconectc-host]
  H -->|launcher, branding, local auth shell| P[marketplace.html or single-xapp.html]
  H -->|POST /api/browser/host-bootstrap| T[Laravel tenant backend<br/>xconectc]
  P -->|POST /api/host-session/exchange| T
  P -->|session-backed host API calls| T
  T --> G[Gateway and runtime authority]
```

Read it as:

- the Laravel host app owns the visible shell and local bootstrap proxy
- the paired tenant backend still owns subject resolution, catalog/widget
  sessions, bridge routes, and payment/runtime authority
- the browser uses bootstrap only as entry state; ongoing hosted control-plane
  authority moves to the tenant-issued host session
- the browser never receives raw backend credentials

Use this when:

- the integrator already has a Laravel platform/app shell
- fast delivery matters more than full tenant-backend ownership
- the tenant backend should stay platform-hosted while the browser shell stays local

Do not treat this README as the only contract source. Read these first as the shared docs:

- [apps/tenants/docs/tooling/first-hosted-tenant-integrator-handoff.md](../docs/tooling/first-hosted-tenant-integrator-handoff.md)
- [apps/tenants/docs/tooling/hosted-integrator-starter-contract.md](../docs/tooling/hosted-integrator-starter-contract.md)
- [apps/tenants/docs/host/README.md](../docs/host/README.md)
- [apps/tenants/docs/tooling/laravel-hosted-integrator-platform-tenant.md](../docs/tooling/laravel-hosted-integrator-platform-tenant.md)

## First Reading Order

1. [apps/tenants/docs/tooling/first-hosted-tenant-integrator-handoff.md](../docs/tooling/first-hosted-tenant-integrator-handoff.md)
2. [apps/tenants/docs/tooling/hosted-integrator-starter-contract.md](../docs/tooling/hosted-integrator-starter-contract.md)
3. [apps/tenants/docs/host/README.md](../docs/host/README.md)
4. [apps/tenants/docs/tooling/laravel-hosted-integrator-platform-tenant.md](../docs/tooling/laravel-hosted-integrator-platform-tenant.md)
5. this README for the concrete Laravel proof lane

It provides:

- A simple HTML dashboard:
    - `GET /dashboard`
- Hosted-integrator proof pages:
    - `GET /`
    - `GET /marketplace.html`
    - `GET /single-xapp.html`
- Local bootstrap proxy:
    - `POST /api/browser/host-bootstrap`
- Host assets and SDK delivery:
    - `GET /host/starter-config.js`
    - `GET /host/proof-config.js` compatibility alias
    - `GET /host/*`
    - `GET /embed/sdk/xapps-embed-sdk.esm.js`
- Health:
    - `GET /health`

It intentionally does not provide:

- tenant/member auth flows
- a full operator domain model
- integrator-specific navigation, RBAC, or business pages

Browser contract:

- launcher page stays local and thin
- marketplace and single-xapp pages are clean SDK mount surfaces
- local host assets now only provide:
    - `launcher.js`
    - `marketplace.js`
    - `single-xapp.js`
    - `starter.css`
    - dynamic `GET /host/starter-config.js`
- real integrators should start from the browser starter, not from this proof app line-by-line

#### Local run

```bash
cd apps/tenants/xconectc-host

# Install deps
composer install

# Generate app key
php artisan key:generate

# SQLite db (path matches .env / deploy compose)
mkdir -p database
touch database/database.sqlite

# Migrate + seed demo data
php artisan migrate:fresh --seed

# Serve
PHP_CLI_SERVER_WORKERS=4 php artisan serve --host=127.0.0.1 --port=8002
```

Then open:

- `http://127.0.0.1:8002/dashboard`
- `http://127.0.0.1:8002/`
- `http://127.0.0.1:8002/marketplace.html`

#### Notes

- Keep `PHP_CLI_SERVER_WORKERS` greater than `1` for local hosted-widget testing. The paired tenant
  backend can receive gateway callbacks while the host request is still waiting for the gateway
  result.

- In the `partners-examples` deploy lane, the container startup now creates:
    - `database/database.sqlite`
    - the initial Laravel schema + seed data

- Required env for the host proof:
    - `XCONECTC_HOST_PUBLIC_BASE_URL`
    - `XCONECTC_HOST_BACKEND_BASE_URL`
    - `XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL`
    - `XCONECTC_HOST_BOOTSTRAP_API_KEY` should match the target backend bootstrap key

- Required env on the paired tenant backend for hosted cross-origin use:
    - `XCONECTC_HOST_BOOTSTRAP_API_KEYS`
    - `XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET`
    - `XCONECTC_HOST_BOOTSTRAP_SIGNING_KEY_ID` / `XCONECTC_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON`
    - `XCONECTC_HOST_SESSION_SIGNING_SECRET`
    - `XCONECTC_HOST_SESSION_SIGNING_KEY_ID` / `XCONECTC_HOST_SESSION_VERIFIER_KEYS_JSON`
    - `XCONECTC_ALLOWED_ORIGINS`

- To point this same Laravel host at the Node `xconect` backend instead:
    - `XCONECTC_HOST_BACKEND_BASE_URL=http://localhost:3312`
    - `XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL=http://localhost:3312`
    - `XCONECTC_HOST_BOOTSTRAP_API_KEY=<the xconect bootstrap key>`

- Current package status:
    - `xconectc-host` is the Laravel host-only starter/reference app, mirroring the `xconectb-host` lane.
    - `xconectc` remains the paired Laravel full tenant/backend starter/reference app.
    - inside the canonical monorepo it may keep Composer `path` repositories for local development.
    - in the public starter/reference export, prefer Packagist package `xapps-platform/xapps-php` instead of local path repos.
