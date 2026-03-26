# Tenant Tooling

Use this page when the tenant team needs to know which packages and tools to
start from for integration.

## Quick Answer

If the tenant asks "what do we actually use?", the answer is:

- Node backend:
  - `@xapps-platform/backend-kit`
- PHP backend:
  - `xapps-platform/xapps-backend-kit`
- browser host:
  - `@xapps-platform/browser-host`
- publishing and validation:
  - `xapps` CLI

Drop to the primitive SDKs only when needed:

- Node primitives:
  - `@xapps-platform/server-sdk`
- PHP primitives:
  - `xapps-platform/xapps-php`
- low-level custom browser host work:
  - `@xapps-platform/embed-sdk`

## Tooling By Area

### Backend

Use the backend kit first:

- [docs/packages/backend-kit.md](../../../../docs/packages/backend-kit.md)

Why:

- default tenant backend behavior
- default route and mode surface
- config-driven backend assembly
- hooks and override seams

Use the primitive SDKs only when the tenant needs a deeper custom seam:

- [docs/packages/server-sdk.md](../../../../docs/packages/server-sdk.md)
- [docs/packages/xapps-php.md](../../../../docs/packages/xapps-php.md)

### Browser Host

Use:

- [docs/packages/browser-host.md](../../../../docs/packages/browser-host.md)
- [docs/packages/xapps-embed-sdk.md](../../../../docs/packages/xapps-embed-sdk.md)

Why:

- standard marketplace host runtime
- `single-panel`, `split-panel`, and `single-xapp` host surfaces
- bridge handling
- overlay, focus, and payment-resume behavior

Hosted-integrator references:

- [../host/README.md](../host/README.md)
- [../host-proof-common/README.md](../../host-proof-common/README.md)
- [../xconect-host/README.md](../../xconect-host/README.md)
- [../xconectb-host/README.md](../../xconectb-host/README.md)
- [../../../apps/tenants/xconectc/README.md](../../xconectc/README.md)
- [../../../apps/tenants/xconectc-host/README.md](../../xconectc-host/README.md)

### Publishing And Validation

Use:

- [docs/packages/xapps-cli.md](../../../../docs/packages/xapps-cli.md)

Why:

- validate manifests
- publish tenant-owned guards through the linked publisher path

## Recommended Integration Rule

Start from:

- backend kit
- shared browser host runtime
- xapps CLI

Do not start from:

- `widget-sdk`
- `widget-runtime`
- low-level internal runtime packages
- primitive backend SDKs, unless the tenant already knows it needs lower-level control

Starter/reference publication rule:

- the public `xapps-examples` repo exports the starter/reference app family using the canonical app names
- keep `-example` only for deploy hostnames/domains where the example lane must stay distinct from production

## Quickstarts

Use these next:

- Node.js:
  - [nodejs-quickstart.md](./nodejs-quickstart.md)
- PHP:
  - [php-laravel-quickstart.md](./php-laravel-quickstart.md)
- Laravel shape chooser:
  - [laravel-integration-map.md](./laravel-integration-map.md)

## Practical Rule

For the current tenant lane:

- backend stack choice changes the adapter layer
- it does not change the tenant contract
- it does not change the browser host contract
- it does not change the guard publishing model
