# host-proof-common

Shared hosted-integrator proof scaffold for the tenant reference hosts.

This folder is not a reusable package. It is the shared app/support layer used by:

- [xconect-host](../xconect-host/README.md)
- [xconectb-host](../xconectb-host/README.md)
- [xconectc-host](../xconectc-host/README.md)

Publication policy:

- keep this as a shared support module in the canonical repo
- treat it as part of the public starter/reference family exported through `xapps-examples`
- do not present it as the primary starter entrypoint by itself

It owns only the proof/reference host pieces:

- tiny local bootstrap proxy server shape
- proof host HTML/CSS/JS
- expiring bootstrap identity handling
- silent re-bootstrap on the proof/reference host path
- launcher-owned fallback when renewal cannot be recovered

It does not own:

- shared browser runtime logic
- gateway credentials
- tenant backend host/session minting

Those stay in:

- [packages/browser-host/README.md](../../../packages/browser-host/README.md)
- [packages/backend-kit/README.md](../../../packages/backend-kit/README.md)
- [packages/xapps-backend-kit-php/README.md](../../../packages/xapps-backend-kit-php/README.md)

Session boundary rule:

- `host-proof-common` handles proof/reference launcher identity storage and bootstrap renewal
- shared packages handle widget-session renewal and terminal host-shell expiry behavior
- real integrators can replace this minimal proof layer with their own authenticated app shell, while keeping the same backend/host/session contract

Locale boundary rule:

- `host-proof-common` should stay locale-capable, not locale-heavy
- it may provide the active locale into the shared browser-host/runtime path
- it now exposes that through launcher and header language selectors plus
  `?locale=en|ro` on the host URL for easy embed testing
- it should not become a second full translation system beside the shared platform i18n layer
