# Tenant Integrator Guide

Use this guide when a tenant integrator wants the shortest path to a working
marketplace backend and host for the public starter/reference family.

This is the shared tenant-facing implementation guide. Use this page for what
the tenant backend and host must actually do, independently of whether the
tenant chooses Node, PHP, or the hosted-integrator browser path.

## Start Here

If you only read three pages first, read these:

1. [backend/README.md](./backend/README.md)
2. [tooling/README.md](./tooling/README.md)
3. [modules/README.md](./modules/README.md)

That gives you:

- the backend contract and backend-kit entry surface
- the Node/PHP quickstart path
- the supported mode and provider matrix
- the Laravel integration shape map:
  - [tooling/laravel-integration-map.md](./tooling/laravel-integration-map.md)

## Integrator Model

The current recommended tenant path is:

1. use the backend kit for the default tenant backend
2. use the shared browser host runtime
3. keep local code only for tenant-specific seams
4. override or extend only where the tenant really needs custom behavior

There are now two supported host shapes:

- same-origin tenant host:
  - [xconect host](../xconect/host/README.md)
  - [xconectb host](../xconectb/host/README.md)
- same-origin tenant launcher + shared host pages on the same app origin:
  - [xconectc](../xconectc/README.md)
- hosted-integrator frontend with tenant backend still hosted on our side:
  - [host-proof-common](../host-proof-common/README.md)
  - [xconect-host](../xconect-host/README.md)
  - [xconectb-host](../xconectb-host/README.md)
  - [xconectc-host](../xconectc-host/README.md)

## Laravel Reference Shapes

The Laravel samples now cover both supported PHP integration shapes:

- full tenant app with backend-kit routes plus local business/OIDC pages:
  - [xconectc](../xconectc/README.md)
- hosted-integrator shell that bootstraps into the tenant from another app:
  - [xconectc-host](../xconectc-host/README.md)

Practical rule:

- use `xconectc` when the tenant app itself owns the dashboard/auth/business UX
  and wants to host the marketplace surfaces locally
- use `xconectc-host` when the integrator shell is separate and should bootstrap
  into the tenant backend over the standard host contract
- both still use the same backend-kit/browser-host contract underneath

Practical rule:

- do not port all of `xconect`
- do not rebuild the default host/payment/lifecycle routes from scratch
- start from the backend kit and the shipped mode tree
- drop down to the primitive SDKs only when the tenant needs a deeper custom seam

## What Stays Local

Even when using the backend kit, the tenant still owns:

- startup and env/config mapping
- branding and host pages/assets
- tenant-specific subject-profile catalogs or resolver hooks
- guard manifests and tenant policy choices
- any explicit mode override or custom route behavior

The tenant should not need to reimplement:

- the default host contract
- installation lifecycle routes
- default payment route behavior
- default mode tree
- reference discovery surface

## Recommended Reading Order

1. Backend contract and what the kit already gives you:
   [backend/README.md](./backend/README.md)
2. Tooling and stack choice:
   [tooling/README.md](./tooling/README.md)
3. Supported capabilities and first-release recommendation:
   [modules/README.md](./modules/README.md)
4. Browser host details:
   [host/README.md](./host/README.md)
5. Integration consequences by area:
   [integrations/README.md](./integrations/README.md)
6. Guard ownership and publishing:
   [guards/README.md](./guards/README.md)
   and [publishing/README.md](./publishing/README.md)
7. Request and data seams:
   [data-seams/README.md](./data-seams/README.md)

Use [reference-options/README.md](./reference-options/README.md)
only when deciding how much more ownership the tenant wants later.

## Reference Grouping

Treat the tenant references by role first:

- Node starter/reference tenant:
  - [xconect](../xconect/README.md)
- vanilla PHP starter:
  - [xconectb](../xconectb/README.md)
- Laravel starter:
  - [xconectc](../xconectc/README.md)
- host-only references:
  - [xconect-host](../xconect-host/README.md)
  - [xconectb-host](../xconectb-host/README.md)
  - [xconectc-host](../xconectc-host/README.md)
- shared host support:
  - [host-proof-common](../host-proof-common/README.md)

Practical rule:

- `xconect` stays the canonical Node starter/reference tenant
- the first production tenant lane can still use `xconect`
- what remains private there is the production deploy/runtime posture around it, not the existence of `xconect` itself
- the public `xapps-examples` repo keeps these canonical app names
- use `-example` only in example-lane deploy domains/hostnames

## Current Scope

For the current lane:

- `xconect` is the Node reference tenant
- `xconectb` proves the same backend contract on PHP
- `xconectc` is the Laravel full-tenant reference
- `xconectc-host` is the Laravel hosted-integrator reference
- `xplace-example` is the public reference publisher surface
- the tenant backend must expose the secure gateway-facing seams used by the host
- the browser host should stay unprivileged

The first-release recommendation remains:

- browser host: shared runtime
- payments: Stripe, `gateway_managed`
- installation lifecycle: included
- invoicing: platform-managed
- notifications: platform-managed
- subject profiles: optional unless the tenant already has real data to supply

## Session Rule Of Thumb

For integrators, the current session model should be read in two layers:

- widget session:
  - short-lived widget token minted by the tenant/backend contract
  - renewed in place through the shared host/session bridge
- bootstrap session:
  - short-lived browser bootstrap token used for host/session routes
  - renewed through silent re-bootstrap on the current starter/reference host paths

Practical meaning:

- do not treat `subjectId` alone as durable browser proof
- keep raw API keys and signing secrets server-side
- let the shared host/runtime handle widget renewal
- let the local launcher/bootstrap seam handle bootstrap renewal

Use these pages next when session behavior matters:

- [docs/host/README.md](./host/README.md)
- [docs/backend/README.md](./backend/README.md)

## Locale Rule Of Thumb

The first platform i18n wave is aimed at the shipped shared surfaces:

- portal
- marketplace/embed UI
- widget-facing platform copy
- shared guard/remediation copy

Integrator hosts do not need a fully translated shell in that first wave.

They do need:

- one clear locale input into the shared browser-host/runtime path
- a way to test widget/embed behavior in another locale
- the ability to let shared packages own locale propagation instead of building a custom translation bridge

Reference planning note:

- [I18N_SYSTEM_AUDIT.md](../../../dev/engineering/audits/systems/I18N_SYSTEM_AUDIT.md)
