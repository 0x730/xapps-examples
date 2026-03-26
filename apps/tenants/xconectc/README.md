### XconectC (Laravel 12 Full Tenant Reference)

`xconectc` is the active Laravel full-tenant starter/reference app.

It is the Laravel counterpart to:

- [`x-api`](../../../samples/tenants/x-api/README.md) for the Node tenant/backend path
- [`integration-host`](../../../samples/tenants/integration-host/README.md) for the Node host path
- [`xconectc-host`](../xconectc-host/README.md) for the Laravel hosted-integrator path
- [`publisher-api`](../../../samples/publishers/publisher-api/README.md) for the sample publisher/executor lane

It keeps OIDC, local tenant business APIs, and the full PHP backend-kit host surface in one Laravel starter/reference app.

For xapps provisioning, `xconectc` belongs to the public example/reference lane:

- it should receive the published `xplace-example` lane xapps targeted to tenant slug `xconectc`
- it should not rely on the generic seed-only demo app set
- the tenant record remains the Laravel/OIDC starter/reference app, while publishers/xapps are linked through the normal publish flow
- it now has first-class provision scripts, matching the `xconectb` bootstrap shape:
    - `npm run seed:xconectc-tenant`
    - `npm run seed:xconectc-tenant-admin`
    - `npm run seed:xconectc-policy-publisher`
    - `npm run publish:xconect-xplace-example -- --reference-tenant-profile xconectc`

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
- Xapps host embed demo:
    - `GET /catalog`
- Xapps tenant surface via the PHP backend kit:
    - `GET /api/host-config`
    - `POST /api/host-bootstrap`
    - `POST /api/resolve-subject`
    - `POST /api/create-catalog-session`
    - `POST /api/create-widget-session`
    - `GET /api/installations`
    - `POST /api/install`
    - `POST /api/update`
    - `POST /api/uninstall`
    - `POST /api/bridge/token-refresh`
    - `POST /api/bridge/sign`
    - `POST /api/bridge/vendor-assertion`
    - `POST /api/bridge/publisher-session/me`
    - `POST /api/bridge/publisher-session/logout`
    - `POST /xapps/requests`
    - `POST /guard/subject-profiles/tenant-candidates`

#### Local run

```bash
cd apps/tenants/xconectc

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
php artisan serve --host=127.0.0.1 --port=8001
```

Then open:

- `http://127.0.0.1:8001/dashboard`
- `http://127.0.0.1:8001/api/.well-known/openid-configuration`
- `http://127.0.0.1:8001/catalog`

#### Notes

- The RSA signing key is expected at `storage/idp_private.pem` (ignored by git). Generate one for dev:

```bash
openssl genrsa -out storage/idp_private.pem 2048
```

- Required env for the kit-backed tenant surface:
    - `XAPPS_GATEWAY_URL` (default `http://localhost:3000`)
    - `XAPPS_API_KEY` (tenant gateway/host API key)
    - `XCONECTC_GUARD_INGEST_API_KEY` (default `xconectc-tenant-guard-dev-key`)
    - `PUBLISHER_API_URL` (default `http://localhost:3002`, used for vendor assertion exchange)
    - `XCONECTC_ALLOWED_ORIGINS`
    - `XCONECTC_HOST_BOOTSTRAP_API_KEYS`
    - `XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET`
    - `XCONECTC_TENANT_PAYMENT_URL`
    - `XCONECTC_TENANT_PAYMENT_RETURN_URL_ALLOWLIST`

- Current package status:
    - `xconectc` is the Laravel starter/reference app showing the PHP backend-kit full-tenant path.
    - `xconectc-host` is the paired Laravel hosted-integrator starter/reference app.
    - inside the canonical monorepo it may keep Composer `path` repositories for local development.
    - in the public starter/reference export, prefer Packagist packages `xapps-platform/xapps-php` and `xapps-platform/xapps-backend-kit` instead of local path repos.
