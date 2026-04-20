# `xconecta` Backend Routes Map

Use this folder as the practical route map for the tenant backend.

If a tenant integrator asks “what is the core contract we must expose?”, start with [hostApiCore.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts).

The PHP reference tenant should mirror this map under [../../xconectb/backend/routes/README.md](../../../xconectb/backend/routes/README.md), not invent a second contract.

## Browser host + marketplace pages

These files serve the tenant-visible host shell and host assets.

- composition entry:
  - [host.js](./host.js)
- host-only folder:
  - [host/pages.js](./host/pages.js)
  - [host/shared.js](./host/shared.js)

## Mandatory tenant integration contract

This is the core route surface a tenant host needs to participate in the ecosystem browser flow.

- [hostApiCore.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts)

Routes:

- `GET /api/host-config`
- `POST /api/host-session/exchange`
- `POST /api/host-session/logout`
- `POST /api/reference-host-bootstrap`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

Implement this first. Keep it stable. Everything else is layered on top.

Canonical request shape for tenant implementations:

- prefer camelCase request fields
- do not add parallel snake_case aliases for the same request fields
- the main canonical fields are:
  - `hostReturnUrl`
  - `resultPresentation`
  - `guardUi`
  - `vendorId`
  - `subjectId`
  - `installationId`

## Required marketplace lifecycle

This is part of the required tenant marketplace contract for `xconecta`.

- [hostApiLifecycle.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostApiLifecycle.ts)

Routes:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

Treat this file as required for the tenant marketplace, because users need install/update/uninstall lifecycle behavior to actually use the platform as a marketplace.

## Optional advanced bridge seams

Add these only when the tenant host needs bridge renewal or advanced signing/vendor assertions.

- [hostApiBridge.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostApiBridge.ts)

Routes:

- `POST /api/bridge/token-refresh`
- `POST /api/bridge/sign`
- `POST /api/bridge/vendor-assertion`

This is the last layer to add.

## Grouped registration

This is the current composition layer for the tenant host contract. It should stay easy to scan.

- [hostApi.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostApi.ts)

## Contract boundary helper

This helper keeps request shaping and validation out of the actual route logic.

- [hostContractBoundary.js](../../../../../packages/backend-kit/src/backend/routes/gateway/hostContractBoundary.ts)

Treat this as the place that enforces the canonical camelCase contract.

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

- [payment.js](../../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)
- [guard.js](../../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)
- [subjectProfiles.js](../../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)

`xconecta` consumes these default gateway seams from the backend kit instead of owning local copies.

## Root support routes

- [reference.js](../../../../../packages/backend-kit/src/backend/routes/reference.ts)
- [health.js](../../../../../packages/backend-kit/src/backend/routes/health.ts)

`/api/reference` is the canonical self-describing route catalog for the tenant contract. Keep the PHP reference tenant close to this surface so cross-stack parity stays easy to review.
