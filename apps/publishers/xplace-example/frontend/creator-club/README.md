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

The workspace now reads through the dedicated app snapshot endpoint and uses app-specific plan/tool
actions, while the technical lab keeps the more detailed playground/XMS controls.

Current state rendering also includes a derived durable unlock / entitlement view built from the
current access projection and recent purchase activity. It is intentionally labeled as inferred,
not as a full operator entitlement record list.
