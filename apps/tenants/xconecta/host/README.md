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
- repo reference launcher/page controllers are served from `apps/tenants/reference-host-common` via:
  - `/host/reference-launcher-page.js`
  - `/host/xconecta-marketplace-host.js`
  - `/host/xconecta-single-xapp-host.js`
    These are repo reference host controllers, not the public SDK entrypoints.
- local asset aliasing lives in [../backend/routes/host/shared.js](../backend/routes/host/shared.js)
- shell/identity rendering helpers live in [xconecta-host-shell.js](./xconecta-host-shell.js)
- marketplace runtime/mount orchestration lives in [xconecta-host-runtime.js](./xconecta-host-runtime.js)
- local launcher config lives in [xconecta-reference-config.js](./xconecta-reference-config.js)
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

- [../../reference-host-common/host/reference-launcher-page.js](../../reference-host-common/host/reference-launcher-page.js)
  - repo reference launcher page controller used by the tenant launcher
- [../../reference-host-common/host/reference-marketplace-page.js](../../reference-host-common/host/reference-marketplace-page.js)
  - repo reference marketplace page controller, exposed here as `/host/xconecta-marketplace-host.js`
- [../../reference-host-common/host/reference-single-xapp-page.js](../../reference-host-common/host/reference-single-xapp-page.js)
  - repo reference single-xapp page controller, exposed here as `/host/xconecta-single-xapp-host.js`
- [xconecta-host-runtime.js](./xconecta-host-runtime.js)
  - xconecta-specific configuration for the shared browser runtime
  - theme, mounts, API base path, small callbacks
- [xconecta-host-shell.js](./xconecta-host-shell.js)
  - xconecta-only page chrome
  - header, identity chips, mode switch, placeholder rendering
- [xconecta-reference-config.js](./xconecta-reference-config.js)
  - xconecta-specific launcher config and storage keys
- [packages/browser-host/README.md](../../../../packages/browser-host/README.md)
  - browser SDK used by tenant hosts and integrators

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
- start from the canonical handoff in [apps/tenants/docs/tooling/first-hosted-tenant-integrator-handoff.md](../../docs/tooling/first-hosted-tenant-integrator-handoff.md)
- use the browser starter in [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- use xconecta to see how a real tenant brands and configures the same runtime contract
- for a first release, implement `single-panel` first and add `split-panel` only if the tenant really needs a separate widget pane

Still not implemented here:

- richer tenant UI/navigation/auth surfaces
