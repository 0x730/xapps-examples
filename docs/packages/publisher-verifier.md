# `@xapps-platform/publisher-verifier`

Backend verifier helper for JWS/WebAuthn subject-proof flows.

## Purpose

- Verify subject proof envelopes from callback payloads
- Verify JWS-based subject proofs
- Verify WebAuthn-based subject proofs

## Runtime

- Node.js backend/executor services

## Key exports

- `verifySubjectProofEnvelope`
- `verifyJwsSubjectProof`
- `verifyWebauthnSubjectProof`
- Subject action parsing/challenge helpers

## SDK relations

- Primarily consumed through `@xapps-platform/server-sdk` unified verification APIs.
- Independent use is valid for services that need direct verifier control.
- Frontend packages (`@xapps-platform/marketplace-ui`, `@xapps-platform/embed-sdk`, `@xapps-platform/widget-sdk`) should not call this package directly.

## Source

- Package: `packages/publisher-verifier`
- Local README: `packages/publisher-verifier/README.md`
