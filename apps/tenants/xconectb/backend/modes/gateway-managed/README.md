# Gateway Managed Mode

Use this mode when the gateway owns checkout and provider execution.

What the tenant implements here:

- guard execution endpoint: `/xapps/requests`
- tenant configuration for the gateway-managed lane
- return-signing configuration used by verification

Payment session clarity:

- gateway payment session is still used
- tenant does not expose payment session endpoints
- tenant does not host a payment page
- gateway hosts checkout directly

Policy endpoint to implement:

- `POST /xapps/requests`

Payment endpoints to implement:

- none on the tenant backend for this mode

What the tenant does not implement here:

- tenant payment page
- tenant payment session endpoints
- provider execution logic

Code in this folder:

- [payment.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/GatewayManaged/payment.php)
- [policy.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/GatewayManaged/policy.php)
