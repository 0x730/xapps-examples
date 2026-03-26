# `@xapps-platform/widget-sdk`

Browser bridge SDK for publisher widgets in iframe context.

## Purpose

- Typed API for bridge messaging (`createBridge`)
- Session/context access
- Request creation + request subscriptions + request events/artifacts
- Upload/session helper events
- Optional React hooks and global adapter wrapper

## Bridge Surface Summary

Request lifecycle:

- `createRequest(...)`
- `createMultipartRequest(...)`
- `getRequest(...)`
- `getResponse(...)`
- `getRequestEvents(...)`
- `getRequestArtifacts(...)`
- `attachRequestArtifact(...)`
- `subscribeRequest(...)`
- `unsubscribeRequest(...)`

Upload lifecycle:

- `createUpload(...)`
- `createMultipartUpload(...)`
- `putMultipartUploadPart(...)`
- `listMultipartUploadParts(...)`
- `completeMultipartUpload(...)`
- `getMultipartUpload(...)`

Guard/session/identity:

- `requestGuard(...)`
- `getVendorAssertion(...)`
- `signAction(...)`
- `requestTokenRefresh(...)`
- `getTools(...)` / `listTools(...)`

Event listeners:

- `onTokenRefresh(...)`
- `onSessionExpired(...)`
- `onRequestStatusUpdate(...)`
- `onGuardStatus(...)`
- `onThemeChanged(...)`
- `onFocusRequest(...)`
- `onFocusTrap(...)`

## Runtime

- Browser iframe (publisher-rendered widgets)

## Key exports

- `@xapps-platform/widget-sdk`: `createBridge`
- `@xapps-platform/widget-sdk/react`: `useXappsBridge`, `useToolRequest`
- `@xapps-platform/widget-sdk/adapter`: `XappsAdapter`, `init`

## Payment guard helpers

The package also ships payment-evidence helpers for pay-per-request guard flows:

- `attachPaymentEvidenceToGuardOrchestration(...)`
- `resolveGuardPrimaryActionLabel(...)`
- `reconcilePaymentEvidenceFromGuardBlocked(...)`
- `getPaymentGuardRefResolution(...)`
- `isPaymentGuardGovernanceReason(...)`

Governance reasons surfaced by guard runtime:

- `payment_guard_override_not_allowed`
- `payment_guard_pricing_floor_violation`

Runtime relation:

1. Host uses `@xapps-platform/embed-sdk` payment return helpers to parse/forward/clean one-time payment params.
2. Widget uses `@xapps-platform/widget-sdk` helpers to attach evidence and recover UI state (`Pay` vs `Submit`) after replay-rejected evidence (for example `payment_receipt_already_used`).
3. If host product uses `@xapps-platform/marketplace-ui`, that UI passes payment/return context to widget routes while widget-sdk keeps widget-side guard behavior deterministic.

Canonical evidence note:

- Widget helpers expect canonical `xapps_payment_*` params including required `xapps_payment_issuer`.

## Source

- Package: `packages/widget-sdk`
- Local README: `packages/widget-sdk/README.md`
