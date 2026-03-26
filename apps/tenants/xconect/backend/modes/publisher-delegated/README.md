# Publisher Delegated Mode

Use this mode when checkout stays gateway-hosted but the delegated payment lane
and delegated signing are publisher-scoped.

What the backend must provide:

- guard execution endpoint: `/xapps/requests`
- delegated publisher credential/signing configuration in the guard/manifest lane

What the backend does not own here:

- payment page hosting
- payment session endpoints

Code in this folder:

- [payment.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/publisher-delegated/payment.ts)
- [paymentSession.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/publisher-delegated/paymentSession.ts)
- [policy.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/publisher-delegated/policy.ts)
- [policyContext.js](/home/dacrise/x/xapps/packages/backend-kit/src/backend/modes/publisher-delegated/policyContext.ts)
