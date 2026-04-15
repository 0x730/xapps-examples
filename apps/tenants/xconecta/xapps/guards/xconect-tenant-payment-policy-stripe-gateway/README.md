# xconect-tenant-payment-policy-stripe-gateway

Tenant-owned guard xapp for gateway-managed Stripe checkout through gateway.

- `payment_issuer_mode`: `gateway_managed`
- `payment_scheme`: `stripe`
- `accepts`: `stripe` + `mock_manual` (`Mock Hosted Redirect`)
- `payment_ui.schemes`: authored hosted-page copy for `stripe` + `mock_manual`
- `payment_provider_credentials_refs.stripe.bundle_ref`: `platform://payment:gateway:stripe:bundle`
- guard ref: `xconect_tenant_pay_by_request_gateway_stripe`

Local publish example:

```bash
npm run -s xapps -- publish \
  --from apps/tenants/xconecta/xapps/guards/xconect-tenant-payment-policy-stripe-gateway/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xconecta-policies-dev-api-key \
  --target-client-slug xconecta \
  --replace __TENANT_CLIENT_ID__=<xconecta-client-id> \
  --replace __GATEWAY_BASE_URL__=http://localhost:3000 \
  --replace __XCONECTA_TENANT_GUARD_BASE_URL__=http://localhost:3314 \
  --bump-version patch \
  --write-manifest-version \
  --yes --force
```
