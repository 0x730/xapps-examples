# Tenant Integrator Guide

Use this page to choose the tenant integration shape before opening deeper docs.

## Choose The Shape First

There are only two starting shapes:

1. hosted-integrator first
2. full tenant backend second

### Hosted-integrator first

Use this first when the integrator already has a local application shell and we
keep the tenant backend hosted on our side.

For the current hosted-integrator path, subject profiles are mandatory for the
first hosted-integrator tenant lane.

Read in this order:

1. [tooling/first-hosted-tenant-integrator-handoff.md](./tooling/first-hosted-tenant-integrator-handoff.md)
2. [tooling/hosted-integrator-starter-contract.md](./tooling/hosted-integrator-starter-contract.md)
3. stack wrapper:
   - [tooling/nodejs-hosted-integrator-platform-tenant.md](./tooling/nodejs-hosted-integrator-platform-tenant.md)
   - [tooling/laravel-hosted-integrator-platform-tenant.md](./tooling/laravel-hosted-integrator-platform-tenant.md)

Practical meaning:

- local app owns shell, auth, and bootstrap proxy
- hosted tenant owns runtime authority
- browser host uses the shared `browser-host` surface

### Full tenant backend second

Use this when the integrator needs to own the tenant backend contract too.

Read in this order:

1. [full-mode/README.md](./full-mode/README.md)
2. [backend/README.md](./backend/README.md)
3. [host/README.md](./host/README.md)

## Current Recommended Reading Order

If you only open three pages first, open these:

1. [tooling/first-hosted-tenant-integrator-handoff.md](./tooling/first-hosted-tenant-integrator-handoff.md)
2. [tooling/hosted-integrator-starter-contract.md](./tooling/hosted-integrator-starter-contract.md)
3. [tooling/README.md](./tooling/README.md)

## Current References

Reference tenants and hosts remain useful, but they are examples, not the
integrator contract:

- Node reference tenant:
  - [xconect](../xconect/README.md)
- PHP reference tenant:
  - [xconectb](../xconectb/README.md)
- Laravel reference tenant:
  - [xconectc](../xconectc/README.md)
- hosted reference shells:
  - [xconect-host](../xconect-host/README.md)
  - [xconectb-host](../xconectb-host/README.md)
  - [xconectc-host](../xconectc-host/README.md)
- proof/reference shared assets:
  - [reference-host-common](../reference-host-common/README.md)
    - shared repo reference layer for `xconecta-host` and `xconectb-host`

## Practical Rule

For the current integration lane:

- keep the public browser contract in `@xapps-platform/browser-host`
- keep the backend contract in backend-kit
- treat reference hosts as examples, not required architecture
