# `xconectb` backend local `lib`

This folder is only for PHP adapter code that must stay local.

Current local ownership:

- [config.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/config.php)
  - env/config loading for the backend
- [appSurfaceModule.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/appSurfaceModule.php)
  - local health/asset registration that depends on tenant branding and local
    host assets
- [subjectProfiles/defaultProfiles.php](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/lib/subjectProfiles/defaultProfiles.php)
  - tenant-specific subject-profile catalog

Rule:

- if behavior is default tenant backend behavior, it belongs in the backend kit
- if behavior is PHP adapter wiring, tenant branding, tenant config, or
  tenant-owned subject data, it can stay here

Do not recreate generic payment, policy, or gateway route logic in this folder.
