# `xplace-bonbun-public-iframe-publisher-rendered`

Exploratory `xplace-example` xapp for the first BonBun integration review.

Purpose:

- publish a real BonBun lane in `xplace-example`
- keep the iframe public for initial partner review
- avoid premature bootstrap verification or linking assumptions before the
  integrator discussion

Current posture:

- `renderer: "publisher"`
- `entry.kind: "iframe_url"`
- points directly to:
  - `https://bonbun.ro/`
- `config.xapps.publisher_runtime_mode = "passive"`
- no tool dispatch
- no bootstrap verification flow yet
- no linking enabled yet

This is intentional.

The current goal is to let the publisher/integrator review:

- iframe behavior
- login/register UX inside the SPA
- whether the right target page should be the public root, a login route, or a
  deeper workspace route
- what the real identity and workspace model looks like for linking

Why passive mode is required:

- the current default publisher-rendered runtime expects the embedded app to
  participate in the Xapps widget bridge
- BonBun does not do that yet
- passive mode keeps the iframe usable for partner review without forcing the
  bridge/runtime contract too early

Do **not** treat this xapp as the final BonBun security/runtime shape.

Later likely upgrades:

1. publisher-side bootstrap verification
2. linking for account/workspace-only surfaces
3. optional publisher-local session bridge

Current intended tenant lane:

- `xconect`

Current local publish:

- target tenant lane: `xconect`
- xapp id: `01KN32N19P59CQMCKT21JVCAG2`
- version id: `01KN33T25APFWGFYNH23N96G38`

Publish example:

```bash
npm run -s xapps -- publish --yes \
  --from apps/publishers/xplace-example/xapps/xplace-bonbun-public-iframe-publisher-rendered/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xplace-example-dev-api-key \
  --replace __TENANT_CLIENT_ID__=<xconect-client-id>
```

Publisher clarification doc:

- [BONBUN_LINKING_BRIEF.md](../../../../../docs/guides/partners/BONBUN_LINKING_BRIEF.md)
