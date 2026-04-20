# `xconecta` Backend

This folder contains the current Node reference tenant backend for `xconecta`.

The important rule for integrators is simple:

- the default tenant backend now comes from the backend kit
- `xconecta` mainly shows how to configure it, brand it, and override it

## Read This First

- tenant backend contract:
  - [../docs/backend/README.md](../../docs/backend/README.md)
- route map:
  - [routes/README.md](./routes/README.md)
- tenant guide:
  - [../docs/README.md](../../docs/README.md)

## What Lives Here

This local backend now mainly owns:

- startup and config mapping:
  - [server.js](./server.js)
  - [lib/config.js](./lib/config.js)
- app-surface and host pages:
  - [lib/appSurfaceModule.js](./lib/appSurfaceModule.js)
  - [routes/host.js](./routes/host.js)
  - [routes/host/pages.js](./routes/host/pages.js)
  - [routes/host/shared.js](./routes/host/shared.js)
- tenant-specific subject-profile defaults:
  - [lib/subjectProfiles/defaultProfiles.js](./lib/subjectProfiles/defaultProfiles.js)
- thin mode entry surface:
  - [modes/index.js](./modes/index.js)

## Recommended Folder Structure

Keep local files only where `xconecta` is genuinely tenant-specific.

```text
backend/
  server.js
  lib/
    config.js
    appSurfaceModule.js
    subjectProfiles/defaultProfiles.js
  routes/
    host.js
    host/
      pages.js
      shared.js
  modes/
    index.js
    */README.md
  public/
    xconecta-seed-logo.svg
```

Practical rule:

- if the file defines default tenant backend behavior, it should live in the kit
- if the file expresses `xconecta` branding, config, subject data, or an
  explicit override, it can stay here

## What Comes From The Kit

The backend kit now owns the default tenant backend behavior for:

- `GET /health`
- `GET /api/reference`
- `GET /api/host-config`
- `POST /api/host-session/exchange`
- `POST /api/host-session/logout`
- `POST /api/reference-host-bootstrap`
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

`/api/reference-host-bootstrap` is the browser-safe local bootstrap seam for the
same-origin reference host pages. Ongoing hosted control-plane access still goes
through host-session exchange, not caller-supplied `subjectId`.

Source anchors:

- [packages/backend-kit/src/index.ts](../../../../packages/backend-kit/src/index.ts)
- [packages/backend-kit/src/backend/routes](../../../../packages/backend-kit/src/backend/routes/reference.ts)
- [packages/backend-kit/src/backend/routes/gateway](../../../../packages/backend-kit/src/backend/routes/gateway/hostApi.ts)
- [packages/backend-kit/src/backend/modes/index.ts](../../../../packages/backend-kit/src/backend/modes/index.ts)

## Local Run

```bash
cd apps/tenants/xconecta/backend
npm run dev
```

Default port: `3314`

Provisioning note:

- `XCONECTA_PUBLIC_BASE_URL` is still part of the tenant publish/provision
  path, even though the backend server itself mainly reads
  `XCONECTA_ALLOWED_ORIGINS` and the host/session secrets at runtime.

Required env for the hardened hosted/session contract:

- `XAPPS_GATEWAY_URL`
- `XCONECTA_GATEWAY_API_KEY`
- `XCONECTA_ALLOWED_ORIGINS`
- `XCONECTA_HOST_BOOTSTRAP_API_KEYS`
- `XCONECTA_HOST_BOOTSTRAP_SIGNING_SECRET`
- `XCONECTA_HOST_BOOTSTRAP_SIGNING_KEY_ID` / `XCONECTA_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON`
- `XCONECTA_HOST_SESSION_SIGNING_SECRET`
- `XCONECTA_HOST_SESSION_SIGNING_KEY_ID` / `XCONECTA_HOST_SESSION_VERIFIER_KEYS_JSON`
- `XCONECTA_TENANT_PAYMENT_URL`
- `XCONECTA_TENANT_PAYMENT_RETURN_SECRET` or `XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF`
- `XCONECTA_TENANT_PAYMENT_RETURN_URL_ALLOWLIST`

## Practical Rule

Do not copy this folder structure into a new tenant.

Instead:

- start from the backend kit
- keep local files only for tenant-specific seams
- use this folder as a reference for config, branding, and override shape

Recommended override order:

1. change backend-kit options
2. replace local branding/assets or subject-profile data
3. inject a hook/service override
4. override a route or mode only when the earlier seams are insufficient
