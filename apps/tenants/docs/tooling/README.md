# Tenant Tooling

Use this page when the question is: “which packages and docs do we actually use
to integrate?”

## Package Choice

Start with these packages first:

- Node backend:
  - `@xapps-platform/backend-kit`
- PHP backend:
  - `xapps-platform/xapps-backend-kit`
- browser host:
  - `@xapps-platform/browser-host`
- manifest publish and validation:
  - `xapps` CLI

Use the lower-level packages only when you need a deeper custom seam:

- Node primitives:
  - `@xapps-platform/server-sdk`
- PHP primitives:
  - `xapps-platform/xapps-php`
- low-level browser primitives:
  - `@xapps-platform/embed-sdk`

## Hosted-Integrator Path

For the current first hosted-integrator tenant lane, read in this order:

1. [first-hosted-tenant-integrator-handoff.md](./first-hosted-tenant-integrator-handoff.md)
2. [hosted-integrator-starter-contract.md](./hosted-integrator-starter-contract.md)
3. [nodejs-hosted-integrator-platform-tenant.md](./nodejs-hosted-integrator-platform-tenant.md)
4. [laravel-hosted-integrator-platform-tenant.md](./laravel-hosted-integrator-platform-tenant.md)

Practical rule:

- the canonical process is the handoff page
- the Node and Laravel pages are only stack-specific wrappers
- the browser starter is only the browser slice of that process

## Starter References

- browser starter:
  - [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- Node bootstrap proxy:
  - [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)
- PHP bootstrap proxy:
  - [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)

## Full Tenant Path

If the integrator needs to own the tenant backend as well, read these instead:

1. [../full-mode/README.md](../full-mode/README.md)
2. [../backend/README.md](../backend/README.md)
3. [../host/README.md](../host/README.md)

## Practical Rule

For the current lane:

- start from the canonical hosted-integrator handoff
- keep `@xapps-platform/browser-host` as the browser contract
- keep `reference-host-common` as repo reference only, not an integrator requirement

## Release Preflight (Packages + Examples)

Before running public package/example release procedure, do this preflight:

1. docs consistency pass for tenant host/backend contract pages
2. verify route/auth wording still matches implementation:
   - local browser-safe bootstrap adapter (`/api/browser/host-bootstrap` or
     `/api/reference-host-bootstrap`)
   - canonical tenant bootstrap (`/api/host-bootstrap`)
   - host-session exchange/logout
3. verify allowed-origins guidance is present for cross-origin/OIDC callback
   flows
4. run host-session contract suites (Node + PHP + browser-host contracts)
5. only then execute release/publish procedure for public packages and
   `xapps-examples`
