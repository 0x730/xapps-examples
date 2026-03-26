# Tenant Backend Contract

This page explains the tenant backend surface an integrator should expose for
the current marketplace lane.

If you only read one backend page first, read
[../xconect/backend/routes/README.md](../../xconect/backend/routes/README.md).

The PHP reference tenant under
[../xconectb/backend](../../xconectb/backend/README.md)
should mirror this same contract, not define a second tenant API.

Laravel full-tenant reference:

- [../../../apps/tenants/xconectc/README.md](../../xconectc/README.md)

Hosted-integrator Laravel reference:

- [../../../apps/tenants/xconectc-host/README.md](../../xconectc-host/README.md)

## Start With The Backend Kit

Use the backend kit first:

- Node:
  - `@xapps-platform/backend-kit`
- PHP:
  - `packages/xapps-backend-kit-php/src/functions.php`

Use primitive SDKs only when you need a deeper override seam:

- Node:
  - <https://github.com/0x730/xapps-sdk-js/tree/main/packages/server-sdk#readme>
- PHP:
  - <https://github.com/0x730/xapps-sdk-php/tree/main/packages/xapps-php#readme>

Package `src/...` links below are source anchors for maintainers and reviewers,
not the preferred consumer surface.

## What The Kit Already Gives You

The backend kit now owns the default backend behavior for:

- health and reference routes
- host config / subject resolution / catalog session / widget session
- installation lifecycle
- bridge routes
- guard request seam
- default payment routes
- default subject-profile route
- default mode tree

Local tenant code should mainly provide:

- config and env mapping
- branding and host pages/assets
- subject-profile catalogs or resolver hooks
- optional route or mode overrides

In Laravel, that local layer can also include:

- dashboard/auth/business pages on the same app origin
- a same-origin launcher that resolves identity before handing off to shared
  host pages
- thin controllers that serve shared host assets or local launcher endpoints

## Recommended Local Tenant Structure

Keep the local backend small and predictable.

Recommended shape:

```text
backend/
  server.js|bootstrap.php
  lib/
    config.*
    appSurfaceModule.*
    subjectProfiles/
      defaultProfiles.*
  routes/
    host/
      pages.*
      shared.*
    README.md
  modes/
    index.js            # Node only when mode enablement normalization is local
    */README.md         # explicit mode docs / override notes
  public/
    tenant-branding-assets...
```

Practical ownership rule:

- package kit owns the default backend behavior
- local backend owns startup, config, branding, host pages, subject-profile data,
  and explicit overrides only

Do not rebuild default gateway routes or default mode implementations locally
unless the tenant really needs a custom seam.

## Override Strategy

Use the simplest override that matches the need.

- config override:
  change kit options for gateway URL, enabled modes, payment settings, reference
  metadata, or branding
- data override:
  replace default subject-profile catalogs or provide a custom resolver hook
- app-surface override:
  customize host pages, assets, and local browser-facing entry files
- runtime override:
  inject a custom host proxy service, gateway client, payment handler, or
  policy resolver only when the default runtime is not enough
- route or mode override:
  last resort; keep it explicit and local

Prefer config and hook seams before replacing route or mode behavior.

## Core Host Contract

This is the mandatory ecosystem integration surface for the tenant browser host.

Required routes:

- `GET /api/host-config`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

Hosted-integrator bootstrap route when the frontend lives on another origin:

- `POST /api/host-bootstrap`

Same-origin launcher note:

- a full tenant app can also expose a local bootstrap route for its own launcher
  page, then hand off to shared host pages on the same origin
- `xconectc` is the current Laravel reference for that pattern

Code anchors:

- [hostApiCore.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts)
- [hostContractBoundary.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostContractBoundary.ts)

Canonical request shape rule:

- implement the tenant contract in camelCase
- treat snake_case aliases as ingestion-boundary compatibility only
- do not design the tenant contract around multiple equivalent field names

## Marketplace Lifecycle

This is part of the required tenant marketplace contract for `xconect`.

Routes:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

Code anchor:

- [hostApiLifecycle.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiLifecycle.ts)

## Advanced Bridge

Add these only when the tenant actually needs them:

- `POST /api/bridge/token-refresh`
- `POST /api/bridge/sign`
- `POST /api/bridge/vendor-assertion`

Code anchor:

- [hostApiBridge.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiBridge.ts)

## Other Default Tenant Seams

The default tenant kit also includes:

- guard execution seam:
  - [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)
- payment routes:
  - [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)
- subject-profile route:
  - [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)
- reference discovery route:
  - [reference.js](../../../../packages/backend-kit/src/backend/routes/reference.ts)

## What Must Stay Tenant-Specific

Keep the tenant backend focused on:

- secure session minting
- tenant-specific signing and policy decisions
- tenant-specific branding and host pages
- tenant-specific subject-profile data or resolver hooks
- explicit mode or route overrides when the tenant really needs them

Do not move browser runtime logic into the backend contract.
Do not rebuild the backend-kit defaults locally unless the tenant truly needs an
override.
