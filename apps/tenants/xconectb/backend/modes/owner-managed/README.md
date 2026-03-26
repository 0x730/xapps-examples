# Owner Managed Mode

Use this mode when the owner controls the payment page flow.

What the backend implements here:

- guard execution endpoint: `/xapps/requests`
- owner payment page on the current sample path: `/tenant-payment.html`
- owner payment page API on the current sample path:
  - `GET /api/tenant-payment/session`
  - `POST /api/tenant-payment/complete`
  - `POST /api/tenant-payment/client-settle`
- return-signing configuration

Payment session clarity:

- gateway payment session is still used underneath
- owner exposes payment session endpoints
- owner hosts the payment page
- owner page proxies/advances the gateway session through `/api/tenant-payment/*`

Policy endpoint to implement:

- `POST /xapps/requests`

Payment endpoints to implement:

- `GET /tenant-payment.html`
- `GET /api/tenant-payment/session`
- `POST /api/tenant-payment/complete`
- `POST /api/tenant-payment/client-settle`

What the owner may later extend here:

- custom provider logic
- custom payment UX
- custom page/session handling beyond the current sample page

Code in this folder:

- [payment.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/OwnerManaged/payment.php)
- [policy.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/OwnerManaged/policy.php)
- [paymentPageApi.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/OwnerManaged/paymentPageApi.php)
