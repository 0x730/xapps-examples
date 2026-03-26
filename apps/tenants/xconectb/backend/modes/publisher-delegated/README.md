# `publisher-delegated`

This mode keeps checkout gateway-hosted while delegated credentials and signing
are publisher-scoped.

Package implementation:

- [payment.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/PublisherDelegated/payment.php)
- [policy.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/Backend/Modes/PublisherDelegated/policy.php)

Local ownership remains small:

- guard execution endpoint
- delegated publisher config/secrets

The package still owns the actual default mode implementation.
