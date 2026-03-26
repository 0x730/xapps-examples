# xconectb backend

This is the PHP reference tenant backend for `xconectb`.

The important rule is the same as on Node:

- the default tenant backend comes from the backend kit
- `xconectb` mainly shows the PHP adapter, config mapping, branding, and
  tenant-specific overrides

## Read This First

- canonical tenant backend contract:
  - [../../docs/backend/README.md](/home/dacrise/x/xapps/apps/tenants/docs/backend/README.md)
- PHP route map:
  - [routes/README.md](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/routes/README.md)
- canonical tenant guide:
  - [../../docs/README.md](/home/dacrise/x/xapps/apps/tenants/docs/README.md)

## What Lives Here

This local backend now mainly owns:

- startup and config mapping:
  - [bootstrap.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/bootstrap.php)
  - [lib/config.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/config.php)
- app-surface and host pages:
  - [lib/appSurfaceModule.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/appSurfaceModule.php)
  - [routes/host/pages.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/routes/host/pages.php)
  - [routes/host/shared.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/routes/host/shared.php)
- tenant-specific subject-profile defaults:
  - [lib/subjectProfiles/defaultProfiles.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/subjectProfiles/defaultProfiles.php)
- thin mode docs:
  - [modes/README.md](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/modes/README.md)

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

- [functions.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/functions.php)
- [BackendKit.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/BackendKit.php)
- [Backend/Routes](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Routes/reference.php)
- [Backend/Modes/index.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/index.php)

## Local Run

- `npm run dev:xconectb`

Default port: `3313`

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
