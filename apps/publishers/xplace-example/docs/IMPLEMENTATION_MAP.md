# `xplace-example` Implementation Map

This document defines how the current private `xplace` publisher should split into:

- shared publisher core
- private production `xplace`
- public publisher reference `xplace-example`

It is the concrete implementation companion for:

- [Public Example Reference Layer Audit](../../../../dev/engineering/audits/systems/PUBLIC_EXAMPLE_REFERENCE_LAYER_AUDIT.md)
- [TASK-041](../../../../dev/engineering/pm/OPEN_POINTS.md#task-041-public-example--reference-layer-for-tenants-hosts-and-publisher)

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
  - [xplace-certs](../../xplace/xapps/xplace-certs/README.md)
  - [xplace-certs-gateway-stripe](../../xplace/xapps/xplace-certs-gateway-stripe/README.md)
  - [xplace-certs-tenant-delegated-stripe](../../xplace/xapps/xplace-certs-tenant-delegated-stripe/README.md)
  - [xplace-weather-now-gateway-stripe](../../xplace/xapps/xplace-weather-now-gateway-stripe/README.md)

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
  - `scripts/provision-xplace-example-publisher.mjs`
  - `scripts/provision-xplace-example-publisher-admin.mjs`
  - `scripts/prepare-xplace-example-republish-manifests.mjs`
- those entrypoints still reuse the same current xapp source tree while the publisher shells are splitting
- the next change should be manifest/source ownership only when `xplace-example` needs its own version cadence

## Xapp family rule

Current production `xplace` xapps are the source of truth for the publisher baseline.

Current deployment split:

- private production `xplace` keeps the two Stripe cert families:
  - `xplace-certs-gateway-stripe`
  - `xplace-certs-tenant-delegated-stripe`
- public `xplace-example` carries the full current four-xapp set:
  - `xplace-certs`
  - `xplace-certs-gateway-stripe`
  - `xplace-certs-tenant-delegated-stripe`
  - `xplace-weather-now-gateway-stripe`

Current tenant mapping:

- `xconect` stays on the private production `xplace` lane
- `xconectb`
- `xconectc`
- `xconectb-host`
- `xconectc-host`
  use the broader `xplace-example` fleet

Near-term rule:

- do not duplicate the xapp family tree immediately
- keep the current source of truth in `apps/publishers/xplace/xapps/*` while the shells split
- move deployment ownership first, then split the xapp families physically only when the example lane needs its own manifest/version cadence
- the command split is now explicit:
  - `npm run xplace:prepare-republish` -> narrow private production pair
  - `npm run xplace-example:prepare-republish` -> full four-xapp example fleet

## Deploy rule

Near-term deploy target:

- treat `partners` as the likely base for the broader public example lane

Current implication:

- do not overload `unified` / `split`
- keep production deploy language centered on private `xplace`
- carry `xplace-example` explicitly on the broader example/reference lane
- keep `xconect` tied to the narrow production lane
- use the example lane for `xconectb` / `xconectc` and their host variants

## Non-goals

Do not do these as part of the first `xplace-example` slice:

- duplicate the full backend
- duplicate all xapps
- turn `xplace-example` into a second unrelated publisher product
- make public examples depend on internal-only package boundaries
