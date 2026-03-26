# `@xapps-platform/payment-hosted-client`

Browser-safe client for gateway-hosted payment page flows.

## Purpose

- Wrap hosted payment API endpoints used by payment UI.
- Keep payment page code session-first and thin.
- Keep provider adapter logic out of browser surfaces.

## Start Here

Use this package only after choosing a gateway-hosted lane from:

- `docs/guides/22-payment-integrator-lane-and-package-guide.md`

Recommended role:

- browser-side companion to `@xapps-platform/server-sdk` / `xapps-platform/xapps-php`
- not a replacement for backend payment authority

## Runtime

- Browser host/payment page (or browser-like environments with `fetch`).

## Key exports

- `createHostedPaymentClient(...)`
- Types:
  - `HostedPaymentSession`
  - `HostedPaymentCompleteResult`
  - `HostedPaymentClientSettleResult`
  - `HostedPaymentClientError`

## Endpoint contract wrapper

- `GET /v1/gateway-payment/session`
- `POST /v1/gateway-payment/complete`
- `POST /v1/gateway-payment/client-settle`

## Boundary

- No provider credentials.
- No provider adapter logic.
- No evidence signing authority.
- No guard policy authority.

## SDK relations

- Browser complement to `@xapps-platform/server-sdk` / `xapps-platform/xapps-php` server-side helpers.
- Works alongside `@xapps/payment-providers` by consuming outcomes of provider-backed hosted flows, without importing adapters in browser code.

## Source

- Package: `packages/payment-hosted-client`
- Local README: `packages/payment-hosted-client/README.md`
