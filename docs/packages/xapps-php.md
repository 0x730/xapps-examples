# `xapps-platform/xapps-php`

PHP helper SDK for lower-level backend primitives.

## Runtime context

- PHP 8.2+ for the package support floor
- PHP 8.5 for the current `xconectb` reference-tenant target
- Laravel/Symfony/custom PHP host backends

## Start Here

For PHP tenant or publisher backends, start with:

1. [docs/packages/backend-kit.md](./backend-kit.md)

Use `xapps-platform/xapps-php` directly when you need lower-level PHP primitives that
the backend kit does not own.

For hosted-integrator mode, `xapps-platform/xapps-php` is the lower-level PHP surface
under `xapps-platform/xapps-backend-kit`; integrators should not start here unless they
intentionally need primitive gateway/payment/signature helpers instead of the
packaged backend contract.

For lower-level payment integrations, then use:

1. `docs/guides/22-payment-integrator-lane-and-package-guide.md`
2. `packages/xapps-php/README.md`

## Baseline capabilities

- Parse dispatch request payloads
- Verify inbound Xapps signatures (HMAC)
- Verify inbound Xapps signatures (HMAC; `ed25519` supported when PHP `sodium` is available)
- Send callback events/completion to gateway
- Parse/sign/verify payment return evidence (`xapps_payment_orchestration_v1`)
- Gateway client for host proxy endpoints (API key and/or bearer token), including payment-session helpers
- Hosted gateway payment bootstrap helper for tenant/publisher backends
- Payment policy support helpers for tenant/publisher payment guards
- Publisher admin API client parity for publisher backends
- Injected subject-proof verifier surface (`SubjectProof::verifySubjectProofEnvelope|verifyJwsSubjectProof|verifyWebauthnSubjectProof`)

## Package path

- `packages/xapps-php`
- Local README: `packages/xapps-php/README.md`
- Examples overview: `packages/xapps-php/examples/README.md`
- Smoke example: `packages/xapps-php/examples/smoke/smoke.php`
- Live local smoke: `packages/xapps-php/examples/smoke/live.php`
- Cookbook: `docs/guides/19-php-sdk-cookbook.md`

## Supported distribution modes

Current supported ways to consume `xapps-platform/xapps-php`:

- local/path package from the monorepo during development
- split package mirror tag and/or Packagist release for integrator environments

Current release model:

- `0x730/xapps-sdk-php` is the public PHP source/control-plane repo
- package distribution is intended to happen through split package mirrors:
  - `0x730/xapps-php`
  - `0x730/xapps-backend-kit-php`
- Packagist should point to those split mirrors, not the raw multi-package source repo

Integrator rule:

- pin to an approved tag or commit, not a floating branch
- use the package-local runner (`php packages/xapps-php/test/run.php`) or `composer test`
  as part of integration sign-off on the pinned version

## Relations

- Server-side sibling of `@xapps-platform/server-sdk` for PHP ecosystems
- Complements host/browser packages (`@xapps-platform/embed-sdk`, `@xapps-platform/marketplace-ui`, `@xapps-platform/widget-sdk`)
- Protocol/client parity counterpart for gateway payment-session semantics used alongside `@xapps-platform/server-sdk`
  (including additive scheme fields and hosted payment session helpers)
- Provider adapter package parity is currently Node-first (`@xapps/payment-providers`); PHP adapter package is deferred for this phase.

## Backend parity rule

- `xapps-platform/xapps-php` is not a separate product contract; it is the PHP backend parity SDK for shipped server-side integrator capabilities.
- `@xapps-platform/server-sdk` and `xapps-platform/xapps-php` should stay functionally aligned whenever a backend feature is meant to be supported cross-language.
- Parity should be maintained explicitly for:
  - callback client behavior and response shape
  - payment return parsing/signing/verifying
  - gateway and publisher client request/response normalization
  - machine-readable error/code semantics
  - host proxy request/response shapes for marketplace embedding

## Enterprise host proxy contract

`xapps-platform/xapps-php` now mirrors the Node-side host proxy surface for marketplace embedding.

Current PHP host-proxy pieces:

- `Xapps\\GatewayClient`
  - `resolveSubject(...)`
  - `createCatalogSession(...)`
  - `createWidgetSession(...)`
  - `listInstallations(...)`
  - `installXapp(...)`
  - `updateInstallation(...)`
  - `uninstallInstallation(...)`
- `Xapps\\EmbedHostProxyService`
  - `getNoStoreHeaders()`
  - `getHostConfig()`
  - `resolveSubject(...)`
  - `createCatalogSession(...)`
  - `createWidgetSession(...)`
  - `refreshWidgetToken(...)`
  - `listInstallations(...)`
  - `installXapp(...)`
  - `updateInstallation(...)`
  - `uninstallInstallation(...)`
  - `bridgeSign(...)`
  - `bridgeVendorAssertion(...)`

Starter/reference:

- `packages/xapps-php/examples/host-proxy/minimal.php`

## Current status

- Hardened baseline is in place: typed SDK exception taxonomy, callback retry/idempotency options,
  and injected subject-proof verifier surfaces are implemented.
- Direct local package verification now exists under `packages/xapps-php/test/`, including
  package-local checks for `Signature`, `PaymentReturn`, `CallbackClient`, `GatewayClient`,
  and `PublisherApiClient`.
- Verifier strategy is formalized for this cycle: adapter-first (`SubjectProof` injected verifier
  callbacks), with optional native verifier package as a future enhancement.

## Versioning & Release Policy (Current)

- Compatibility target: additive-only changes for public classes/methods in current minor track.
- Breaking changes: only in explicit major version bump with migration notes.
- Distribution source of truth:
  - monorepo commits/tags are the source of truth for integrator release provenance
  - path installs are for local development
  - VCS-pinned installs are the supported integrator consumption path in this cycle
- Error contract stability:
  - `XappsSdkError::errorCode` values are treated as machine-readable contract fields.
  - Existing error codes should not be repurposed.
- Retry/idempotency options:
  - New retry policy fields may be added additively.
  - Existing option keys keep backward-compatible semantics.
- Release gate (for this cycle):
  - direct local package runner passes (`php packages/xapps-php/test/run.php`)
  - smoke examples pass (`smoke.php`, `smoke-live.php` under expected local env)
  - integrator installs pin an approved tag or commit rather than a floating branch
  - package docs remain synchronized with the landed baseline and follow-on decisions.

## Local verification

- package-local runner: `php packages/xapps-php/test/run.php`
- Composer alias: `composer test` from `packages/xapps-php`
- smoke: `composer smoke`
- parity runner alias: `composer parity`

## Verifier Distribution Strategy (Current)

- `xapps-php` intentionally does not bundle crypto verifier implementations in this cycle.
- Contract surface is stable via `SubjectProof::verify*` injected adapters.
- Native verifier packaging can be added as a separate package later without breaking current SDK consumers.

## Callback Client Response Shape (Node Parity)

- Node `@xapps-platform/server-sdk` callback client returns `{ status, body }`
- `xapps-php` now returns the same shape (`['status' => ..., 'body' => ...]`)

## Guard reason compatibility

- Treat `GUARD_BLOCKED.reason` as additive and preserve `details` payload fields.
- Payment-governance reasons currently include:
  - `payment_guard_override_not_allowed`
  - `payment_guard_pricing_floor_violation`
- Payment guard definition provenance may be present in
  `details.payment_guard_ref_resolution` (`consumer_manifest` vs `owner_manifest`).

## Secret ref parity

- Native SDK resolution: `PaymentReturn::resolveSecretFromRef(...)` supports `env:` and `file:`.
- External schemes are supported additively via resolver callbacks:
  - `vault://`
  - `awssm://`
  - `platform://`
- `PaymentHandler` supports resolver injection through `secretRefResolver` /
  `secretRefResolvers` for gateway-core-linked external secret management.
