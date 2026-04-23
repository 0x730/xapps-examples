# xplace-certs-xms-jsonforms-vc

Reference platform-rendered JSON Forms certificate app for `TASK-054`.

Commercial pricing posture:

- shipped sellable prices in this manifest are explicit `gross`
- runtime tax decomposes those payable totals from the canonical tax policy for invoices so this VC
  sibling follows the same preferred contract as the rest of the XMS examples
- new catalogs should prefer explicit `gross` authoring unless they are deliberately tax-exclusive

This sibling app keeps the older certificate XMS lane stable while proving virtual currencies on the same certificate UX shape:

- catalog-level package purchase in portal and embed
- hosted checkout lane selection through manifest `payment_guard_definitions`
  - `gateway_managed`
  - `tenant_delegated`
  - `publisher_delegated`
  - Stripe only in this reference app
- free trial subscription purchase through the existing XMS trial policy
- one-time unlock request allowance before certificate request execution
- credit-pack wallet top-up and request-time wallet consumption
- one-time/hybrid/subscription products with manifest-owned bundled `CERT_CREDITS`
- manifest-owned per-tool request cost through `monetization.usage_policies`
- named virtual-currency enforcement through `virtual_currency_code: CERT_CREDITS`
- subject-profile guard capture before tool run
- gateway invoice hook after payment completion
- gateway notification hook after response finalization
- active-subject scoped access, wallet, request, invoice, notification, and history state

This app intentionally proves the compatibility-first `TASK-054` posture:

- existing credits lanes remain valid
- virtual currencies are additive
- certificate proving can move to named balances without mutating the older cert app

Current request consumption policy:

- `submit_xms_certificate_request_vc`
- `unit: certificate_request`
- `credit_cost: 2`
- `virtual_currency_code: CERT_CREDITS`

So this app proves:

- subscription plans can issue recurring Certificate Credits
- one-time and hybrid plans can bundle Certificate Credits
- credit packs can top up the same named balance
- request-time spend can target the named virtual currency deterministically
