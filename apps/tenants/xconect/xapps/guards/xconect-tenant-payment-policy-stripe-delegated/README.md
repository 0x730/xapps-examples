# xconect-tenant-payment-policy-stripe-delegated

Tenant-owned guard xapp for tenant-delegated Stripe checkout through the gateway.

- `payment_issuer_mode`: `tenant_delegated`
- `payment_scheme`: `stripe`
- `payment_allowed_issuers`: `tenant_delegated`
- `accepts`: `stripe` + `mock_manual` (`Mock Hosted Redirect`)
- `payment_ui.schemes`: authored hosted-page copy for `stripe` + `mock_manual`
- `payment_provider_credentials_refs.stripe.bundle_ref`: `platform://payment:tenant:stripe:bundle?scope=client&scope_id=__TENANT_CLIENT_ID__`
- delegated return signing ref: `payment_return_hmac_delegated_secret_refs.tenant_delegated.__TENANT_CLIENT_ID__`
- guard ref: `xconect_tenant_pay_by_request_delegated_stripe`

Local publish example:

```bash
npm run -s xapps -- publish \
  --from apps/tenants/xconect/xapps/guards/xconect-tenant-payment-policy-stripe-delegated/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xconect-policies-dev-api-key \
  --target-client-slug xconect \
  --replace __TENANT_CLIENT_ID__=<xconect-client-id> \
  --replace __XCONECT_TENANT_GUARD_BASE_URL__=http://localhost:3312 \
  --replace __GATEWAY_BASE_URL__=http://localhost:3000 \
  --replace __TENANT_PAYMENT_RETURN_SECRET_REF__=platform://payment:tenant:hmac?scope=client&scope_id=<xconect-client-id> \
  --bump-version patch \
  --write-manifest-version \
  --yes --force
```
