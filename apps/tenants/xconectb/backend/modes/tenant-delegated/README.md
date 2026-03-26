# Tenant Delegated Mode

Use this mode when checkout is still gateway-hosted, but tenant-scoped
delegated credentials and signing are used.

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

- [payment.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/TenantDelegated/payment.php)
- [policy.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/TenantDelegated/policy.php)
