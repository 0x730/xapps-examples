# `@xapps-platform/widget-runtime`

Platform-side React runtime components for rendering widget UIs.

## Purpose

- Render UI-Kit and App-Shell widget modes
- Manage widget session lifecycle in host context
- Bridge UI interaction events between host and widget runtime

## Runtime

- Host/platform React application

## Key exports

- `UiKitWidget`
- `AppShellWidget`
- `WidgetRuntime`
- `useWidgetSession`
- `useWidgetUiBridge`
- `createWindowXappsHostAdapter`

## Notes

- Host integration is explicit through `WidgetHostAdapter`.
- Supports bridge events for notifications, modals, navigation, refresh, and context/state requests.

## SDK relations

- Runtime/UI-kit path for platform-rendered widgets; separate concern from `@xapps-platform/widget-sdk` (publisher-rendered iframe widgets).
- Can live alongside `@xapps-platform/marketplace-ui` in the same host app when product mixes marketplace catalog pages and runtime-rendered widgets.
- `@xapps-platform/embed-sdk` remains the primary host iframe orchestration layer where iframe catalog/widget embedding is required.

## Source

- Package: `packages/widget-runtime`
- Local README: `packages/widget-runtime/README.md`
