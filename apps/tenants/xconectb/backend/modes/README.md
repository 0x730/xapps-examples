# `xconectb` Backend Modes

This folder mirrors the same tenant mode surface as the Node reference.

Consumer rule:

- load the PHP backend kit through [functions.php](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/src/functions.php)
- treat the package `src/Backend/Modes/...` links below as source anchors, not
  the preferred bootstrap pattern

Current mode families:

- [gateway-managed](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/modes/gateway-managed/README.md)
- [tenant-delegated](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/modes/tenant-delegated/README.md)
- [publisher-delegated](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/modes/publisher-delegated/README.md)
- [owner-managed](/home/dacrise/x/xapps/apps/tenants/xconectb/backend/modes/owner-managed/README.md)

The rule is simple:

- mode behavior should stay aligned with Node
- mode ownership and responsibilities should stay explicit
- package defaults should own the implementation

This local folder is documentation-first on purpose:

- package defaults own the mode implementation
- local PHP folders explain the mode contract and the override seam
- if a tenant needs a custom mode implementation later, that customization can
  live locally and stay easy to find here
