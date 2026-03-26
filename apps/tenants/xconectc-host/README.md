### XconectC Host (Laravel 12 Hosted Integrator Reference)

`xconectc-host` is the active Laravel hosted-integrator starter/reference app.

It is the Laravel counterpart to:

- [`integration-host`](../../../samples/tenants/integration-host/README.md) for the Node host path
- [`xconectc`](../xconectc/README.md) for the paired Laravel full-tenant path
- [`x-api`](../../../samples/tenants/x-api/README.md) for the Node tenant/backend path
- [`publisher-api`](../../../samples/publishers/publisher-api/README.md) for the sample publisher/executor lane

It keeps the host/integrator shell local, while the actual tenant-side host APIs stay on `xconectc`.

It provides:

- OIDC-like endpoints under `/api`:
    - `GET /api/.well-known/openid-configuration`
    - `GET /api/.well-known/jwks.json`
    - `GET|POST /api/auth/login`
    - `POST /api/auth/token`
- Tenant APIs under `/api`:
    - `GET|POST /api/projects`
    - `GET|PATCH /api/projects/:id`
    - `GET|POST /api/issues`
    - `GET|PATCH /api/issues/:id`
    - `GET|POST /api/issues/:id/comments`
    - `GET|POST /api/inventory`, `GET /api/inventory/:id`
    - `GET /api/profile`, `GET /api/billing`
- A simple HTML dashboard:
    - `GET /dashboard`
- Hosted-integrator proof pages:
    - `GET /`
    - `GET /catalog`
    - `GET /marketplace.html`
    - `GET /single-xapp.html`
- Local bootstrap proxy:
    - `POST /api/host-bootstrap`
- Host assets and SDK delivery:
    - `GET /host/proof-config.js`
    - `GET /host/*`
    - `GET /embed/sdk/xapps-embed-sdk.esm.js`

#### Local run

```bash
cd apps/tenants/xconectc-host

# Install deps
composer install

# Generate app key
php artisan key:generate

# SQLite db (path matches .env)
mkdir -p storage
touch storage/database.sqlite

# Migrate + seed demo data
php artisan migrate:fresh --seed

# Serve
php artisan serve --host=127.0.0.1 --port=8002
```

Then open:

- `http://127.0.0.1:8002/dashboard`
- `http://127.0.0.1:8002/api/.well-known/openid-configuration`
- `http://127.0.0.1:8002/catalog`

#### Notes

- The RSA signing key is expected at `storage/idp_private.pem` (ignored by git). Generate one for dev:

```bash
openssl genrsa -out storage/idp_private.pem 2048
```

- Required env for the host proof:
    - `XAPPS_API_KEY` should match the paired `xconectc` tenant key
    - `XCONECTC_HOST_PUBLIC_BASE_URL`
    - `XCONECTC_HOST_BACKEND_BASE_URL`
    - `XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL`
    - `XCONECTC_HOST_BOOTSTRAP_API_KEY`

- Current package status:
    - `xconectc-host` is the Laravel host-only starter/reference app, mirroring the `xconectb-host` lane.
    - `xconectc` remains the paired Laravel full tenant/backend starter/reference app.
    - inside the canonical monorepo it may keep Composer `path` repositories for local development.
    - in the public starter/reference export, prefer Packagist package `xapps-platform/xapps-php` instead of local path repos.
