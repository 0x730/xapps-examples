# `@xapps-platform/signing-client`

Browser signing helper for subject-action security flows.

## Purpose

- Canonicalization + hashing helpers
- Base64url helpers
- Ed25519 signing helpers
- WebAuthn signing/format helpers

## Runtime

- Browser/Web Crypto API
- Node.js environments with `crypto.subtle` (used by connector demos in this repo)

## Key exports

- `jcs`, `sha256Hex`, `hashPayload`
- `bytesToBase64url`, `base64urlToBytes`
- `generateEd25519KeyPair`, `exportPublicKey`, `signActionEd25519`
- `signActionWebAuthn`, `formatWebAuthnRegistration`

## SDK relations

- Optional browser-side helper that can be used by widget flows (`@xapps-platform/widget-sdk`) or host flows (`@xapps-platform/marketplace-ui`) when subject-signing UX is required.
- Not a replacement for `@xapps-platform/embed-sdk` (bridge/orchestration) or `@xapps-platform/server-sdk` (server verification and callback contracts).

## Source

- Package: `packages/signing-client`
- Local README: `packages/signing-client/README.md`
