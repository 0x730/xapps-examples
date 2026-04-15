# xplace-weather-now-gateway-stripe

Lean JSON Forms weather reference xapp now owned by `xplace-example`.

Grouped lane docs live here first:

- [docs/guides/xconect-xplace/README.md](../../../../../docs/guides/xconect-xplace/README.md)
- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

Purpose

- keep one automatic-response weather xapp as the canonical weather reference
- prove `xplace` can host an auto-response xapp behind the shared ingest endpoint
- keep the current production-lane payment choice explicit: gateway-managed Stripe
- keep the JSON Forms preview/panel examples on a real xapp that still exists in the example fleet

Current lane note

- this is the only first-class `weather-now` xapp kept in the active `xplace-example` fleet
- additional payment-mode expansion work should happen on `xplace-certs`, not on `weather-now`
- archived non-production delegated samples still live under:
  - `samples/xapps/extensions-lab/variants/xplace/xapps/xplace-weather-now-tenant-delegated-netopia/manifest.json`

Tool

- `lookup_weather_now`

Payment lane

- guard slug: `xconect-tenant-payment-policy-stripe-gateway`
- guard ref: `xconect_tenant_pay_by_request_gateway_stripe`
- payment variant: `stripe` primary
- local/dev hosted test rail: `mock_manual`

Publisher workspace

- endpoint: `__XPLACE_BACKEND_BASE_URL__/xapps/requests`
- auth: `x-xplace-api-key`
- handler mode in `xplace`: `auto`

Smoke (publisher workspace auto path)

```bash
node apps/publishers/xplace/backend/scripts/auto-loop-smoke.mjs
```

The smoke starts the xplace publisher workspace sample, calls the shared ingest endpoint with the
auto tool, and verifies the request is persisted with `mode=auto`.

Publish to local gateway (xplace publisher)

```bash
npm run xapps -- publish \
  --yes \
  --from apps/publishers/xplace-example/xapps/xplace-weather-now-gateway-stripe/manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xplace-example-dev-api-key
```

## Publish / republish

Use the grouped runbook for the canonical publish and republish path:

- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

The normal path is now:

```bash
npm run xplace-example:prepare-republish -- --run --target-client-slug xconecta --api-key xplace-example-dev-api-key --gateway-url http://localhost:3000
```

That wrapper auto-ensures endpoint credentials for republished `xplace` slugs. Manual credential
repair is fallback only.

Endpoint auth secret note (`PUBLISHER_APP`)

- The endpoint API key is **not** stored in the manifest.
- Configure the gateway endpoint credential for the published endpoint (publisher routes) and set
  its secret to match `XPLACE_XAPP_INGEST_API_KEY` in the xplace backend env for local V1.
- Example fallback manual repair after publish:

```bash
export XPLACE_XAPP_INGEST_API_KEY=xplace-dev-api-key

npm run xapps -- publisher endpoint credential set \
  --gateway-url http://localhost:3000 \
  --api-key xplace-example-dev-api-key \
  --xapp-slug xplace-weather-now-gateway-stripe \
  --env prod \
  --auth-type api-key \
  --header-name x-xplace-api-key \
  --secret-env XPLACE_XAPP_INGEST_API_KEY \
  --json
```

## JSON Forms preview panel snippets (copy-paste)

All examples below use the same safe publisher-backed preview channel:

- `kind: "publisher_preview"`
- `endpointKey: "weather_location_details"`
- `inputMapping` from form state (no raw URLs, no secrets in manifest)

Base `dataSource` (reuse inside panel `options`)

```json
{
  "dataSource": {
    "kind": "publisher_preview",
    "endpointKey": "weather_location_details",
    "inputMapping": {
      "latitude": "#/properties/latitude",
      "longitude": "#/properties/longitude"
    },
    "debounceMs": 250,
    "timeoutMs": 2500,
    "cacheTtlMs": 2000
  }
}
```

Map preview (local form-state visualization)

```json
{
  "type": "XAppsDisplayPanel",
  "component": "location-map-preview",
  "label": "Map Preview",
  "options": {
    "latitudeScope": "#/properties/latitude",
    "longitudeScope": "#/properties/longitude",
    "zoom": 9,
    "height": 220,
    "layout": { "sideBySide": true, "width": "half" }
  }
}
```

`data-view` json (raw/debug)

Note: there is no separate `json-view` component. Use `component: "data-view"` with
`view.type: "json"` for raw/debug JSON rendering.

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Preview JSON",
  "options": {
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details"
    },
    "view": { "type": "json" }
  }
}
```

`data-view` key-value

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Location Details",
  "options": {
    "layout": { "sideBySide": true, "width": "half" },
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details",
      "inputMapping": {
        "latitude": "#/properties/latitude",
        "longitude": "#/properties/longitude"
      },
      "responsePath": "#/summary"
    },
    "view": {
      "type": "key-value",
      "compact": true,
      "fields": [
        { "path": "#/timezone", "label": "Timezone" },
        { "path": "#/elevation", "label": "Elevation (m)" },
        { "path": "#/provider", "label": "Provider" },
        { "path": "#/fetchedAt", "label": "Fetched At" }
      ]
    }
  }
}
```

`data-view` list

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Preview Tags",
  "options": {
    "layout": { "sideBySide": true, "width": "half" },
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details",
      "inputMapping": {
        "latitude": "#/properties/latitude",
        "longitude": "#/properties/longitude"
      }
    },
    "view": { "type": "list", "path": "#/tags" }
  }
}
```

`data-view` badges

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Capabilities",
  "options": {
    "layout": { "sideBySide": true, "width": "half" },
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details",
      "inputMapping": {
        "latitude": "#/properties/latitude",
        "longitude": "#/properties/longitude"
      }
    },
    "view": { "type": "badges", "path": "#/badges" }
  }
}
```

`data-view` table

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Preview Stations",
  "options": {
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details",
      "inputMapping": {
        "latitude": "#/properties/latitude",
        "longitude": "#/properties/longitude"
      }
    },
    "view": {
      "type": "table",
      "path": "#/stations",
      "columns": [
        { "path": "#/name", "label": "Station" },
        { "path": "#/kind", "label": "Kind" },
        { "path": "#/distanceKm", "label": "Distance (km)" }
      ]
    }
  }
}
```

`data-view` cards

```json
{
  "type": "XAppsDisplayPanel",
  "component": "data-view",
  "label": "Preview Cards",
  "options": {
    "dataSource": {
      "kind": "publisher_preview",
      "endpointKey": "weather_location_details",
      "inputMapping": {
        "latitude": "#/properties/latitude",
        "longitude": "#/properties/longitude"
      }
    },
    "view": {
      "type": "cards",
      "path": "#/cards",
      "titlePath": "#/title",
      "subtitlePath": "#/subtitle",
      "fields": [
        { "path": "#/latitude", "label": "Lat" },
        { "path": "#/longitude", "label": "Lon" },
        { "path": "#/elevation", "label": "Elevation" }
      ]
    }
  }
}
```

Safety boundary (important)

- preview panels are read-only
- preview responses do not mutate form payload
- preview responses do not satisfy guards/payment
- secrets remain in gateway endpoint credentials / publisher backend env
