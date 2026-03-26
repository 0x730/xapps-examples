# `@xapps/payment-providers`

Shared Node-first payment adapter package for gateway runtime and future integrator server usage.

## Purpose

- Provide one adapter contract across rails (`mock_manual`, `mock_immediate`, `stripe`, `paypal`, `netopia`).
- Keep provider execution isolated from orchestration/session authority.
- Keep adapter and webhook normalization semantics aligned.

## Start Here

Most tenant/publisher integrators should not start with this package.

Read first:

1. `docs/guides/22-payment-integrator-lane-and-package-guide.md`
2. `docs/guides/17-payment-integration-cookbook.md`

Recommended use of `@xapps/payment-providers`:

- advanced owner-managed Node backends
- platform/runtime adapter work
- custom provider execution surfaces

## Runtime

- Node.js server/backend only.
- Used by gateway payment runtime (`src/payments/providers/*`).

## Key exports

- Contracts:
  - `PaymentProviderAdapter`
  - `PaymentProviderResult`
  - `PaymentProviderExecutionContext`
  - `WebhookProcessingResult`
  - `NormalizedWebhookEvent`
- Registry:
  - `createPaymentProviderRegistry`
  - `registerPaymentProviderAdapter`
  - `resolvePaymentProviderAdapter`
- Defaults:
  - `createDefaultPaymentProviderRegistry`
  - `registerDefaultPaymentProviders`
- Adapters:
  - `@xapps/payment-providers/mock`
  - `@xapps/payment-providers/netopia`
  - `@xapps/payment-providers/stripe`
  - `@xapps/payment-providers/paypal`

## Boundaries

- Settlement execution only.
- Not a guard policy engine.
- Not a session ownership engine.
- Not a provider native SDK replacement.
- Public adapter failure metadata is intentionally generic; raw upstream provider errors should stay server-side.

## Execution Context Contract

`PaymentProviderExecutionContext` is server-side only and currently carries:

1. `gateway_base_url`
2. `profile` (`gateway_managed` / `owner_managed` / delegated variants)
3. `metadata` (session/provider phase hints)
4. `provider_credentials` (resolved credential map, never raw refs)

Credential rules:

1. `provider_credentials` is resolved by gateway runtime from secret refs (`env:`, `platform://`, vault/awssm providers).
2. Adapters should consume context credentials first and only then apply controlled fallback behavior.
3. Browser/hosted UI packages must never receive this context.
4. Runtime accepts either:
   - field-level provider refs (`providers.<provider>.<KEY> = "platform://..."`)
   - or `providers.<provider>.bundle_ref = "platform://..."`
5. `bundle_ref` secrets are JSON objects expanded server-side before adapter execution. Supported bundle payload shapes:
   - direct values: `{ "PAYPAL_CHECKOUT_BASE_URL": "https://..." }`
   - nested refs: `{ "refs": { "NETOPIA_API_KEY": "platform://..." } }`
   - canonical providers map: `{ "providers": { "netopia": { "refs": { ... } } } }`
6. The same bundle-aware contract is used by gateway webhook credential-ref JSON:
   - `GATEWAY_PROVIDER_<PROVIDER>_WEBHOOK_CREDENTIAL_REFS`
   - `GATEWAY_PROVIDER_WEBHOOK_CREDENTIAL_REFS`

PayPal credential contract for full rail behavior:

1. Required: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
2. Optional: `PAYPAL_API_BASE_URL` (sandbox default if omitted)
3. Compatibility-only fallback: `PAYPAL_CHECKOUT_BASE_URL` when API credentials are intentionally absent
   - Supported forms:
     - `https://.../checkoutnow?token=` (token query param)
     - `https://.../checkoutnow?token={token}` (placeholder)
     - `https://.../checkoutnow/` (path suffix append)
   - This is an external compatibility bridge only; xapps does not ship a built-in receiver for the synthetic `pp_{payment_session_id}` token.
   - Use it only when another PayPal-facing backend or bridge owns token resolution and buyer return handling.

NETOPIA credential contract:

1. API mode (recommended): `NETOPIA_API_KEY`, `NETOPIA_POS_SIGNATURE`
2. IPN verification: `NETOPIA_PUBLIC_KEY`, `NETOPIA_ACTIVE_KEY`, `NETOPIA_POS_SIGNATURE_SET`
3. Optional IPN tuning: `NETOPIA_HASH_METHOD` (defaults to `SHA512`)
4. Optional API tuning: `NETOPIA_API_BASE_URL`, `NETOPIA_START_PATH`, `NETOPIA_VERIFY_AUTH_PATH`
5. Hosted redirect fallback: `NETOPIA_CHECKOUT_BASE_URL`
6. Scheme key: `netopia`
7. API start call retries transient transport/5xx/429 failures with exponential backoff before falling back
8. v2 hosted flow: the adapter supports both direct `paymentURL` redirects and `customerAction` 3DS handoff responses from `/payment/card/start`
9. When Netopia returns `customerAction`, xapps renders an internal auto-submit handoff page, posts the buyer to Netopia-hosted authentication, accepts the provider POST return, and performs the documented `/payment/card/verify-auth` server call before final settlement
10. IPN verification follows the current NETOPIA SDK/public-docs model: signed JWT verification with NETOPIA public key, active-key match, allowed POS signature check, and request-payload hash validation for header-carried proofs
11. Non-`verify-auth` browser returns now reconcile against Netopia provider state instead of trusting return query params; if reconciliation is unavailable, xapps fails closed to `pending` and waits for webhook/reconcile

Checkout display title resolution (Stripe + Netopia):

1. Session metadata keys (first non-empty wins):
   - `payment_checkout_title`
   - `checkout_title`
   - `payment_title`
   - `title`
   - `xapp_title`
   - `ui.copy.title`
   - `payment_ui.copy.title`
   - `payment_description`
2. Fallback: `Xapps {xapp_id} / {tool_name}`

Mock adapter note:

1. `mock_manual` is the realistic localhost/test rail for provider-return coverage.
2. It returns `flow=hosted_redirect` and points the buyer at XPO-Core's own `/v1/gateway-payment/provider-return` route.
3. It does not require third-party credentials or webhooks.
4. Use it when you need to validate:
   - redirect -> return -> signed evidence
   - first submit after paid return
   - builder/runtime resume behavior
   - guard handling of hosted gateway-managed payment evidence
5. `mock_immediate` is the explicit fast smoke rail for instant `paid` settlement without redirect/finalize.
6. `mock_decline` remains the explicit deterministic immediate-failure rail.

Mock client-collect note:

1. `mock_client_collect.reconcileSessionStatus` intentionally always returns `pending`.
2. Settlement for `mock_client_collect` only advances via `finalizeClientCollect` (client-settle path).

PayPal decline note:

1. `INSTRUMENT_DECLINED` is treated as a terminal `failed` outcome for the current payment session.
2. Buyer retry requires a new gateway payment session; the adapter exposes `provider_decline_code=INSTRUMENT_DECLINED` and `buyer_retry=new_payment_session_required` in finalize failure metadata.

## SDK relations

- `@xapps-platform/server-sdk` and `xapps-platform/xapps-php` remain the canonical server-side protocol/evidence/gateway-client SDKs.
- `@xapps/payment-providers` is the shared adapter rail surface behind those semantics.
- `@xapps-platform/payment-hosted-client` is browser hosted-page API glue and does not expose provider adapters.

## Integrator Usage Patterns

### Owner-Managed (Node backend)

```ts
import {
  createPaymentProviderRegistry,
  registerPaymentProviderAdapter,
  resolvePaymentProviderAdapter,
} from "@xapps/payment-providers/registry";
import { createStripeAdapter } from "@xapps/payment-providers/stripe";

const registry = createPaymentProviderRegistry();
registerPaymentProviderAdapter(registry, createStripeAdapter());

const adapter = resolvePaymentProviderAdapter(registry, "stripe");
if (!adapter) throw new Error("provider_not_configured");

const result = await adapter.completeSession(session, {
  gateway_base_url: process.env.GATEWAY_BASE_URL || null,
  profile: "owner_managed",
});
```

### Gateway-Managed Runtime (Default registry)

```ts
import { createDefaultPaymentProviderRegistry } from "@xapps/payment-providers";

const registry = createDefaultPaymentProviderRegistry();
```

## `accepts[]` Helper Strategy (Locked)

Decision for this phase:

1. `accepts[]` construction stays runtime-owned (gateway or owner backend orchestration layer).
2. `@xapps/payment-providers` remains adapter-only and does not ship `buildPaymentAccepts(...)`.
3. Future helper extraction is allowed only if additive and contract-identical to runtime behavior.

## Source

- Package: `packages/payment-providers`
- Local README: `packages/payment-providers/README.md`
