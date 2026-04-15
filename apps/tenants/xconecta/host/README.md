# xconecta host

This folder contains the tenant browser host reference for `xconecta`.

## Read this first

- host integration guide:
  - [../../docs/host/README.md](../../docs/host/README.md)
- tenant guide:
  - [../../docs/README.md](../../docs/README.md)

Current state:

- marketplace entry page exists at [index.html](./index.html)
- marketplace shell exists at [marketplace.html](./marketplace.html)
- single-xapp demo page exists at [single-xapp.html](./single-xapp.html)
- marketplace bootstrap/orchestration lives in [xconecta-marketplace-host.js](./xconecta-marketplace-host.js)
- single-xapp bootstrap lives in [xconecta-single-xapp-host.js](./xconecta-single-xapp-host.js)
- shell/identity rendering helpers live in [xconecta-host-shell.js](./xconecta-host-shell.js)
- marketplace runtime/mount orchestration lives in [xconecta-host-runtime.js](./xconecta-host-runtime.js)
- tenant-owned payment page exists at [tenant-payment.html](./tenant-payment.html)
- current reference launch path:
  - `GET /`
  - enter name + email
  - choose language
  - choose `single-panel`, `split-panel`, or `single-xapp`
  - launch the selected host surface with a gateway-resolved stable subject id
- the launcher and host headers now expose language selection for embed/runtime testing
- direct host testing can also use `?locale=en` or `?locale=ro`
- the payment page remains the owner-managed payment reference for the current production lane

## How to read the host split

- [xconecta-marketplace-host.js](./xconecta-marketplace-host.js)
  - tiny entrypoint
  - reads stored identity/bootstrap state
  - delegates to the shared marketplace bootstrap
- [xconecta-host-runtime.js](./xconecta-host-runtime.js)
  - xconecta-specific configuration for the shared browser runtime
  - theme, mounts, API base path, small callbacks
- [xconecta-host-shell.js](./xconecta-host-shell.js)
  - xconecta-only page chrome
  - header, identity chips, mode switch, placeholder rendering
- [packages/browser-host/README.md](../../../../packages/browser-host/README.md)
  - shared browser host package used by tenant hosts

## Required invariant

All xconecta host pages should share:

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

- do not copy `xconecta` file-by-file as the primary starter
- use the package starter in [packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html](../../../../packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html)
- use xconecta to see how a real tenant brands and configures the same runtime contract
- for a first release, implement `single-panel` first and add `split-panel` only if the tenant really needs a separate widget pane

Still not implemented here:

- richer tenant UI/navigation/auth surfaces
