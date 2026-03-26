# `@xapps-platform/server-sdk`

Node.js helper SDK for lower-level backend primitives.

## Purpose

- Parse dispatch payloads safely
- Verify callback/dispatch signatures
- Build canonical strings for signing contracts
- Send callback events/completions with callback token
- Provide retry/idempotency/error-taxonomy helpers for callback delivery hardening
- Provide a unified subject-proof verification surface (envelope + JWS + WebAuthn)
- Provide payment-return parse/sign/verify + signed redirect builder helpers for server-side guard orchestration flows

## Start Here

For tenant or publisher backends, start with:

1. [docs/packages/backend-kit.md](./backend-kit.md)

Use `@xapps-platform/server-sdk` directly when you need lower-level Node primitives that
the backend kit does not own.

For hosted-integrator mode, the common path is:

1. integrator frontend uses `@xapps-platform/browser-host`
2. integrator backend performs the server-to-server bootstrap call
3. tenant backend uses `@xapps-platform/backend-kit`
4. `@xapps-platform/server-sdk` stays underneath that higher-level contract

For lower-level payment integrations, then use:

1. `docs/guides/22-payment-integrator-lane-and-package-guide.md`
2. `packages/server-sdk/README.md`

Drop to provider adapters only if you intentionally own provider execution.

## Runtime

- Node.js server/backend

## Key exports

- `parseDispatchRequest`
- `verifyXappsSignature`
- `buildCanonicalString`
- `createCallbackClient`
- `XappsServerSdkError`
- `parsePaymentReturnEvidence`
- `parsePaymentReturnEvidenceFromSearch`
- `buildPaymentReturnCanonicalString`
- `signPaymentReturnEvidence`
- `buildPaymentReturnQueryParams`
- `buildSignedPaymentReturnRedirectUrl`
- `verifyPaymentReturnEvidence`
- `createGatewayApiClient`
- `buildHostedGatewayPaymentUrlFromGuardContext`
- `extractHostedPaymentSessionId`
- `resolveMergedPaymentGuardContext`
- `resolvePaymentGuardPriceAmount`
- `normalizePaymentAllowedIssuers`
- `hasUpstreamPaymentVerified`
- `buildPaymentGuardAction`
- `verifySubjectProofEnvelope`
- `verifyJwsSubjectProof`
- `verifyWebauthnSubjectProof`
- `createEmbedHostProxyService`

Gateway payment client helpers (via `createGatewayApiClient(...)`):

- `createPaymentSession(...)` with additive `scheme` / `payment_scheme` fields
- `getPaymentSession(...)`
- `completePaymentSession(...)`
- `getGatewayPaymentSession(...)`
- `completeGatewayPayment(...)`
- `clientSettleGatewayPayment(...)`

Host-facing gateway helpers (also via `createGatewayApiClient(...)`):

- `resolveSubject(...)`
- `createCatalogSession(...)`
- `createWidgetSession(...)`
- `listInstallations(...)`
- `installXapp(...)`
- `updateInstallation(...)`
- `uninstallInstallation(...)`

Client timeout baseline:

- `createGatewayApiClient(...)` and `createPublisherApiClient(...)` use a default 30s request timeout.
- Override with `requestTimeoutMs` (or alias `timeoutMs`) for slower environments or stricter fail-fast behavior.

## Gateway client field naming

For `createGatewayApiClient(...)`, prefer canonical `snake_case` request fields because they map
directly to the gateway API contract.

Examples:

- `payment_session_id`
- `page_url`
- `xapp_id`
- `tool_name`
- `payment_scheme`
- `return_url`
- `cancel_url`
- `xapps_resume`

Older camelCase aliases remain accepted for compatibility, but they are deprecated and should be
treated as migration-only convenience, not the preferred integrator surface.

## SDK relations

- Backend counterpart for host/frontend packages:
  - `@xapps-platform/embed-sdk` forwards payment return params in browser flows.
  - `@xapps-platform/marketplace-ui` renders those flows in host React apps.
  - `@xapps-platform/server-sdk` verifies/signs the canonical payment evidence and callback contracts server-side.
- Payment package relations:
  - `@xapps/payment-providers` provides Node adapter rail contracts and provider implementations used by gateway runtime.
  - `@xapps-platform/payment-hosted-client` is a browser-only hosted payment API wrapper and should not replace server SDK authority paths.
- Can compose with `@xapps-platform/publisher-verifier` for dedicated subject-proof verification APIs.

## Backend parity rule

- `@xapps-platform/server-sdk` is the canonical Node backend SDK for shipped integrator/server capabilities.
- `xapps-platform/xapps-php` should keep functional parity with this shipped backend contract where the feature is intended to be supported cross-language.
- When a backend integrator capability is promoted as shipped and cross-language, parity work is not optional follow-on polish.
- Areas that should stay aligned include:
  - callback client behavior and response shape
  - payment return parsing/signing/verifying
  - gateway and publisher client request/response normalization
  - machine-readable error/code semantics
  - host proxy request/response shapes for marketplace embedding

## Enterprise host proxy contract

`@xapps-platform/server-sdk` now owns the Node-side reference contract for marketplace host backends.

Use `createEmbedHostProxyService(...)` when the backend needs to expose the secure browser host boundary without leaking the gateway API key into the browser.

The service provides:

- `getHostConfig()`
- `getNoStoreHeaders()`
- `resolveSubject(...)`
- `createCatalogSession(...)`
- `createWidgetSession(...)`
- `refreshWidgetToken(...)`
- `listInstallations(...)`
- `installXapp(...)`
- `updateInstallation(...)`
- `uninstallInstallation(...)`
- optional bridge sign / vendor assertion hooks

This is the server-side counterpart to the browser host contract in `@xapps-platform/embed-sdk`.

Starter/reference:

- `packages/server-sdk/examples/host-proxy/minimal.mjs`
- examples overview:
  - `packages/server-sdk/examples/README.md`

## Supported host profiles

The recommended enterprise presentation is:

### Minimal embed profile

Required routes:

- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

### Marketplace lifecycle profile

Adds:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

### Advanced bridge profile

Adds only when needed:

- `POST /api/bridge/token-refresh`
- `POST /api/bridge/sign`
- `POST /api/bridge/vendor-assertion`

That distinction matters because integrators should not assume they must implement the full superset when they only need basic embedding.

## Browser/server split

The intended enterprise split is:

- `@xapps-platform/server-sdk`
  - privileged gateway calls
  - secure token/session minting
  - optional install/update/uninstall and advanced bridge routes
- `@xapps-platform/embed-sdk`
  - browser host/runtime orchestration
  - overlay/focus/bridge mutation handling
  - payment resume/browser-side lifecycle

Tenant code should then keep only:

- branding
- identity bootstrap
- optional override hooks
- host shell rendering

## Secret ref parity

- Sync resolution: `resolveSecretFromRef(...)` supports `env:` and `file:`.
- Async resolution: `resolveSecretFromRefAsync(...)` supports `vault://`, `awssm://`, and
  `platform://` (with injected `resolvePlatformSecretRef` callback).
- Handler parity: `createPaymentHandlerAsync(...)` enables external `secretRef` schemes without
  pre-resolving raw secrets.

## Guard reason compatibility

- `GUARD_BLOCKED.reason` is additive; backend integrations should branch on known values and pass
  unknown values through unchanged.
- Payment-governance reasons currently include:
  - `payment_guard_override_not_allowed`
  - `payment_guard_pricing_floor_violation`
- Payment guard definition provenance may be present in
  `details.payment_guard_ref_resolution` (`consumer_manifest` vs `owner_manifest`).

## Source

- Package: `packages/server-sdk`
- Local README: `packages/server-sdk/README.md`
