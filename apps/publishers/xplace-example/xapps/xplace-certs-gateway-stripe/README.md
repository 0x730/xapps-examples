# xplace-certs-gateway-stripe

First-class `xplace-certs` variant using the gateway-managed Stripe guard lane.

Grouped lane docs live here first:

- [docs/guides/xconect-xplace/README.md](../../../../../docs/guides/xconect-xplace/README.md)
- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

It mirrors the same tenant-owned subject-profile guard contract as `xplace-certs`, then runs the Stripe payment guard.

- subject-profile guard slug: `xconect-tenant-subject-profile-policy`
- subject-profile guard ref: `xconect_tenant_billing_business`
- payment guard slug: `xconect-tenant-payment-policy-stripe-gateway`
- payment guard ref: `xconect_tenant_pay_by_request_gateway_stripe`
- tool: `submit_certificate_request_async`

Ownership split:

- tenant guard manifest owns the billing requirement and tenant source seam
- this publisher xapp only adds `subject_profile_sources.publisher`
- guard runtime still owns candidate normalization, selection, remediation, and provenance
- invoice identity comes from the selected billing profile; the JSON Form keeps only
  request-specific fields like company CUI and contact details

Local publish example:

```bash
npm run -s xapps -- publish \
  --from apps/publishers/xplace-example/xapps/xplace-certs-gateway-stripe/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xplace-example-dev-api-key \
  --target-client-slug xconecta \
  --bump-version patch \
  --write-manifest-version \
  --yes --force
```
