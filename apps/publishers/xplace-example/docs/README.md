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

## Next Monetization Role

After the current `OPEN-076` subscription-core checkpoint, `xplace-example` is
also the primary proving lane for monetization productization.

Execution order:

1. JSON Forms monetization app first
   - simpler rendering lane
   - manifest-driven monetization catalog
   - exercise all current monetization families on the same API/XPO rail
2. publisher-rendered monetization app second
   - login/register
   - plans
   - current access/current subscription
   - same gateway/API/XPO/invoice/guard seams underneath

Current landed starting point:

1. first JSON Forms monetization app scaffold:
   - [xplace-monetization-lab-jsonforms](../xapps/xplace-monetization-lab-jsonforms/README.md)
2. first publisher-rendered React monetization playground:
   - [xplace-creator-club-publisher-rendered](../xapps/xplace-creator-club-publisher-rendered/README.md)
   - current proving scope:
     - local login/register/link flow
     - contained workspace with:
       - dashboard
       - plans
       - tools
     - detached technical lab for payment/paywall/XMS reference coverage
     - current access/current subscription reads
     - wallet / ledger / recent transaction reads
     - controlled reference activation
     - hosted payment-session create + reconcile
     - XMS-backed tool execution and credit consumption
     - feature gating from current XMS state
   - intended local tenant lane:
     - `xconect`

Why here:

1. it is the public/reference publisher lane
2. it already sits next to the portal/embed/runtime/guard ecosystem we need to validate
3. it is the right place to prove full monetization behavior before extracting SDK/kits from the settled seams

Related docs:

- [Existing App Integration](../../../../docs/guides/11-existing-app-integration.md)
- [Publisher Integration Model](../../../../docs/specifications/01-publisher-rendered-integration.md)
