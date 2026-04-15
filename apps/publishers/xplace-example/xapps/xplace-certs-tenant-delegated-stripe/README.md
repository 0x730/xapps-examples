# xplace-certs-tenant-delegated-stripe

First-class `xplace-certs` variant for the tenant-delegated Stripe lane.

Grouped lane docs live here first:

- [docs/guides/xconect-xplace/README.md](../../../../../docs/guides/xconect-xplace/README.md)
- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

Current lane shape:

- subject-profile guard slug: `xconect-tenant-subject-profile-policy`
- subject-profile guard ref: `xconect_tenant_billing_business`
- payment guard slug: `xconect-tenant-payment-policy-stripe-delegated`
- payment guard ref: `xconect_tenant_pay_by_request_delegated_stripe`
- invoice hook: `after:response_finalized` / `tenant_response_invoice`
- notification hook: `after:response_finalized` / `tenant_response_finalized_email`

This variant is the first-class delegated showcase for:

- tenant-scoped Stripe bundle refs
- tenant-delegated payment signing lane
- tenant-delegated invoice configuration
- tenant-delegated notification configuration

Local publish example:

```bash
npm run -s xapps -- publish \
  --from apps/publishers/xplace-example/xapps/xplace-certs-tenant-delegated-stripe/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xplace-example-dev-api-key \
  --target-client-slug xconecta \
  --bump-version patch \
  --write-manifest-version \
  --yes --force
```
