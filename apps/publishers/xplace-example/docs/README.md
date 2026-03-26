# `xplace-example` Publisher Guide

This guide is the public-facing publisher reference entrypoint for the `xplace-example` shell.

Planned role:

- public documentation for publisher integrators
- example xapp family coverage
- public deployment URLs
- explanation of how the publisher reference relates to:
  - `xconect`
  - `xconectb`
  - `xconectc`
  - host variants

Important distinction:

- private production publisher surface: [xplace](/home/dacrise/x/xapps/apps/publishers/xplace/README.md)
- public publisher reference surface: `xplace-example`

Current shell:

- backend runtime:
  - [backend/server.js](/home/dacrise/x/xapps/apps/publishers/xplace-example/backend/server.js)
  - [backend/package.json](/home/dacrise/x/xapps/apps/publishers/xplace-example/backend/package.json)

Implementation note:

- this workspace should remain a thin public-facing shell over shared publisher core
- do not duplicate publisher business logic here unless there is a deliberate long-term divergence

Concrete implementation map:

- [IMPLEMENTATION_MAP.md](/home/dacrise/x/xapps/apps/publishers/xplace-example/docs/IMPLEMENTATION_MAP.md)
