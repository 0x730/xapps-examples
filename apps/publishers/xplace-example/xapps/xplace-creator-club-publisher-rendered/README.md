# `xplace-creator-club-publisher-rendered`

Publisher-rendered React playground for the next monetization proving lane in `xplace-example`.

Purpose:

- provide one simple publisher-rendered app for:
  - platform linking guard + publisher setup flow
  - login / register
  - package selection
  - current access / current subscription reads
- controlled reference activation
- hosted payment-session creation + reconcile
- feature gating against current XMS state
- keep it on the normal `xplace-example` backend and normal publish flow
- target the standard local tenant lane: `xconect`

Current model:

- widget manifest now uses the standard platform linking contract:
  - `linking.strategy = platform_v1`
  - `linking.setup_url = __XPLACE_BACKEND_BASE_URL__/creator-club/login`
  - `widgets[].requires_linking = true`
- secure widget bootstrap still comes from the platform wrapper
- the backend verifies browser widget context against the gateway
- before the widget opens, the platform linking guard can send the user into the
  publisher setup flow on `/creator-club/login`
- the React app then uses one local playground session for:
  - local account auth
  - current xapp / subject / installation context
  - XMS state reads and actions
- monetization still goes through the gateway XMS/XPO APIs, not a side backend model
- hosted payment lanes are definition-backed through manifest `payment_guard_definitions`,
  not a local ad hoc payment config
- billing-profile readiness is enforced at widget boot through the normal
  `before:session_open` subject-profile guard path, using the tenant-owned
  `xconect_tenant_billing_business` definition plus the shared publisher
  candidate endpoint
- the app now shows both:
  - `XMS mode` from the selected package/family
  - `Payment lane` from the selected payment definition

Covered families:

- `one_time_unlock`
- `subscription_plan`
- `credit_pack`
- `hybrid_plan`

Hosted payment definitions currently proved here:

- `creator_club_gateway_managed_hosted`
- `creator_club_tenant_delegated_hosted`
- `creator_club_publisher_delegated_hosted`

This is the first publisher-rendered playground app for testing in-app monetization behavior before widening the same ideas into JSON Forms and deeper runtime hooks.
