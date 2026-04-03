# `xplace-monetization-lab-jsonforms`

Reference JSON Forms xapp for the first `xplace-example` monetization app.

Purpose:

- give `OPEN-076` a real example xapp on the normal example publish/runtime rail
- carry a full additive monetization catalog in one manifest
- exercise all currently landed monetization families:
  - `one_time_unlock`
  - `subscription_plan`
  - `credit_pack`
  - `hybrid_plan`
- stay simple on the runtime side so portal/shared-marketplace/operator surfaces can be validated before the richer publisher-rendered account app

Current practical role:

- first app in the `xplace-example` monetization proving lane
- JSON Forms first
- publisher-rendered account/plan app later

What it proves now:

- manifest-side monetization catalog import on a real publisher xapp
- xapp-scoped catalog/access/current-subscription APIs against a real example slug
- reference activation of the selected package and scope through the landed monetization core
  using the real request installation/xapp context
- portal/shared marketplace current monetization reads on a real example xapp
- operator catalog/subscription reads against the same example lane

Current runtime behavior:

- the shared `open_monetization_lab` tool is no longer a static echo
- it resolves the selected package from the published xapp catalog
- it prepares a purchase intent for the current request scope
- it records a controlled reference-lab verified transaction
- it issues access and returns:
  - current access projection
  - current subscription when relevant

Current proving posture:

- this is a reference activation lane for visibility and state propagation first
- it is intentionally not the final end-user checkout UX
- deeper payment-page / request-hook enforcement comes later on top of the same core

What it does not try to prove yet:

- end-user purchase UX in portal/shared marketplace
- account login/register flows
- publisher-rendered subscription management UX

Those belong to the next `xplace-example` publisher-rendered monetization app.
