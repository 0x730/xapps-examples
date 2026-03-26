# `xconect` backend local `lib`

This folder is for local backend support code that still belongs to `xconect`.

Current local ownership:

- [config.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/config.js)
  - env/config loading for the backend
- [appSurfaceModule.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/appSurfaceModule.js)
  - local health/asset registration that depends on tenant branding and local
    host assets
- [payments](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/payments)
  - tiny local payment readers/parsers only
- [subjectProfiles/defaultProfiles.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/subjectProfiles/defaultProfiles.js)
  - tenant-specific subject-profile catalog
- [policies](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/policies)
  - docs-only reminder that default policy core moved into the backend kit

Rule:

- if behavior is default tenant backend behavior, it belongs in the backend kit
- if behavior is tenant branding, tenant config, app-surface wiring, tiny local
  helpers, or tenant-owned subject data, it can stay here

Do not recreate generic payment, policy, or gateway route logic in this folder.
