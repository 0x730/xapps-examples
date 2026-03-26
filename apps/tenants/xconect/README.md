# xconect (tenant workspace)

`xconect` is the canonical Node tenant starter/reference workspace.

It is also the current tenant base used in the first `xconect + xplace` production lane.

## Read this first

- tenant implementation guide:
  - [docs/README.md](/home/dacrise/x/xapps/apps/tenants/docs/README.md)
- shared lane hub:
  - [docs/guides/xconect-xplace/README.md](/home/dacrise/x/xapps/docs/guides/xconect-xplace/README.md)

Suggested reading order:

1. [docs/README.md](/home/dacrise/x/xapps/apps/tenants/docs/README.md)
2. [docs/backend/README.md](/home/dacrise/x/xapps/apps/tenants/docs/backend/README.md)
3. [docs/host/README.md](/home/dacrise/x/xapps/apps/tenants/docs/host/README.md)
4. [docs/guards/README.md](/home/dacrise/x/xapps/apps/tenants/docs/guards/README.md)
5. [docs/integrations/README.md](/home/dacrise/x/xapps/apps/tenants/docs/integrations/README.md)
6. [docs/modules/README.md](/home/dacrise/x/xapps/apps/tenants/docs/modules/README.md)
7. [docs/tooling/README.md](/home/dacrise/x/xapps/apps/tenants/docs/tooling/README.md)
8. [docs/publishing/README.md](/home/dacrise/x/xapps/apps/tenants/docs/publishing/README.md)
9. [docs/data-seams/README.md](/home/dacrise/x/xapps/apps/tenants/docs/data-seams/README.md)

## What lives here

- tenant backend reference:
  - [backend/README.md](/home/dacrise/x/xapps/apps/tenants/xconect/backend/README.md)
- tenant host reference:
  - [host/README.md](/home/dacrise/x/xapps/apps/tenants/xconect/host/README.md)
- tenant-owned xapps and guards:
  - [xapps/README.md](/home/dacrise/x/xapps/apps/tenants/xconect/xapps/README.md)

## Current role

This workspace exists to show, in code, what a tenant must implement independently of tech stack:

- the minimum backend seam
- the tenant host/embed seam
- tenant-owned guards and policy choices
- tenant-specific configuration and secrets

Current mode families documented here:

- host surfaces:
  - `single-panel`
  - `split-panel`
  - `single-xapp`
- payment ownership:
  - `gateway_managed`
  - `tenant_delegated`
  - `publisher_delegated`
  - `owner_managed`

It is intentionally still a lean reference, not a full tenant product shell.

Important boundary:

- `xconect` is public-starter material
- production-specific behavior should live in private deploy/runtime overlays around it
- do not fork a second private Node tenant codebase unless the code actually proves that need

Practical rule:

- copy the contract, not the Node file layout
- if the real tenant uses PHP, Go, or another stack, reproduce the same request/response seams and ownership boundaries
- treat this workspace as the reference implementation of the tenant contract, not as a mandatory runtime stack

Dependency rule:

- inside this canonical monorepo, `xconect` currently uses local built-package wiring for coordinated development
- public starter/reference exports should prefer the published npm packages where they exist
- for those public exports, prefer the latest published stable versions by default

## Provisioning helpers

```bash
npm run seed:xconect-tenant
npm run seed:xconect-tenant-admin
npm run seed:xconect-policy-publisher
```

Workspace-owned wrapper entrypoints now live under:

- [scripts/provision-tenant.mjs](/home/dacrise/x/xapps/apps/tenants/xconect/scripts/provision-tenant.mjs)
- [scripts/provision-tenant-admin.mjs](/home/dacrise/x/xapps/apps/tenants/xconect/scripts/provision-tenant-admin.mjs)
- [scripts/provision-policy-publisher.mjs](/home/dacrise/x/xapps/apps/tenants/xconect/scripts/provision-policy-publisher.mjs)

Those wrappers delegate to the shared root implementations in [scripts](/home/dacrise/x/xapps/scripts), while keeping the tenant-owned operational entrypoints inside the `xconect` workspace.
