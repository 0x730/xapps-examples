import { XPLACE_REQUEST_MODES } from "./constants.js";

function requireFields(payload, fields) {
  const missing = [];
  for (const field of fields) {
    const value = String(payload[field] ?? "").trim();
    if (!value) missing.push(field);
  }
  return missing;
}

function normalizeCui(value) {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const withoutPrefix = raw.startsWith("RO") ? raw.slice(2) : raw;
  const digits = withoutPrefix.replace(/[^0-9]/g, "");
  return {
    raw,
    digits,
    numeric: Number(digits),
    valid: digits.length >= 2 && digits.length <= 13 && Number.isFinite(Number(digits)),
  };
}

function formatYmd(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapAnafCompanyPayload(payload) {
  const root = payload && typeof payload === "object" ? payload : {};
  const found = Array.isArray(root.found) ? root.found : [];
  const first = found[0] && typeof found[0] === "object" ? found[0] : {};
  const dateGenerale =
    first.date_generale && typeof first.date_generale === "object" ? first.date_generale : {};
  const cui = String(dateGenerale.cui ?? "").trim();
  const companyName = String(dateGenerale.denumire ?? "").trim();
  const companyAddress = String(dateGenerale.adresa ?? "").trim();
  return {
    companyCui: cui,
    companyName,
    companyAddress,
    registrationStatus: String(dateGenerale.stare_inregistrare ?? "").trim(),
    raw: root,
    found: Boolean(cui || companyName || companyAddress),
  };
}

export function createXplaceToolRegistry({ weatherApiBaseUrl, nowIso }) {
  return {
    submit_certificate_request: {
      key: "submit_certificate_request",
      mode: XPLACE_REQUEST_MODES.MANUAL,
      xapp: "xplace-certs",
      title: "Submit Certificate Request (sync/manual capable)",
      validate(payload) {
        const missing = requireFields(payload, ["companyCui", "requestPurpose"]);
        if (missing.length) return { ok: false, message: `${missing.join(" and ")} are required` };
        return { ok: true };
      },
    },
    submit_certificate_request_async: {
      key: "submit_certificate_request_async",
      mode: XPLACE_REQUEST_MODES.MANUAL,
      xapp: "xplace-certs",
      title: "Submit Certificate Request (async manual review)",
      validate(payload) {
        const missing = requireFields(payload, ["companyCui", "requestPurpose"]);
        if (missing.length) return { ok: false, message: `${missing.join(" and ")} are required` };
        return { ok: true };
      },
    },
    lookup_weather_now: {
      key: "lookup_weather_now",
      mode: XPLACE_REQUEST_MODES.AUTO,
      xapp: "xplace-weather-now-gateway-stripe",
      title: "Lookup Weather Now (automatic response via public API)",
      validate(payload) {
        const lat = Number(payload.latitude);
        const lon = Number(payload.longitude);
        if (!Number.isFinite(lat)) return { ok: false, message: "latitude is required" };
        if (!Number.isFinite(lon)) return { ok: false, message: "longitude is required" };
        return { ok: true };
      },
      async handle({ payload, requestLog }) {
        const latitude = Number(payload.latitude);
        const longitude = Number(payload.longitude);
        const label = String(payload.locationLabel || "").trim() || `${latitude},${longitude}`;
        const units =
          String(payload.temperatureUnit || "celsius")
            .trim()
            .toLowerCase() === "fahrenheit"
            ? "fahrenheit"
            : "celsius";
        const url = new URL(`${weatherApiBaseUrl}/v1/forecast`);
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
        url.searchParams.set("temperature_unit", units === "fahrenheit" ? "fahrenheit" : "celsius");
        let upstreamRes;
        let upstreamBody = null;
        try {
          upstreamRes = await fetch(url, { headers: { accept: "application/json" } });
          upstreamBody = await upstreamRes.json().catch(() => null);
        } catch (err) {
          requestLog?.warn(
            { err: err?.message || String(err) },
            "xplace weather upstream request failed",
          );
          return {
            status: "error",
            result: { message: "Weather upstream request failed" },
          };
        }
        if (!upstreamRes.ok || !upstreamBody || typeof upstreamBody !== "object") {
          requestLog?.warn(
            { status: upstreamRes.status },
            "xplace weather upstream returned invalid response",
          );
          return {
            status: "error",
            result: { message: "Weather upstream returned an invalid response" },
          };
        }
        const current =
          upstreamBody.current && typeof upstreamBody.current === "object"
            ? upstreamBody.current
            : null;
        const temp = current ? Number(current.temperature_2m) : NaN;
        const wind = current ? Number(current.wind_speed_10m) : NaN;
        const code = current ? Number(current.weather_code) : NaN;
        if (!Number.isFinite(temp) || !Number.isFinite(wind) || !Number.isFinite(code)) {
          return {
            status: "error",
            result: { message: "Weather upstream response missing current weather fields" },
          };
        }
        const unitLabel = units === "fahrenheit" ? "F" : "C";
        return {
          status: "success",
          result: {
            locationLabel: label,
            latitude,
            longitude,
            temperature: temp,
            temperatureUnit: unitLabel,
            weatherCode: code,
            windSpeedKmh: wind,
            provider: "open-meteo",
            summary: `Current weather for ${label}: ${temp}${unitLabel}, code ${code}, wind ${wind} km/h`,
            checkedAt: nowIso(),
          },
        };
      },
    },
  };
}

export function listWorkspaceTools(toolRegistry) {
  return Object.values(toolRegistry || {}).map((tool) => ({
    tool_name: tool.key,
    xapp: tool.xapp,
    mode: tool.mode,
    title: tool.title,
  }));
}

export function createXplacePreviewRegistry({ weatherApiBaseUrl, anafApiBaseUrl, nowIso }) {
  return {
    anaf_company_lookup_preview: {
      key: "anaf_company_lookup_preview",
      title: "ANAF company lookup preview (publisher-backed)",
      async handle({ payload, requestLog }) {
        const cuiInfo = normalizeCui(payload?.companyCui);
        if (!String(payload?.companyCui ?? "").trim()) {
          return {
            ok: true,
            status: 200,
            body: {
              status: "idle",
              message: "Introduceți CUI-ul pentru verificare ANAF.",
              provider: "anaf",
            },
          };
        }
        if (!cuiInfo.valid) {
          return {
            ok: true,
            status: 200,
            body: {
              status: "invalid_input",
              message: "CUI invalid. Folosiți formatul RO12345678 sau 12345678.",
              companyCui: String(payload?.companyCui ?? ""),
              provider: "anaf",
            },
          };
        }

        const endpointBase = String(anafApiBaseUrl || "https://webservicesp.anaf.ro").replace(
          /\/+$/,
          "",
        );
        const endpointCandidates = [
          `${endpointBase}/api/PlatitorTvaRest/v9/tva`,
          `${endpointBase}/PlatitorTvaRest/api/v8/ws/tva`,
        ];
        let upstreamRes = null;
        let upstreamBody = null;
        let endpointUsed = "";
        let lastErr = null;
        for (const endpoint of endpointCandidates) {
          endpointUsed = endpoint;
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: {
                accept: "application/json",
                "content-type": "application/json",
              },
              body: JSON.stringify([
                {
                  cui: Number(cuiInfo.numeric),
                  data: formatYmd(new Date()),
                },
              ]),
            });
            const body = await res.json().catch(() => null);
            if (res.ok && body && typeof body === "object") {
              upstreamRes = res;
              upstreamBody = body;
              break;
            }
            upstreamRes = res;
            upstreamBody = body;
          } catch (err) {
            lastErr = err;
            requestLog?.warn(
              { err: err?.message || String(err), endpoint },
              "xplace anaf preview upstream request failed",
            );
          }
        }

        if (!upstreamRes || !upstreamBody || typeof upstreamBody !== "object") {
          return {
            ok: true,
            status: 200,
            body: {
              status: "upstream_error",
              message: "Verificarea ANAF nu este disponibilă momentan.",
              companyCui: cuiInfo.digits,
              provider: "anaf",
              ...(endpointUsed ? { endpoint: endpointUsed } : {}),
              ...(lastErr ? { error: lastErr?.message || String(lastErr) } : {}),
            },
          };
        }
        if (!upstreamRes.ok) {
          requestLog?.warn(
            { status: upstreamRes?.status, endpoint: endpointUsed },
            "xplace anaf preview upstream invalid response",
          );
          return {
            ok: true,
            status: 200,
            body: {
              status: "upstream_error",
              message: "ANAF a returnat un răspuns invalid.",
              companyCui: cuiInfo.digits,
              provider: "anaf",
              endpoint: endpointUsed,
            },
          };
        }

        const mapped = mapAnafCompanyPayload(upstreamBody);
        if (!mapped.found) {
          return {
            ok: true,
            status: 200,
            body: {
              status: "not_found",
              message: "Compania nu a fost găsită în răspunsul ANAF.",
              companyCui: cuiInfo.digits,
              provider: "anaf",
              endpoint: endpointUsed,
              fetchedAt: nowIso(),
              raw: upstreamBody,
            },
          };
        }

        return {
          ok: true,
          status: 200,
          body: {
            status: "verified",
            message: "Date companie verificate ANAF",
            companyName: mapped.companyName,
            companyCui: mapped.companyCui || cuiInfo.digits,
            companyAddress: mapped.companyAddress,
            registrationStatus: mapped.registrationStatus,
            provider: "anaf",
            endpoint: endpointUsed,
            fetchedAt: nowIso(),
            raw: mapped.raw,
          },
        };
      },
    },
    weather_location_details: {
      key: "weather_location_details",
      title: "Weather location details preview (publisher-backed)",
      async handle({ payload, requestLog }) {
        const latitude = Number(payload?.latitude);
        const longitude = Number(payload?.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return {
            ok: false,
            status: 400,
            body: { message: "latitude and longitude are required" },
          };
        }
        const url = new URL(`${weatherApiBaseUrl}/v1/forecast`);
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("current", "temperature_2m,weather_code");
        let upstreamRes;
        let upstreamBody = null;
        try {
          upstreamRes = await fetch(url, { headers: { accept: "application/json" } });
          upstreamBody = await upstreamRes.json().catch(() => null);
        } catch (err) {
          requestLog?.warn(
            { err: err?.message || String(err) },
            "xplace weather preview upstream request failed",
          );
          return {
            ok: false,
            status: 502,
            body: { message: "Preview upstream request failed" },
          };
        }
        if (!upstreamRes.ok || !upstreamBody || typeof upstreamBody !== "object") {
          return {
            ok: false,
            status: 502,
            body: { message: "Preview upstream returned invalid response" },
          };
        }
        const current =
          upstreamBody.current && typeof upstreamBody.current === "object"
            ? upstreamBody.current
            : null;
        return {
          ok: true,
          status: 200,
          body: {
            summary: {
              latitude,
              longitude,
              timezone: String((upstreamBody.timezone || "") ?? ""),
              elevation: typeof upstreamBody.elevation === "number" ? upstreamBody.elevation : null,
              fetchedAt: nowIso(),
              provider: "open-meteo",
            },
            tags: [
              "weather",
              Number(latitude) >= 0 ? "northern-hemisphere" : "southern-hemisphere",
              "publisher-preview",
            ],
            badges: [
              { label: "Open-Meteo", tone: "info" },
              { label: "Publisher API", tone: "success" },
              {
                label:
                  typeof upstreamBody.elevation === "number" && upstreamBody.elevation > 500
                    ? "High Elevation"
                    : "Low Elevation",
                tone:
                  typeof upstreamBody.elevation === "number" && upstreamBody.elevation > 500
                    ? "warning"
                    : "neutral",
              },
            ],
            stations: [
              {
                name: "Selected Coordinates",
                distanceKm: 0,
                kind: "target",
              },
              {
                name: "Timezone Context",
                distanceKm: 1,
                kind: "derived",
              },
            ],
            cards: [
              {
                title: "Coordinates",
                subtitle: String((upstreamBody.timezone || "") ?? ""),
                latitude,
                longitude,
                elevation:
                  typeof upstreamBody.elevation === "number" ? upstreamBody.elevation : null,
              },
              {
                title: "Current Snapshot",
                subtitle: "Preview",
                temperature_2m:
                  current && typeof current.temperature_2m === "number"
                    ? current.temperature_2m
                    : null,
                weather_code:
                  current && typeof current.weather_code === "number" ? current.weather_code : null,
                time: current && typeof current.time === "string" ? current.time : null,
              },
            ],
            current: current
              ? {
                  temperature_2m:
                    typeof current.temperature_2m === "number" ? current.temperature_2m : null,
                  weather_code:
                    typeof current.weather_code === "number" ? current.weather_code : null,
                  time: typeof current.time === "string" ? current.time : null,
                }
              : null,
          },
        };
      },
    },
  };
}
