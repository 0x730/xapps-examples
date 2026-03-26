# `@xapps-platform/marketplace-ui`

Marketplace/catalog React UI surfaces for host/integrator portals.

## Purpose

- Reusable marketplace app shell
- Catalog, xapp detail, operational list/detail pages, and widget view pages
- Shared marketplace context/provider abstractions

## Runtime

- Host/integrator React frontend

## Key exports

- `MarketplaceProvider`, `useMarketplace`
- `MarketplaceApp`
- `CatalogPage`, `XappDetailPage`
- `PublishersPage`, `PublisherDetailPage`
- Operational surfaces:
  - `RequestsPage`, `RequestDetailPage`
  - `PaymentsPage`
  - `InvoicesPage`
  - `NotificationsPage`
- `WidgetView`
- CSS entry `@xapps-platform/marketplace-ui/marketplace.css`

## SDK relations

- Works with `@xapps-platform/embed-sdk` in host/integrator apps where catalog/widget iframes are embedded.
- `WidgetView` forwards `xapps_host_return_url` and `xapps_payment_*` params into widget sessions; host embed pages should provide those through embed-sdk helpers.
- The shared marketplace shell now includes primary navigation for `Xapps`, `Publishers`, and
  `Activity`, with global activity tabs for `Requests`, `Payments`, `Invoices`, and
  `Notifications`.
- The marketplace can resolve xapp-scoped `requests`, `payments`, `invoices`, and `notifications`
  in-router by default, while still honoring host-side operational-surface bridge overrides.
- `MarketplaceEnv.host.operationalSurfaces` declares the current host placement policy. The
  contract supports `in_router`, `side_panel`, and `full_page`, but current platform behavior still
  defaults to `in_router`.
- Does not replace `@xapps-platform/widget-sdk` (widget iframe runtime) or `@xapps-platform/server-sdk` (backend/runtime contracts).

## Source

- Package: `packages/marketplace-ui`
- Local README: `packages/marketplace-ui/README.md`
