# `xconect` Backend Routes Map

Use this folder as the practical route map for the tenant backend.

If a tenant integrator asks “what is the core contract we must expose?”, start with [hostApiCore.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts).

The PHP reference tenant should mirror this map under [../../xconectb/backend/routes/README.md](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/routes/README.md), not invent a second contract.

## Browser host + marketplace pages

These files serve the tenant-visible host shell and host assets.

- composition entry:
  - [host.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host.js)
- host-only folder:
  - [host/pages.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host/pages.js)
  - [host/shared.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/routes/host/shared.js)

## Mandatory tenant integration contract

This is the core route surface a tenant host needs to participate in the ecosystem browser flow.

- [hostApiCore.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts)

Routes:

- `GET /api/host-config`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

Implement this first. Keep it stable. Everything else is layered on top.

Canonical request shape for tenant implementations:

- prefer camelCase request fields
- treat snake_case aliases in the xconect reference as boundary-only compatibility helpers
- the main canonical fields are:
  - `hostReturnUrl`
  - `resultPresentation`
  - `guardUi`
  - `vendorId`
  - `subjectId`
  - `installationId`

## Required marketplace lifecycle

This is part of the required tenant marketplace contract for `xconect`.

- [hostApiLifecycle.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApiLifecycle.ts)

Routes:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

Treat this file as required for the tenant marketplace, because users need install/update/uninstall lifecycle behavior to actually use the platform as a marketplace.

## Optional advanced bridge seams

Add these only when the tenant host needs bridge renewal or advanced signing/vendor assertions.

- [hostApiBridge.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApiBridge.ts)

Routes:

- `POST /api/bridge/token-refresh`
- `POST /api/bridge/sign`
- `POST /api/bridge/vendor-assertion`

This is the last layer to add.

## Grouped registration

This is the current composition layer for the tenant host contract. It should stay easy to scan.

- [hostApi.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostApi.ts)

## Contract boundary helper

This helper keeps alias normalization and small ingestion compatibility out of the actual route logic.

- [hostContractBoundary.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/hostContractBoundary.ts)

Treat this as the only place where the Node reference should translate legacy/snake_case payloads into the canonical camelCase contract.

## Folder rule

- `routes/host/*`
  - tenant-visible host pages/assets only
- root `routes/*.js`
  - local support and composition routes only

For a consuming tenant app, that means:

- keep local `routes/host/*` when you own custom host pages or host assets
- consume default gateway routes from the backend kit unless you are making an
  explicit override
- do not recreate deleted local `routes/gateway/*` files just to mirror package
  defaults

## Gateway-facing tenant seams

These routes are also part of the gateway-facing tenant integration surface, even though they are not part of the host proxy contract itself.

- [payment.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/payment.ts)
- [guard.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/guard.ts)
- [subjectProfiles.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)

`xconect` consumes these default gateway seams from the backend kit instead of owning local copies.

## Root support routes

- [reference.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/reference.ts)
- [health.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/routes/health.ts)

`/api/reference` is the canonical self-describing route catalog for the tenant contract. Keep the PHP reference tenant close to this surface so cross-stack parity stays easy to review.
