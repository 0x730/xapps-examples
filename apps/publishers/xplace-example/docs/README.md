# `xplace-example` Publisher Guide

This guide is the public-facing publisher reference entrypoint for the `xplace-example` shell.

Planned role:

- public documentation for publisher integrators
- example xapp family coverage
- public deployment URLs
- explanation of how the publisher reference relates to:
  - `xconecta`
  - `xconectb`
  - `xconectc`
  - host variants

Current practical Node-lane note:

- the `xconecta` family is the intended Node reference lane
- the current local seeded proof/runtime commonly appears as `xconect`

Important distinction:

- private production publisher surface: [xplace](../../xplace/README.md)
- public publisher reference surface: `xplace-example`

Current shell:

- backend runtime:
  - [backend/server.js](../backend/server.js)
  - [backend/package.json](../backend/package.json)

Implementation note:

- this workspace should remain a thin public-facing shell over shared publisher core
- do not duplicate publisher business logic here unless there is a deliberate long-term divergence

Concrete implementation map:

- [IMPLEMENTATION_MAP.md](./IMPLEMENTATION_MAP.md)

## Current Priority

`xplace-example` is the isolated reference lane for the next publisher-rendered integration pass.

First implementation target:

- full publisher-rendered `xplace-certs` parity
- `gateway_managed` payment rail first
- initial monetization mode now wired: `after:request_created`
- request-scoped payment reconcile/restart is now part of the runtime contract for expired or missing hosted sessions
- shared compact toolbar context now exists in both publisher-rendered and JSON Forms widgets

Planned follow-on reference samples:

- `before:session_open`
- `after:response_ready` / `after:response_finalized` with release lock

Practical rule:

- keep xapp-specific code in the example lane
- only promote helpers into shared runtime/core when a real reusable seam is proven

Related docs:

- [Existing App Integration](../../../../docs/guides/11-existing-app-integration.md)
- [Publisher Integration Model](../../../../docs/specifications/01-publisher-rendered-integration.md)
