# Browser Host Package

Use this page for the shared browser-host layer.

Hosted-integrator visual flow:

- [docs/packages/hosted-integrator-flow.md](./hosted-integrator-flow.md)

Package:

- [packages/browser-host/README.md](../../packages/browser-host/README.md)

Current package shape:

- TypeScript source in `packages/browser-host/src/*`
- ESM browser output in `node_modules/@xapps-platform/browser-host/dist/*`
- stable package exports from `@xapps-platform/browser-host`

## What It Owns

`@xapps-platform/browser-host` owns the actor-agnostic browser host seams for marketplace and single-xapp surfaces:

- host shell helpers
- marketplace runtime wiring
- reference theme/runtime helpers
- marketplace bootstrap
- single-xapp bootstrap
- host proof/status rendering

It is intended to be used by tenant and publisher hosts alike.

Current shipped reference consumers:

- `apps/tenants/xconect`
- `apps/tenants/xconectb`
- `apps/tenants/xconectc` host-mode launcher/surfaces

## What Stays Local

Keep these local in tenant or publisher apps:

- page HTML/CSS
- branding and copy
- identity bootstrap storage keys
- actor-specific config and small callbacks
- owned-resource labels or other actor-specific UI decisions

## Rule

The package should stay actor-agnostic.

Differences between tenant and publisher host behavior should come from:

- credentials and rights
- accessible data
- local config
- local business/workspace UI
- owned-resource scope and actor-specific menus

Not from duplicated browser host runtime code.

## Relation To `@xapps-platform/embed-sdk`

`@xapps-platform/embed-sdk` remains the low-level browser SDK.

`@xapps-platform/browser-host` sits above it and provides the standard shared host flow:

- marketplace bootstrap
- single-xapp bootstrap
- shared runtime/theme wiring
- shared host proof/status panel

## Hosted Integrator Mode

Default behavior stays same-origin:

- host config from `/api/host-config`
- host mutations and sessions under `/api`
- bridge-v2 under `/api/bridge/*`

For a frontend running on another domain, set `backendBaseUrl` in the host
config. The package then derives the remote backend contract automatically:

- `/api/host-config`
- `/api/*` host mutation/session routes
- `/api/bridge/*` bridge-v2 routes

That frontend mode also requires the backend kit to allow the frontend domain
through `host.allowedOrigins`. Payment return allowlists should include the
frontend domain when owner-managed returns land back on the integrator UX.

For secure hosted-integrator bootstrap, obtain a short-lived bootstrap token on
the integrator backend first, then pass it into the browser host identity
state. `@xapps-platform/browser-host` forwards it automatically as
`X-Xapps-Host-Bootstrap` for the standard host/session routes.

Treat that token as short-lived bootstrap state, not durable browser identity.
When it expires, the frontend should re-run bootstrap instead of continuing
with stale subject state.

When the host should redirect back to a launcher page instead of `/`, set
`entryHref` in the local wrapper config. This is the intended seam for
same-origin tenant launchers such as `xconectc /catalog`, which bootstrap
identity locally and then hand off to the shared browser-host pages.
