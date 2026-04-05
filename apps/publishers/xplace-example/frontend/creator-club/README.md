# Creator Club Frontend

This is the actual React source for the `xplace-creator-club-publisher-rendered` xapp.

Current wiring:

- backend bootstrap shell:
  - `apps/publishers/xplace-example/backend/assets/xplace-creator-club-publisher-rendered.html`
- backend route + esbuild bundle:
  - `apps/publishers/xplace-example/backend/playground/routes.js`
- React app entry:
  - `apps/publishers/xplace-example/frontend/creator-club/App.jsx`
- React orchestration hook:
  - `apps/publishers/xplace-example/frontend/creator-club/hooks/useCreatorClubPlayground.js`
- state view components:
  - `apps/publishers/xplace-example/frontend/creator-club/components/`
  - member overview/tools for the real app surface
  - technical-lab panels for package catalog, activation lane, paywall gallery, feature playground, and monetization state
- local view-model helpers:
  - `apps/publishers/xplace-example/frontend/creator-club/lib/`
  - playground runtime, monetization state, feature copy, package copy, and payment-lane copy helpers

The backend still serves and verifies the widget runtime, but the React surface now keeps most
stateful playground orchestration in the dedicated hook and small local helper modules instead of
packing it directly into `App.jsx`. The app shell itself now splits into:

- a contained workspace with:
  - `Dashboard`
  - `Plans`
  - `Tools`
- a detached technical lab page for explicit lane controls, paywall previews, and state inspection
- the workspace `Plans` surface now reads the manifest-defined XMS paywall projection from the
  current catalog response instead of hard-coding plan-surface assumptions in the app
- the xapp manifest now also carries:
  - versioned `event_subscriptions` for:
    - `xapps.request.completed`
    - `xapps.request.failed`
    - `xapps.xms.purchase_intent.prepared`
    - `xapps.xms.transaction.reconciled`
    - `xapps.xms.access.issued`
    - `xapps.xms.access_snapshot.refreshed`
  - shared `xplace-example` request ingress through `endpoints.prod.base_url`
  - shared event ingress through `__XPLACE_BACKEND_BASE_URL__/webhooks/events`
  - for local/dev runtime proving, loopback webhook delivery to that ingress is now accepted by
    the platform event worker outside production; production can still restrict loopback targets
    through `EVENT_DELIVERY_LOOPBACK_ALLOWLIST`
  - the shared event ingress now verifies signed `event_delivery` webhook headers using the same
    xapp endpoint secret currently provisioned for the xapp ingress path in `xplace-example`

The workspace now reads through the dedicated app snapshot endpoint and uses app-specific plan/tool
actions. When the latest hosted checkout intent is known, that workspace snapshot also attempts
hosted finalize automatically so the business-facing app can refresh plan/access state on return or
focus without depending on the technical lab button flow. The technical lab keeps the more detailed
playground/XMS controls and explicit finalize/reconcile buttons. The workspace snapshot also carries
a compact lifecycle summary for the latest hosted checkout so the business-facing surface can show
that the canonical XMS reconcile/issue/refresh path already ran. It now also carries a small recent
XMS event feed derived from the xapp's stored webhook deliveries so the workspace can show that the
xapp itself received the latest monetization lifecycle events.

Current state rendering now uses explicit additive entitlement summaries from the same xapp
monetization rail, alongside the current access projection. Recent purchase activity is still used
as a fallback hint, but owned add-on unlock display and rebuy blocking no longer rely only on
heuristics from the latest purchase.

Important current semantics:

- `one_time_unlock` purchases are additive durable access
- they do not replace an active recurring membership contract
- when Creator Club sees an unlock alongside an active membership, it now surfaces that as an
  add-on unlock instead of changing the current membership label
- an already owned unlock is no longer presented as purchasable again
- a not-yet-owned unlock can still be purchased alongside the active membership, but it is
  labeled and rendered as an add-on rather than a downgrade/plan replacement

The Technical Lab state panel now also shows the recent stored `XMS` webhook feed for the current
xapp so runtime state and received lifecycle events can be inspected side by side. That lab feed is
kept bounded to the latest 10 events so it stays readable.
