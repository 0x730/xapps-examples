### XconectC (Laravel 12 Full Tenant Reference)

`xconectc` is the active Laravel full-tenant starter/reference app.

It is the Laravel counterpart to:

- [`x-api`](../../../samples/tenants/x-api/README.md) for the Node tenant/backend path
- [`integration-host`](../../../samples/tenants/integration-host/README.md) for the Node host path
- [`xconectc-host`](../xconectc-host/README.md) for the Laravel hosted-integrator path
- [`publisher-api`](../../../samples/publishers/publisher-api/README.md) for the sample publisher/executor lane

It keeps OIDC, the launcher/browser-host surfaces, and the full PHP backend-kit tenant surface in one Laravel starter/reference app.

The same-origin launcher/browser-host surface is now self-contained here too:

- local launcher pages live in `resources/host-pages`
- local thin starter assets live in `resources/host`
- launcher, marketplace, and single-xapp pages are local SDK consumers
- `xconectc` no longer reads launcher pages/assets from the old shared proof layer

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
- A simple HTML dashboard:
    - `GET /dashboard`
- Xapps launcher/browser-host demo:
    - `GET /catalog`
    - `GET /marketplace.html`
    - `GET /single-xapp.html`
    - `POST /api/browser/host-bootstrap`
- Xapps tenant surface via the PHP backend kit:
    - `GET /api/host-config`
    - `POST /api/host-bootstrap`
    - `POST /api/host-session/exchange`
    - `POST /api/host-session/logout`
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

Gateway revocation surface consumed by host-session logout propagation:

- `POST /v1/host-sessions/revocations`
- `POST /v1/host-sessions/revocations/bulk`
- `GET /v1/host-sessions/revocations/{hostSessionJti}`

Execution-token linkage expectation:

- include `host_session_jti`
- include `host_session_bound: true`
- include `aud_client_id` matching `clientId`

#### Local run

```bash
cd apps/tenants/xconectc

# Install deps
composer install

# Generate app key
php artisan key:generate

# SQLite db (path matches .env / deploy compose)
mkdir -p database
touch database/database.sqlite

# OIDC signing key for JWKS + token issuance
openssl genrsa -out storage/idp_private.pem 2048

# Migrate + seed demo data
php artisan migrate:fresh --seed

# Serve
PHP_CLI_SERVER_WORKERS=4 php artisan serve --host=127.0.0.1 --port=8001
```

Then open:

- `http://127.0.0.1:8001/dashboard`
- `http://127.0.0.1:8001/api/.well-known/openid-configuration`
- `http://127.0.0.1:8001/catalog`

#### Notes

- The RSA signing key is expected at `storage/idp_private.pem` (ignored by git). Generate one for local dev:

```bash
openssl genrsa -out storage/idp_private.pem 2048
```

- Keep `PHP_CLI_SERVER_WORKERS` greater than `1` for local widget/profile refresh testing. The
  gateway can call back into `/guard/subject-profiles/tenant-candidates` while the host request is
  still waiting for the gateway result.

- In the `partners-examples` deploy lane, the container startup now creates:
    - `database/database.sqlite`
    - the initial Laravel schema + seed data
    - `storage/idp_private.pem` on first boot

- `IDP_BASE_URL` should point at the `/api` surface, not the web root. Example:

```bash
IDP_BASE_URL=https://xconectc-example.0x730.com/api
```

- `npm run seed:xconectc-tenant` seeds tenant-owned invoice/payment defaults into `clients.details_jsonb`, matching the `xconect` / `xconectb` tenant settings shape.

- Required env for the kit-backed tenant surface:
    - `XAPPS_GATEWAY_URL` (default `http://localhost:3000`)
    - `XAPPS_API_KEY` (tenant gateway/host API key)
    - `XCONECTC_GUARD_INGEST_API_KEY` (default `xconectc-tenant-guard-dev-key`)
    - `XCONECTC_HOST_PUBLIC_BASE_URL` (hosted proof/browser origin, default `http://localhost:8002`)
    - `XCONECTC_HOST_BACKEND_BASE_URL` (used only by xconectc's local starter/runtime assets, default `APP_URL`; `xconectc-host` has its own separate backend-base env)
    - `XCONECTC_ALLOWED_ORIGINS` (must include every browser origin calling `/api/*`; include `:5177` when testing portal/OIDC callback flows)
    - `XCONECTC_HOST_BOOTSTRAP_API_KEYS`
    - `XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET`
    - `XCONECTC_HOST_BOOTSTRAP_SIGNING_KEY_ID` / `XCONECTC_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON` when rotating bootstrap keys
    - `XCONECTC_HOST_SESSION_SIGNING_SECRET`
    - `XCONECTC_HOST_SESSION_SIGNING_KEY_ID` / `XCONECTC_HOST_SESSION_VERIFIER_KEYS_JSON` when rotating session keys
    - `XCONECTC_TENANT_PAYMENT_URL`
    - `XCONECTC_TENANT_PAYMENT_RETURN_SECRET` or `XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF`
    - `XCONECTC_TENANT_PAYMENT_RETURN_URL_ALLOWLIST`

- Current package status:
    - `xconectc` is the Laravel starter/reference app showing the PHP backend-kit full-tenant path plus the shared browser-host launcher flow.
    - `xconectc-host` is the paired Laravel hosted-integrator starter/reference app.
    - inside the canonical monorepo it may keep Composer `path` repositories for local development.
    - in the public starter/reference export, prefer Packagist packages `xapps-platform/xapps-php` and `xapps-platform/xapps-backend-kit` instead of local path repos.
