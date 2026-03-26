# Policy ownership

This local folder intentionally has no policy implementation files.

Default tenant policy behavior now lives in:

- [common.js](../../../../../../packages/backend-kit/src/backend/policies/common.ts)
  - shared payment-policy verification flow
  - shared payload/context normalization
  - shared payment action helper
  - shared allowed-issuer normalization

Use this local folder only if `xconect` later needs a truly tenant-specific
policy helper that should not live in the package defaults.

Do not recreate generic mode policy files here.
