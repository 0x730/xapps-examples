# `xconect` Backend

This folder contains the current Node reference tenant backend for `xconect`.

The important rule for integrators is simple:

- the default tenant backend now comes from the backend kit
- `xconect` mainly shows how to configure it, brand it, and override it

## Read This First

- tenant backend contract:
  - [../docs/backend/README.md](/home/dacrise/x/xapps/apps/tenants/docs/backend/README.md)
- route map:
  - [routes/README.md](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/README.md)
- tenant guide:
  - [../docs/README.md](/home/dacrise/x/xapps/apps/tenants/docs/README.md)

## What Lives Here

This local backend now mainly owns:

- startup and config mapping:
  - [server.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/server.js)
  - [lib/config.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/config.js)
- app-surface and host pages:
  - [lib/appSurfaceModule.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/appSurfaceModule.js)
  - [routes/host.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host.js)
  - [routes/host/pages.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host/pages.js)
  - [routes/host/shared.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host/shared.js)
- tenant-specific subject-profile defaults:
  - [lib/subjectProfiles/defaultProfiles.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/subjectProfiles/defaultProfiles.js)
- thin mode entry surface:
  - [modes/index.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/modes/index.js)

## Recommended Folder Structure

Keep local files only where `xconect` is genuinely tenant-specific.

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
    xconect-seed-logo.svg
```

Practical rule:

- if the file defines default tenant backend behavior, it should live in the kit
- if the file expresses `xconect` branding, config, subject data, or an
  explicit override, it can stay here

## What Comes From The Kit

The backend kit now owns the default tenant backend behavior for:

- `GET /health`
- `GET /api/reference`
- `GET /api/host-config`
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

Source anchors:

- [packages/backend-kit/src/index.ts](/home/dacrise/x/xapps/packages/backend-kit/src/index.ts)
- [packages/backend-kit/src/backend/routes](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/reference.ts)
- [packages/backend-kit/src/backend/routes/gateway](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApi.ts)
- [packages/backend-kit/src/backend/modes/index.ts](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/index.ts)

## Local Run

```bash
cd apps/tenants/xconect/backend
npm run dev
```

Default port: `3312`

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
