# Owner Managed Mode

Use this mode when the owner controls the payment page flow.

What the tenant implements here:

- guard execution endpoint: `/xapps/requests`
- tenant payment page: `/tenant-payment.html`
- tenant payment page API:
  - `GET /api/tenant-payment/session`
  - `POST /api/tenant-payment/complete`
  - `POST /api/tenant-payment/client-settle`
- return-signing configuration

Payment session clarity:

- gateway payment session is still used underneath
- tenant exposes payment session endpoints
- tenant hosts the payment page
- tenant page proxies/advances the gateway session through `/api/tenant-payment/*`

Policy endpoint to implement:

- `POST /xapps/requests`

Payment endpoints to implement:

- `GET /tenant-payment.html`
- `GET /api/tenant-payment/session`
- `POST /api/tenant-payment/complete`
- `POST /api/tenant-payment/client-settle`

What the tenant may later extend here:

- custom provider logic
- custom payment UX
- custom page/session handling beyond the current sample page

Code in this folder:

- [payment.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/payment.ts)
- [paymentSession.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/paymentSession.ts)
- [policy.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/policy.ts)
- [policyContext.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/policyContext.ts)
- [paymentAssets.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/paymentAssets.ts)
- [paymentPageApi.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/owner-managed/paymentPageApi.ts)
