# xconect host

This folder contains the tenant browser host reference for `xconect`.

## Read this first

- host integration guide:
  - [../../docs/host/README.md](../../docs/host/README.md)
- tenant guide:
  - [../../docs/README.md](../../docs/README.md)

Current state:

- marketplace entry page exists at [index.html](./index.html)
- marketplace shell exists at [marketplace.html](./marketplace.html)
- single-xapp demo page exists at [single-xapp.html](./single-xapp.html)
- marketplace bootstrap/orchestration lives in [xconect-marketplace-host.js](./xconect-marketplace-host.js)
- single-xapp bootstrap lives in [xconect-single-xapp-host.js](./xconect-single-xapp-host.js)
- shell/identity rendering helpers live in [xconect-host-shell.js](./xconect-host-shell.js)
- marketplace runtime/mount orchestration lives in [xconect-host-runtime.js](./xconect-host-runtime.js)
- tenant-owned payment page exists at [tenant-payment.html](./tenant-payment.html)
- current reference launch path:
  - `GET /`
  - enter name + email
  - choose `single-panel`, `split-panel`, or `single-xapp`
  - launch the selected host surface with a gateway-resolved stable subject id
- the payment page remains the owner-managed payment reference for the current production lane

## How to read the host split

- [xconect-marketplace-host.js](./xconect-marketplace-host.js)
  - tiny entrypoint
  - reads stored identity/bootstrap state
  - delegates to the shared marketplace bootstrap
- [xconect-host-runtime.js](./xconect-host-runtime.js)
  - xconect-specific configuration for the shared browser runtime
  - theme, mounts, API base path, small callbacks
- [xconect-host-shell.js](./xconect-host-shell.js)
  - xconect-only page chrome
  - header, identity chips, mode switch, placeholder rendering
- [packages/browser-host/README.md](../../../../packages/browser-host/README.md)
  - shared browser host package used by tenant hosts

## Required invariant

All xconect host pages should share:

- the same top-level application shell
- the same shared browser runtime contract
- the same focus/overlay behavior

So for host surfaces:

- `single-panel`
  - primary marketplace host surface
- `split-panel`
  - marketplace host with dedicated widget pane
- `marketplace.html`
  - uses the normal marketplace shell contract
- `single-xapp.html`
  - should still use that same shell/runtime contract
  - it only changes the initial mounted target to one xapp
  - it should still reuse the marketplace `mode-shell -> main-content -> panel -> #catalog` scaffold

It should not invent:

- page-local overlay rules
- page-local focus semantics
- a second runtime model

## Practical rule

- do not copy `xconect` file-by-file as the primary starter
- use the package starter in [packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html](../../../../packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html)
- use xconect to see how a real tenant brands and configures the same runtime contract
- for a first release, implement `single-panel` first and add `split-panel` only if the tenant really needs a separate widget pane

Still not implemented here:

- richer tenant UI/navigation/auth surfaces
