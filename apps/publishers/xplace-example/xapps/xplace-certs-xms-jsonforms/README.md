# xplace-certs-xms-jsonforms

Reference platform-rendered JSON Forms certificate app for `TASK-051`.

This app proves XMS as a reusable system capability, not a certificate-specific shortcut:

- catalog-level package purchase in portal and embed
- free trial subscription purchase through the existing XMS trial policy
- one-time unlock request allowance before certificate request execution
- credit-pack wallet top-up and request-time wallet consumption
- one-time/hybrid/subscription products with manifest-owned `included_credits` consumed as request allowance
- manifest-owned per-tool request cost through `monetization.usage_policies`
- subject-profile guard capture before tool run
- gateway invoice hook after payment completion
- gateway notification hook after response finalization
- active-subject scoped access, wallet, request, invoice, notification, and history state

The existing pay-by-request certificate apps remain unchanged and continue to cover XPO guard payment examples.

This app intentionally does not use `after:request_created` request-held payment gating. XMS purchase happens at catalog/paywall level, request-time XMS UX gating happens through reusable `before:tool_run` guard policy, final credit/access enforcement happens in the shared publisher request handler, and notification proving is bound to `after:response_finalized`.

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
