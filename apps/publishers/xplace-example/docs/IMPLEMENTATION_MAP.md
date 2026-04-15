# `xplace-example` Implementation Map

This document defines how the current private `xplace` publisher should split into:

- shared publisher core
- private production `xplace`
- public publisher reference `xplace-example`

It is the concrete implementation companion for:

- [Public Example Reference Layer Audit](../../../../dev/engineering/audits/systems/PUBLIC_EXAMPLE_REFERENCE_LAYER_AUDIT.md)
- [TASK-041](../../../../dev/engineering/pm/OPEN_POINTS.md#task-041-public-example--reference-layer-for-tenants-hosts-and-publisher)
- [TASK-044](../../../../dev/engineering/pm/OPEN_POINTS.md#task-044-publisher-rendered-monetization-modes-and-module-composition)

## Current publisher-rendered reference lane

`xplace-example` is now the preferred isolated lane for proving publisher-rendered existing-app composition.

First implementation target:

- full publisher-rendered `xplace-certs`
- `gateway_managed` payment rail
- target monetization shape:
  - `after:request_created`
  - `after:response_ready` / `after:response_finalized` with release lock
  - with `after:payment_completed` as the platform-side continuation / unlock seam

Important current reality:

- the first request-held lifecycle slice is now implemented in core
- request-scoped payment reconcile/restart is now part of that held-request lifecycle
- compact toolbar context is now aligned across publisher-rendered and JSON Forms renderers
- the `xplace-example` certs widget now proves the current secure runtime pattern:
  - public bootstrap page
  - short-lived widget context from the wrapper
  - publisher backend verifies that widget token against the gateway before exposing request-capable UI
- current `before:tool_run` payment path should not be treated as a supported publisher-rendered mode yet
- making it real would require temporary request persistence before payment and promotion into the permanent request after payment

Current isolated reference source:

- [xplace-certs-gateway-stripe-publisher-rendered manifest](../xapps/xplace-certs-gateway-stripe-publisher-rendered/manifest.json)
- [xplace-example certs draft page](../backend/assets/xplace-certs-gateway-stripe-publisher-rendered.html)

Planned follow-on reference samples:

- `before:session_open`
- `after:response_ready` / `after:response_finalized` with release lock

Isolation rule:

- keep code per xapp/application family in its own example-lane module/folder
- do not mix `TASK-044` app-specific behavior into shared core unless a real generic seam is proven by a working app

Reference planning docs:

- [Publisher Integration Model](../../../../docs/specifications/01-publisher-rendered-integration.md)
- [Publisher Rendered Module Composition Audit](../../../../dev/engineering/audits/systems/PUBLISHER_RENDERED_MODULE_COMPOSITION_AUDIT.md)
- [TASK-044 Execution Note](../../../../dev/engineering/notes/TASK-044_PUBLISHER_RENDERED_CERTS_EXECUTION_NOTE.md)

## Next monetization proving lane

After the current `OPEN-076` Phase B checkpoint closes, `xplace-example` should
also carry the first full monetization reference apps.

Execution order:

1. JSON Forms monetization app first
   - manifest-driven catalog
   - prove all current monetization families:
     - `one_time_unlock`
     - `subscription_plan`
     - `credit_pack`
     - `hybrid_plan` where useful
   - validate the simpler xapp/rendering lane first
2. publisher-rendered monetization app second
   - login/register
   - plan selection
   - current subscription/access state
   - same gateway/API/XPO/invoice/guard boundaries underneath
   - manifest-defined paywalls v1 consumed through the same XMS catalog/API surface

Current landed starting point:

1. first JSON Forms monetization app scaffold:
   - `apps/publishers/xplace-example/xapps/xplace-monetization-lab-jsonforms`
2. normal example republish defaults now include that manifest

Immediate proving rule for that app:

1. it is the first integrated monetization control surface, not only a catalog sample
2. it should let a user:
   - view all current monetization options
   - choose package + scope
   - save/activate the selected option through the gateway monetization/XPO rail
   - use the real request installation/xapp context rather than a detached side-channel
3. after activation, the resulting state should be inspectable in:
   - portal/shared marketplace
   - publisher operator views
   - superadmin operator views
   - embed/runtime current-context reads
4. current landed implementation detail:
   - `xplace-monetization-lab-jsonforms` now performs reference activation through the shared
     `open_monetization_lab` tool using:
     - catalog resolution
     - prepare intent
     - controlled verified transaction
     - issue-access
   - this proves state propagation before deeper live-checkout enforcement
5. first operator checkpoint now landed on existing core xapp detail pages:
   - publisher xapp detail monetization view
   - superadmin xapp detail monetization view
   - both now expose:
     - catalog
     - subscriptions
     - entitlements
     - wallet accounts
6. next operator-product lane is explicit:
   - publisher monetization studio
   - manifest-compatible catalog authoring source
   - publish/version/import loop
   - runtime inspection and controlled operations on the same xapp
   - xapp-first now, reusable later for other monetizable entities
   - working note:
     - `dev/engineering/notes/xms/OPEN-076_PUBLISHER_MONETIZATION_STUDIO_NOTE.md`
   - current landed baseline:
     - dedicated publisher monetization builder page per xapp
     - xapp detail stays overview/entrypoint
     - draft-first manifest monetization editing
     - draft creation from the current manifest baseline
     - normal authoring is now draft-based and not gated behind publisher `devMode`
     - sectioned structured catalog editor for:
       - `products`
       - `offerings`
       - `packages`
       - `prices`
       - `usage_policies`
     - structured fields now cover:
       - titles / descriptions
       - status
       - placement
       - display order
       - metadata
       - trial / intro / country policies
       - real price slugs
       - schema-aligned package kinds
     - plus:
       - top-level advanced JSON for monetization extras
       - spreadsheet-style bulk import
     - current draft entity refs are now selectable in the studio for:
       - `product_ref`
       - `offering_ref`
       - `package_ref`
     - dedicated studio page now also includes:
       - runtime inspection for subscriptions / entitlements / wallet accounts
       - transaction inspection for the current xapp runtime surface
       - first runtime lifecycle actions for subscriptions:
         - refresh state
         - cancel
         - reconcile payment session
       - release actions for publish / archive on xapp versions
       - draft-vs-published release review for added / removed / changed catalog items
       - guided advanced recipe actions for:
         - `one_time_unlock`
         - `subscription_plan`
         - `credit_pack`
         - `hybrid_plan`
       - explicit support surface for complete monetization coverage:
         - entities:
           - `products`
           - `offerings`
           - `packages`
           - `prices`
           - `usage_policies`
           - `subscriptions`
           - `entitlements`
           - `wallet_accounts`
           - `transactions`
         - functionalities:
           - draft authoring
           - bulk import
           - cross-reference selection
           - runtime inspection
           - release review
           - release actions
           - guided advanced monetization options
           - lifecycle actions
           - overrides / temporary offers
           - reporting / audit views
7. this comes before deeper hook/guard-driven purchase enforcement in the proving lane

Current publisher-rendered monetization playground:

1. `apps/publishers/xplace-example/xapps/xplace-creator-club-publisher-rendered`
2. real publisher-rendered React shell served from the normal `xplace-example` backend
3. current proving scope:
   - platform linking guard + publisher setup flow on the normal manifest contract
   - local login/register for the playground surface
   - current catalog read from XMS
   - current access / current subscription / wallet account / wallet ledger read from XMS
   - controlled reference activation
   - hosted payment-session creation on the current XPO rail
   - workspace snapshot now attempts platform-style hosted finalize automatically for the latest
     checkout intent
   - explicit finalize/reconcile remains available in the technical lab as recovery/reference
   - the xapp manifest now also declares versioned `event_subscriptions` on the shared
     `xplace-example` webhook ingress for:
     - request completion/failure
     - `XMS` purchase intent / reconcile / access issuance / access snapshot lifecycle events
   - the workspace snapshot now reads a recent filtered `XMS` webhook feed from the shared
     `xplace-example` webhook store so the real app can show that those lifecycle events were
     received by the xapp
   - the technical lab monetization-state panel now renders that recent `XMS` event list in more
     detail for inspection
   - the xapp manifest now also declares `connectivity` + `endpoints.prod` on the shared
     `xplace-example` request ingress so the same app can later exercise platform request lanes
   - mixed-state runtime rendering for access / subscription / credits in the publisher-rendered UI
   - inferred durable unlock / entitlement visibility from current access projection + purchase activity
   - recent purchase intent / transaction visibility for the current proving flow
   - feature gating against current XMS state
   - current frontend structure keeps:
     - a contained member-facing workspace in `App.jsx`, split into:
       - `Dashboard`
       - `Plans`
       - `Tools`
     - a separate technical lab page in `App.jsx`
     - a dedicated app snapshot route for the workspace and app-named plan/tool actions
     - stateful playground orchestration in `hooks/useCreatorClubPlayground.js`
     - local copy / runtime shaping in `frontend/creator-club/lib/`
     - passive state refresh on the real app surface so plan/access/credits update without using technical buttons
   - current backend structure keeps:
     - HTTP routes in `backend/playground/routes.js`
     - gateway and XMS reads in `backend/playground/gatewayClient.js`
     - shared session/linking/runtime helpers in `backend/playground/runtimeSupport.js`
4. target local tenant lane:
   - `xconecta`
5. this app should remain the main publisher-rendered in-app monetization proving surface before widening the same ideas into additional renderers

Possible later follow-on:

1. provide a separate flexible guard/configuration xapp for per-xapp monetization settings
2. keep that outside the first proving lane

Important rule:

1. these apps should consume the landed monetization core
2. they should not redefine the core monetization model inside `xplace-example`
3. only after these apps are proven should we extract/update SDKs and kits from the exercised seams

## Current `xplace` surface

Current workspace files:

- backend:
  - [backend/server.js](../../xplace/backend/server.js)
  - [backend/db/repo.js](../../xplace/backend/db/repo.js)
  - [backend/db/schema.js](../../xplace/backend/db/schema.js)
  - [backend/domain/constants.js](../../xplace/backend/domain/constants.js)
  - [backend/domain/tools.js](../../xplace/backend/domain/tools.js)
- workspace scripts:
  - [scripts/provision-publisher.mjs](../../xplace/scripts/provision-publisher.mjs)
  - [scripts/provision-publisher-admin.mjs](../../xplace/scripts/provision-publisher-admin.mjs)
  - [scripts/prepare-republish-manifests.mjs](../../xplace/scripts/prepare-republish-manifests.mjs)
- xapp families:
  - [xplace-certs](../xapps/xplace-certs/README.md)
  - [xplace-certs-gateway-stripe](../xapps/xplace-certs-gateway-stripe/README.md)
  - [xplace-certs-tenant-delegated-stripe](../xapps/xplace-certs-tenant-delegated-stripe/README.md)
  - [xplace-weather-now-gateway-stripe](../xapps/xplace-weather-now-gateway-stripe/README.md)

## Classification

### Shared publisher core

These should become reusable between private `xplace` and public `xplace-example`:

- request ingest and callback flow
- PostgreSQL-backed request/webhook persistence
- shared publisher request statuses / modes / constants
- shared tool registry pattern
- publisher provisioning wrappers where behavior is generic
- package/runtime contract usage:
  - `@xapps-platform/server-sdk`
  - later publisher-side shared helpers if extracted further

Current likely shared-core file candidates:

- [backend/db/repo.js](../../xplace/backend/db/repo.js)
- [backend/db/schema.js](../../xplace/backend/db/schema.js)
- [backend/domain/constants.js](../../xplace/backend/domain/constants.js)
- generic pieces inside [backend/server.js](../../xplace/backend/server.js)
- generic workspace wrappers under [scripts](../../xplace/scripts)

First extracted shared-core path:

- [apps/publishers/shared/xplace-core](../../shared/xplace-core/README.md)

Landed so far:

- shared request/callback constants
- shared PostgreSQL schema bootstrap
- shared PostgreSQL repository layer
- shared request/callback runtime helpers
- shared tool and preview registry builders
- shared subject-profile envelope builders
- shared Fastify workspace app factory
- shared workspace script runner
- `xplace` runtime imports now use the shared core directly
- `xplace-example` now has a first real backend shell over the shared core
- `xplace-example` now has matching thin workspace script wrappers

### Private production `xplace`

These should remain specific to the private production publisher surface:

- production branding
- production application mix
- future production-only publisher routes or policies
- production deployment posture
- real operator/admin workflow that is not meant as public teaching material

### Public `xplace-example`

These should belong to the public publisher reference shell:

- public branding
- curated docs and onboarding
- simpler example-safe env/config defaults
- example deployment URLs
- public example xapp families and release notes

## Immediate split rule

Do **not** clone the whole `xplace` backend into `xplace-example`.

Instead:

1. keep `xplace-example` thin
2. document the shell and deployment posture there
3. only extract shared publisher core when a real divergence point appears

This avoids premature duplication while still making the public/private boundary explicit now.

## First extraction targets

When the next technical step begins, start in this order:

1. shared constants and DB layer
2. shared request ingest / callback lifecycle helpers
3. shared provisioning wrappers
4. split shell-specific route/config/branding concerns
5. introduce example-specific xapp family curation only after the shell is stable

Current note on provisioning wrappers:

- `xplace-example` now has its own root registration and republish entrypoints:
  - `scripts/provision/provision-xplace-example-publisher.mjs`
  - `scripts/provision/provision-xplace-example-publisher-admin.mjs`
  - `scripts/prepare/prepare-xplace-example-republish-manifests.mjs`
- those entrypoints now own the broader example xapp fleet directly
- production `xplace` keeps its own manifest/source tree only for the production XMS cert lane

## Xapp family rule

Current production `xplace` keeps only the production XMS cert lane. The broader pay-by-request,
Stripe-reference, and weather families now live under `xplace-example`.

Current deployment split:

- private production `xplace` keeps:
  - `xplace-certs-xms-jsonforms`
- public `xplace-example` carries the current broader example fleet:
  - `xplace-certs`
  - `xplace-certs-gateway-stripe`
  - `xplace-certs-tenant-delegated-stripe`
  - `xplace-weather-now-gateway-stripe`
  - `xplace-bonbun-public-iframe-publisher-rendered`
  - `xplace-bridge-session-publisher-rendered`
  - `xplace-certs-gateway-stripe-publisher-rendered`
  - `xplace-certs-xms-jsonforms`
  - `xplace-certs-xms-jsonforms-vc`
  - `xplace-creator-club-publisher-rendered`
  - `xplace-monetization-lab-jsonforms`

Current tenant mapping:

- `xconecta`
- `xconectb`
- `xconectc`
- `xconecta-host`
- `xconectb-host`
- `xconectc-host`
  use the broader `xplace-example` fleet

Practical local note:

- the intended Node reference family is `xconecta`
- the local example runtime now uses `xconecta` as its own tenant/backend lane

Near-term rule:

- production and example xapp ownership are now physically split
- `apps/publishers/xplace/xapps/*` is the production `xplace` XMS lane only
- `apps/publishers/xplace-example/xapps/*` is the broader example/reference fleet
- the command split is now explicit:
  - `npm run xplace:prepare-republish` -> production XMS cert lane
  - `npm run xplace-example:prepare-republish` -> current broader example fleet

## Deploy rule

Near-term deploy target:

- treat `partners` as the likely base for the broader public example lane

Current implication:

- do not overload `unified` / `split`
- keep production deploy language centered on private `xplace`
- carry `xplace-example` explicitly on the broader example/reference lane
- keep `xconect` tied to the narrow production lane
- use the example lane for `xconecta` / `xconectb` / `xconectc` and their host variants

Current acceptance note:

- `deploy/modes/partners-examples/` is now the active second-server public reference lane
- the public GitHub-only examples export is released as `xapps-examples@v0.1.22`

## Non-goals

Do not do these as part of the first `xplace-example` slice:

- duplicate the full backend
- duplicate all xapps
- turn `xplace-example` into a second unrelated publisher product
- make public examples depend on internal-only package boundaries
