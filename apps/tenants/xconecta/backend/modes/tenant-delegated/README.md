# Tenant Delegated Mode

Use this mode when checkout is still gateway-hosted, but tenant-scoped delegated credentials and signing are used.

What the tenant implements here:

- guard execution endpoint: `/xapps/requests`
- delegated payment settings/credential refs
- delegated return-signing configuration

Payment session clarity:

- gateway payment session is still used
- tenant does not expose payment session endpoints
- tenant does not host a payment page
- gateway hosts checkout, but with tenant delegated credentials/signing

Policy endpoint to implement:

- `POST /xapps/requests`

Payment endpoints to implement:

- none on the tenant backend for this mode

What the tenant does not implement here:

- tenant payment page
- tenant payment session endpoints
- direct provider execution UI

Code in this folder:

- [payment.js](../../../../../../packages/backend-kit/src/backend/modes/tenant-delegated/payment.ts)
- [paymentSession.js](../../../../../../packages/backend-kit/src/backend/modes/tenant-delegated/paymentSession.ts)
- [policy.js](../../../../../../packages/backend-kit/src/backend/modes/tenant-delegated/policy.ts)
- [policyContext.js](../../../../../../packages/backend-kit/src/backend/modes/tenant-delegated/policyContext.ts)
