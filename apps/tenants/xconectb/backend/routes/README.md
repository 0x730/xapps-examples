# `xconectb` Backend Routes Map

Use this folder as the practical route map for the PHP tenant backend.

If a tenant integrator asks "what is the core contract we must expose?", start
with:

- [hostApiCore.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/hostApiCore.php)

Consumer rule:

- PHP apps should load [functions.php](../../../../../packages/xapps-backend-kit-php/src/functions.php)
- package `src/Backend/Routes/...` links here are source anchors, not the
  preferred wiring pattern

This file should stay easy to compare with the canonical Node map in
[../../xconect/backend/routes/README.md](../../../xconect/backend/routes/README.md).

## Browser Host And Marketplace Pages

These files serve the tenant-visible host shell and host assets:

- [host/pages.php](./host/pages.php)
- [host/shared.php](./host/shared.php)

Recommended local routing rule:

- keep local `routes/host/*` for browser-facing host pages/assets
- consume default gateway-facing tenant routes from the backend kit
- only add new local gateway routes when PHP needs an explicit override

## Mandatory Tenant Integration Contract

Routes:

- `GET /api/host-config`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

Code anchor:

- [hostApiCore.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/hostApiCore.php)

## Required Marketplace Lifecycle

Routes:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

Code anchor:

- [hostApiLifecycle.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/hostApiLifecycle.php)

## Optional Advanced Bridge

Routes:

- `POST /api/bridge/token-refresh`
- `POST /api/bridge/sign`
- `POST /api/bridge/vendor-assertion`

Code anchor:

- [hostApiBridge.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/hostApiBridge.php)

## Other Default Tenant Seams

- payment:
  - [payment.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/payment.php)
- guard:
  - [guard.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/guard.php)
- subject profiles:
  - [subjectProfiles.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/Gateway/subjectProfiles.php)
- reference:
  - [reference.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/reference.php)
- health:
  - [health.php](../../../../../packages/xapps-backend-kit-php/src/Backend/Routes/health.php)

## Practical Rule

The PHP route story should match the Node route story:

- same tenant contract
- same mode surface
- same ownership split
- only the runtime adapter changes
