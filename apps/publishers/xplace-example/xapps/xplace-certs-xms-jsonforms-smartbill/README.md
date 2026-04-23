# xplace-certs-xms-jsonforms-smartbill

Reference platform-rendered JSON Forms certificate app for `TASK-051`.

Commercial pricing posture:

- shipped sellable prices in this manifest are explicit `gross`
- runtime tax decomposes those payable totals from the canonical tax policy for invoices so this
  SmartBill sibling keeps the same buyer-facing commercial posture
- new catalogs should prefer explicit `gross` authoring unless they are deliberately tax-exclusive

This app proves XMS as a reusable system capability, not a certificate-specific shortcut:

- catalog-level package purchase in portal and embed
- hosted checkout lane selection through manifest `payment_guard_definitions`
  - `gateway_managed`
  - `tenant_delegated`
  - `publisher_delegated`
  - Stripe hosted checkout definitions for payment
- free trial subscription purchase through the existing XMS trial policy
- one-time unlock request allowance before certificate request execution
- credit-pack wallet top-up and request-time wallet consumption
- one-time/hybrid/subscription products with manifest-owned `included_credits` consumed as request allowance
- manifest-owned per-tool request cost through `monetization.usage_policies`
- subject-profile guard capture before tool run
- SmartBill invoice hook after payment completion
- gateway notification hook after response finalization
- active-subject scoped access, wallet, request, invoice, notification, and history state

The existing pay-by-request certificate apps remain unchanged and continue to cover XPO guard payment examples.

This app intentionally does not use `after:request_created` request-held payment gating. XMS purchase happens at catalog/paywall level, request-time XMS UX gating happens through reusable `before:tool_run` guard policy, final credit/access enforcement happens in the shared publisher request handler, and notification proving is bound to `after:response_finalized`.

Hosted payment lane contract:

- default hosted purchase can resolve to the gateway-managed Stripe definition
- the app also exposes explicit tenant-delegated and publisher-delegated Stripe-hosted definitions
- `mock_manual` is intentionally not exposed here; subscription and hybrid proving should stay on the real Stripe recurring lane
- `after_payment_completed` invoice routing follows the selected `payment_guard_ref`
  - `cert_xms_gateway_managed_hosted` -> `xms_gateway_smartbill_payment_invoice` -> SmartBill gateway invoice bundle
  - `cert_xms_tenant_delegated_hosted` -> `xms_tenant_smartbill_payment_invoice` -> SmartBill tenant invoice bundle
  - `cert_xms_publisher_delegated_hosted` -> `xms_publisher_smartbill_payment_invoice` -> SmartBill publisher invoice bundle
- recurring renewals stay on the same rule: the provider payment webhook settles the renewal, then
  the runtime triggers the same `after_payment_completed` invoice hook path for the stored XMS
  product/payment context
- the xapp uses xapp-specific invoice refs so the refs resolve from the consumer manifest, not from the internal invoice-handler owner manifest defaults
- the invoice definitions use the same owner-scope split as payment:
  - gateway lane reads `platform://invoice:gateway:smartbill:bundle`
  - tenant-delegated lane reads `platform://invoice:tenant:smartbill:bundle?scope=client&scope_id=<tenantClientId>`
  - publisher-delegated lane reads `platform://invoice:publisher:smartbill:bundle?scope=publisher&scope_id=<publisherId>`
- SmartBill invoice descriptions and line-item fallback copy come from locale-aware invoice template families (`en`/`ro`) instead of hard-coded invoice definition text.

Current status:

- this xapp is the SmartBill-ready sibling of the Stripe invoice reference app
- it is intentionally kept in the repo before live SmartBill test credentials are available
- payment remains on the proven Stripe hosted lane; only the invoice-provider layer changes
- SmartBill issuance/send/sync/settlement-registration behavior is code-backed behind the shared
  provider seam, but still not production-validated with live SmartBill credentials
- SmartBill webhook ingestion remains intentionally unsupported because the published vendor API
  does not define webhook endpoints/signature semantics

Settlement vs invoice lifecycle:

- refunds and chargebacks affect payment/XMS settlement state first
- they do not automatically void or mark the issued invoice uncollectible
- invoice lifecycle actions remain explicit operator/provider actions, separate from payment
  settlement reversal

Current request consumption policy:

- `submit_xms_certificate_request`
- `unit: certificate_request`
- `credit_cost: 2`

The credit cost is not form input. It is manifest-owned policy, exposed through `GET /v1/xapps/:xappId/monetization/usage-policies/:toolName`, so future JSON Forms tools can define their own XMS costs without trusting browser-submitted payload fields. In this reference app, request acceptance is derived from the active subject's real XMS state, not from a user-selected mode.
The request form no longer asks the user to choose an XMS mode. Runtime behavior is derived from the active subject's real XMS state:

- current access projection
- current subscription status
- credits remaining
- manifest-owned `credit_cost` for `submit_xms_certificate_request`

So this app proves the production posture we actually want for platform-rendered JSON Forms:

- catalog/paywall drives what can be bought
- guard/runtime UX blocks when allowance is missing
- publisher handler performs final authoritative access and credit validation

For the `cert_single_unlock` one-time package specifically:

- purchase issues a one-time entitlement plus `included_credits`
- submit consumes that allowance from the active subject
- once the included credits are exhausted, current coverage should read as consumed rather than available
- the package should become buyable again after exhaustion

For `cert_trial_monthly`:

- the trial is free-trial first, so initial activation should not open Stripe
- the trial issues `4` included credits against a request cost of `2`, so the subject can complete two requests during the trial lane
- that free trial is single-use across this app's recurring certificate plans for the active subject; later recurring upgrades like `cert_hybrid_monthly` are normal paid replacements, not a second trial
- recurring paid billing is the later Stripe concern, not the initial trial activation
