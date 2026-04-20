# xconectb backend

This is the PHP reference tenant backend for `xconectb`.

The important rule is the same as on Node:

- the default tenant backend comes from the backend kit
- `xconectb` mainly shows the PHP adapter, config mapping, branding, and
  tenant-specific overrides

## Read This First

- canonical tenant backend contract:
  - [../../docs/backend/README.md](../../docs/backend/README.md)
- PHP route map:
  - [routes/README.md](./routes/README.md)
- canonical tenant guide:
  - [../../docs/README.md](../../docs/README.md)

## What Lives Here

This local backend now mainly owns:

- startup and config mapping:
  - [bootstrap.php](./bootstrap.php)
  - [lib/config.php](./lib/config.php)
- app-surface and host pages:
  - [lib/appSurfaceModule.php](./lib/appSurfaceModule.php)
  - [routes/host/pages.php](./routes/host/pages.php)
  - [routes/host/shared.php](./routes/host/shared.php)
- tenant-specific subject-profile defaults:
  - [lib/subjectProfiles/defaultProfiles.php](./lib/subjectProfiles/defaultProfiles.php)
- thin mode docs:
  - [modes/README.md](./modes/README.md)

## Recommended Folder Structure

Keep local files only where `xconectb` is genuinely adapter- or tenant-specific.

```text
backend/
  bootstrap.php
  public/
    index.php
  lib/
    config.php
    appSurfaceModule.php
    subjectProfiles/defaultProfiles.php
  routes/
    host/
      pages.php
      shared.php
  modes/
    README.md
    */README.md
```

Practical rule:

- if the file defines default tenant backend behavior, it should live in the kit
- if the file expresses PHP adapter wiring, tenant config, branding, subject
  data, or an explicit override, it can stay here

## What Comes From The Kit

The PHP backend kit now owns the default tenant backend behavior for:

- `GET /health`
- `GET /api/reference`
- `GET /api/host-config`
- `POST /api/host-session/exchange`
- `POST /api/host-session/logout`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`
- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`
- `POST /api/bridge/*`
- `POST /xapps/requests`
- `POST /guard/subject-profiles/tenant-candidates`
- default tenant payment routes
- default tenant mode tree

`/api/reference-host-bootstrap` is the local browser-safe bootstrap seam exposed
by [routes/host/pages.php](./routes/host/pages.php)
for the same-origin reference host pages. Ongoing control-plane access still
goes through host-session exchange, not caller-supplied `subjectId`.

Source anchors:

- [functions.php](../../../../packages/xapps-backend-kit-php/src/functions.php)
- [BackendKit.php](../../../../packages/xapps-backend-kit-php/src/BackendKit.php)
- [Backend/Routes](../../../../packages/xapps-backend-kit-php/src/Backend/Routes/reference.php)
- [Backend/Modes/index.php](../../../../packages/xapps-backend-kit-php/src/Backend/Modes/index.php)

## Local Run

- `npm run dev:xconectb`

Default port: `3313`

The local script starts the PHP CLI server with `PHP_CLI_SERVER_WORKERS=4` by default. Keep that
concurrency in manual runs too, because gateway-driven widget requests can call back into this same
tenant backend while `/api/widget-tool-request` is still waiting.

Provisioning note:

- `XCONECTB_PUBLIC_BASE_URL` and optional `XCONECTB_API_URL` are still used by
  the tenant publish/provision path, even though the backend server itself
  mainly reads `XCONECTB_ALLOWED_ORIGINS` and the host/session secrets at
  runtime.

Required env for the hardened hosted/session contract:

- `XAPPS_GATEWAY_URL`
- `XCONECTB_GATEWAY_API_KEY`
- `XCONECTB_ALLOWED_ORIGINS`
- `XCONECTB_HOST_BOOTSTRAP_API_KEYS`
- `XCONECTB_HOST_BOOTSTRAP_SIGNING_SECRET`
- `XCONECTB_HOST_BOOTSTRAP_SIGNING_KEY_ID` / `XCONECTB_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON`
- `XCONECTB_HOST_SESSION_SIGNING_SECRET`
- `XCONECTB_HOST_SESSION_SIGNING_KEY_ID` / `XCONECTB_HOST_SESSION_VERIFIER_KEYS_JSON`
- `XCONECTB_TENANT_PAYMENT_URL`
- `XCONECTB_TENANT_PAYMENT_RETURN_SECRET` or `XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF`
- `XCONECTB_TENANT_PAYMENT_RETURN_URL_ALLOWLIST`

## Practical Rule

Do not treat this backend as a separate product lane.

Instead:

- use it as the PHP adapter/reference for the same tenant contract
- keep local PHP files only for tenant-specific seams
- use the shared tenant docs as the source of truth

Recommended override order:

1. change backend-kit options
2. replace local branding/assets or subject-profile data
3. inject a hook/service override
4. override a route or mode only when the earlier seams are insufficient
