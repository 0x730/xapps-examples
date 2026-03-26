# Tenant Host Integration

This page explains the tenant-owned browser host layer for the current
`xconect` reference lane and the shared host contract used by `xconectb` and
the `xconectc` launcher-backed variant.

If you only read one host file first, read
[../xconect/host/xconect-host-runtime.js](../../xconect/host/xconect-host-runtime.js).

## What The Host Owns

For the current lane, the host page owns:

- the visible tenant shell and branding
- the runtime backend-truth surface opened from the topbar `Info` action
  - confirms workspace, stack, current-subject installs, and tenant guard family
- the stable subject bootstrap flow
- mounting the shared marketplace runtime
- payment resume preservation in the browser
- local choices like `single-panel`, `split-panel`, or `single-xapp`

The host should not rebuild bridge/runtime orchestration manually.

## Host Invariant

All tenant host surfaces must follow one browser contract:

- one shared host scaffold
- one shared runtime contract
- one shared focus/overlay behavior

Allowed differences between host surfaces are only:

- shell copy and branding
- layout framing
- initial mount action

In the current reference lane, that means:

- `single-panel`
  - mounts the marketplace shell
- `split-panel`
  - mounts the marketplace shell with a dedicated widget pane
- `single-xapp`
  - mounts one xapp inside the same catalog/xapp-shell contract

## Host Surface Matrix

| Surface        | Purpose                                                   | Recommended use                        | Shared contract rule                                     |
| -------------- | --------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `single-panel` | full marketplace in one embedded surface                  | default first-release marketplace host | normal marketplace shell + normal focus/overlay behavior |
| `split-panel`  | full marketplace with dedicated widget panel              | when the tenant wants stronger framing | same marketplace shell/runtime, different layout framing |
| `single-xapp`  | direct demo/validation page for one already-deployed xapp | focused demos and validation only      | same marketplace shell/runtime, same focus/overlay       |

`single-xapp` is not a separate overlay model.

It must:

- use the same host shell conventions as marketplace
- use the same `mode-shell -> main-content -> panel -> #catalog` scaffold
- use the same shared expand/focus behavior as the other catalog surfaces
- differ only by the initial action: `mountXapp(xappId)`

Do not add page-local expand/focus rules just for `single-xapp`.

## Implementation Order

1. Start from `@xapps-platform/browser-host` for the standard host path.
2. Keep tenant-specific logic in the shell/bootstrap layer.
3. Use `single-panel` first unless the tenant really wants stronger host framing.
4. Add split-panel behavior only when it is a real product requirement.
5. Use the single-xapp surface only for focused demos or direct xapp validation, not as the main marketplace host.

## Recommended Browser Path

Start from the shared browser host layer and keep the tenant layer thin:

- `@xapps-platform/browser-host`
- `createStandardMarketplaceRuntime(...)`
- `createHostDomUiController(...)`
- `createHostPaymentResumeState(...)`

Use the lower-level host helpers only when the tenant truly needs a custom host shape.

## Hosted-Integrator Variant

The same host contract also supports a frontend-on-one-origin / tenant-backend-
on-another-origin shape.

Reference pieces:

- proof/common host scaffold:
  - [../host-proof-common/README.md](../../host-proof-common/README.md)
- Node proof host:
  - [../xconect-host/README.md](../../xconect-host/README.md)
- PHP proof host:
  - [../xconectb-host/README.md](../../xconectb-host/README.md)
- Laravel proof host:
  - [../xconectc-host/README.md](../../xconectc-host/README.md)

In that mode:

- integrator browser/frontend mounts `@xapps-platform/browser-host`
- integrator backend performs the server-to-server bootstrap call
- tenant backend still owns subject resolution, catalog/widget session minting,
  bridge routes, and payment/runtime behavior

## Same-Origin Launcher Variant

The same browser-host package also supports a same-origin tenant launcher that
resolves identity first, stores short-lived bootstrap state locally, and then
hands off to shared host pages on the same tenant origin.

Reference piece:

- Laravel launcher-backed sample:
  - [../../../apps/tenants/xconectc/README.md](../../xconectc/README.md)

In that mode:

- the tenant app owns the launcher page and local bootstrap POST
- shared host pages still come from `@xapps-platform/browser-host`
- `entryHref` should point back to the launcher instead of `/`
- the backend can stay same-origin, so `host.allowedOrigins` can remain empty
  unless another frontend origin is introduced later

## Read These In Order

- local host overview: [../xconect/host/README.md](../../xconect/host/README.md)
- runtime config: [../xconect/host/xconect-host-runtime.js](../../xconect/host/xconect-host-runtime.js)
- shell/chrome: [../xconect/host/xconect-host-shell.js](../../xconect/host/xconect-host-shell.js)
- thin entrypoint: [../xconect/host/xconect-marketplace-host.js](../../xconect/host/xconect-marketplace-host.js)
- focused xapp demo entrypoint: [../xconect/host/xconect-single-xapp-host.js](../../xconect/host/xconect-single-xapp-host.js)
- shared browser-host package: [packages/browser-host/README.md](../../../../packages/browser-host/README.md)
- hosted-integrator proof/common scaffold: [../host-proof-common/README.md](../../host-proof-common/README.md)
- hosted-integrator proof hosts:
  - [../xconect-host/README.md](../../xconect-host/README.md)
  - [../xconectb-host/README.md](../../xconectb-host/README.md)
  - [../xconectc-host/README.md](../../xconectc-host/README.md)
- same-origin launcher-backed tenant:
  - [../../../apps/tenants/xconectc/README.md](../../xconectc/README.md)

Publication rule:

- the public starter/reference family keeps the canonical app names
- `host-proof-common` is public shared support in that family
- use `-example` only for deploy hostnames/domains in the example lane

## Current Code Anchors

- [../xconect/host/README.md](../../xconect/host/README.md)
- [../xconect/host/index.html](../../xconect/host/index.html)
- [../xconect/host/marketplace.html](../../xconect/host/marketplace.html)
- [../xconect/host/single-xapp.html](../../xconect/host/single-xapp.html)
- [../xconect/host/xconect-marketplace-host.js](../../xconect/host/xconect-marketplace-host.js)
- [../xconect/host/xconect-single-xapp-host.js](../../xconect/host/xconect-single-xapp-host.js)
- [../xconect/host/xconect-host-runtime.js](../../xconect/host/xconect-host-runtime.js)
- [../xconect/host/xconect-host-shell.js](../../xconect/host/xconect-host-shell.js)

## Practical Rule

Keep tenant-specific code focused on:

- branding and copy
- truth-telling tenant proof data from `/api/reference`, `/api/host-config`, and `/api/installations`
- identity/bootstrap
- layout choices
- a few local callbacks

Push reusable runtime logic into the shared SDK instead of duplicating it in the page.
Do not turn the tenant host into a second runtime/framework layer.
