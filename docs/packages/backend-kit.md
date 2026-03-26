# Backend Kit Packages

Use this page for the higher-level backend-kit layer.

Hosted-integrator visual flow:

- [docs/packages/hosted-integrator-flow.md](./hosted-integrator-flow.md)

These packages sit above the primitive backend SDKs and provide:

- the current backend-kit contract for the shipped integrator lane
- the default backend composition currently consumed by the reference tenant backends
- the base that should later support tenant and publisher through adapters, not duplicated platform logic

These are real modular packages now, not reserved placeholders.

Current package shape:

- TypeScript source in `packages/backend-kit/src/*`
- ESM build output in `packages/backend-kit/dist/*`
- stable package exports from `@xapps-platform/backend-kit`

## Packages

- Node:
  - [packages/backend-kit/README.md](../../packages/backend-kit/README.md)
- PHP:
  - [packages/xapps-backend-kit-php/README.md](../../packages/xapps-backend-kit-php/README.md)

## What The Backend Kit Is For

Start here when you want:

- a working default backend for the current integrator contract
- default host, lifecycle, payment, guard, and subject-profile seams
- default shipped payment modes
- config-driven setup
- hook and override points

Important rule:

- Node and PHP variants should converge on the same backend behavior
- runtime differences belong in adapters
- actor differences belong in rights/scope/config/data access

Do not start here when you want low-level primitives only. In that case use:

- [docs/packages/server-sdk.md](./server-sdk.md)
- [docs/packages/xapps-php.md](./xapps-php.md)

## Consumer Shape

Recommended consumer model:

- Node imports `@xapps-platform/backend-kit`
- PHP loads `packages/xapps-backend-kit-php/src/functions.php`

Raw `src/...` paths are maintainer/source anchors. Runtime consumers should use the package exports and built package output.

## What The Kit Owns

The current kit layer owns the current shipped backend behavior for:

- health and reference routes
- host config, subject resolution, catalog session, and widget session routes
- installation lifecycle
- bridge routes
- guard request seam
- payment routes
- subject-profile route
- default mode tree
- payment runtime assembly
- host-proxy service assembly
- subject-profile sourcing hooks

For hosted-integrator mode, the same host API surface can be exposed to a
frontend on another domain. The backend-kit seam for that is:

- `host.allowedOrigins`

Leave it empty for same-origin consumers. Set it to the integrator frontend
origins when the browser host lives elsewhere and needs cross-origin access to
the browser-facing host API surface, including:

- `/api/host-config`
- `/api/resolve-subject`
- `/api/create-catalog-session`
- `/api/create-widget-session`
- host lifecycle routes under `/api/install*`
- bridge routes under `/api/bridge/*`

For the secure long-term hosted-integrator path:

- integrator backend calls `POST /api/host-bootstrap` with `X-API-Key`
- tenant backend resolves the subject through the gateway/host proxy
- tenant backend returns a short-lived `bootstrapToken`
- browser host uses `X-Xapps-Host-Bootstrap`
- raw platform API keys never enter browser code

In the current design, the tenant backend signs that bootstrap token locally.
The gateway participates in subject resolution, but does not issue the browser
bootstrap token itself.

That token should remain short-lived. Browser consumers should re-bootstrap
after expiry instead of treating `subjectId` alone as durable proof of hosted
integrator identity.

The default mode tree now covers:

- `gateway_managed`
- `tenant_delegated`
- `publisher_delegated`
- `owner_managed`

`owner_managed` is owner-aware, not tenant-hardcoded. A consumer can default
that lane toward tenant or publisher ownership via `payments.ownerIssuer`,
while still letting guard config narrow the issuer explicitly when needed.

In hosted-integrator mode, owner-managed return URLs should point back to the
frontend domain, and that frontend domain should be included in the payment
return URL allowlist.

It also owns the default modular package structure behind the stable public
entrypoints. The internal split now follows the same rule in both runtimes:

- options/config shaping
- payment runtime assembly
- host-proxy assembly
- backend module registration
- explicit mode tree
- explicit route tree

## What Stays Local

A consuming app should still keep these locally when they are actor-specific:

- startup and env/config mapping
- branding and host pages/assets
- tenant-specific subject-profile catalogs or resolver hooks
- actor-specific manifests and policy choices
- explicit mode or route overrides when needed

The backend kits own the subject-profile route seam, not the subject data
itself. Default profile catalogs and candidate resolution must come from local
app config or override hooks, not from package-embedded sample data.

## Rule

The public backend-kit surface should stay:

- module oriented
- config driven
- hook based

Do not turn it into a route-wrapper alias layer.

Do not turn package internals back into one giant facade file either. Split
internals behind the public entry surface instead.

## Current Direction

The current reference consumers are:

- [xconect server.js](../../apps/tenants/xconect/backend/server.js)
- [xconectb bootstrap.php](../../apps/tenants/xconectb/backend/bootstrap.php)

Publisher adaptation should restart from the same shared-core rule later.

The intended end state is:

- one backend contract
- Node and PHP runtime variants
- tenant and publisher adapters where rights/scope/data access differ
