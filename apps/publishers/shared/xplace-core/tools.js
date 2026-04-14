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

function readNormalizedScopeSelection(input) {
  const scopeKind = String(input?.scopeKind || "subject")
    .trim()
    .toLowerCase();
  const activationScope =
    scopeKind === "installation" || scopeKind === "realm" ? scopeKind : "subject";
  return {
    activationScope,
    requestedPackage: String(input?.requestedPackage || "")
      .trim()
      .toLowerCase(),
    realmRef: String(input?.realmRef || "").trim() || null,
    contactEmail: String(input?.contactEmail || "").trim() || null,
    notes: String(input?.notes || "").trim() || null,
  };
}

function buildMonetizationScopeQuery({ activationScope, subjectId, installationId, realmRef }) {
  if (activationScope === "installation") {
    return `installation_id=${encodeURIComponent(String(installationId || "").trim())}`;
  }
  if (activationScope === "realm") {
    return `realm_ref=${encodeURIComponent(String(realmRef || "").trim())}`;
  }
  return `subject_id=${encodeURIComponent(String(subjectId || "").trim())}`;
}

function getPackageLabel(packageSlug) {
  const packageLabelMap = {
    starter_unlock: "Starter Unlock",
    pro_monthly: "Pro Monthly",
    credits_500: "Credits 500",
    team_hybrid: "Team Hybrid",
    cert_single_unlock: "Single Certificate Unlock",
    cert_trial_monthly: "Trial Certificate Membership",
    cert_credits_10: "Certificate Credits 10",
    cert_hybrid_monthly: "Certificate Hybrid Monthly",
  };
  return (
    packageLabelMap[
      String(packageSlug || "")
        .trim()
        .toLowerCase()
    ] ||
    packageSlug ||
    "Unknown package"
  );
}

function readCreditsRemainingNumber(accessProjection) {
  const parsed = Number(String(accessProjection?.credits_remaining ?? "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function readSubscriptionStatus(currentSubscription) {
  return String(currentSubscription?.status ?? "")
    .trim()
    .toLowerCase();
}

function summarizeCertificateXmsState({ accessProjection, currentSubscription }) {
  const entitlementState = String(accessProjection?.entitlement_state ?? "")
    .trim()
    .toLowerCase();
  const hasCurrentAccess = readBooleanLoose(accessProjection?.has_current_access);
  const creditsRemaining = readCreditsRemainingNumber(accessProjection);
  const subscriptionStatus = readSubscriptionStatus(currentSubscription);

  if ((subscriptionStatus === "active" || subscriptionStatus === "grace") && creditsRemaining > 0) {
    return "Active subscription with usable certificate credits";
  }
  if (subscriptionStatus === "active" || subscriptionStatus === "grace") {
    return "Active subscription";
  }
  if (creditsRemaining > 0 && hasCurrentAccess) {
    return "Current subject access with usable certificate credits";
  }
  if (creditsRemaining > 0) {
    return "Usable certificate credits";
  }
  if (hasCurrentAccess || entitlementState === "active" || entitlementState === "grace_period") {
    return "Current subject access";
  }
  return "No usable XMS access";
}

function readVirtualCurrencySummary(value) {
  const currency =
    value &&
    typeof value === "object" &&
    value.virtual_currency &&
    typeof value.virtual_currency === "object"
      ? value.virtual_currency
      : null;
  const code = String(currency?.code || "")
    .trim()
    .toUpperCase();
  const name = String(currency?.name || "").trim();
  return {
    code: code || null,
    name: name || null,
  };
}

function readPositiveNumber(value, fallback) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readNonNegativeNumber(value, fallback) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function readXmsUsagePolicyCreditCost(policy, fallback) {
  const usagePolicy = policy && typeof policy === "object" ? policy : {};
  return readNonNegativeNumber(usagePolicy.credit_cost, fallback);
}

function readBooleanLoose(value) {
  if (value === true) return true;
  if (typeof value === "number") return value === 1;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function readActiveWallet(items, requiredAmount, requiredVirtualCurrencyCode = "") {
  const wallets = Array.isArray(items) ? items : [];
  const normalizedRequiredCode = String(requiredVirtualCurrencyCode || "")
    .trim()
    .toUpperCase();
  for (const wallet of wallets) {
    if (!wallet || typeof wallet !== "object") continue;
    if (String(wallet.status || "").trim() !== "active") continue;
    const walletVirtualCurrencyCode =
      wallet.virtual_currency && typeof wallet.virtual_currency === "object"
        ? String(wallet.virtual_currency.code || "")
            .trim()
            .toUpperCase()
        : "";
    if (normalizedRequiredCode && walletVirtualCurrencyCode !== normalizedRequiredCode) continue;
    const balance = Number(String(wallet.balance_remaining ?? "").trim());
    if (Number.isFinite(balance) && balance >= requiredAmount) return wallet;
  }
  return null;
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchGatewayJson({
  gatewayBaseUrl,
  gatewayClientApiKey,
  path,
  method = "GET",
  body,
  requestLog,
}) {
  const url = new URL(path, `${String(gatewayBaseUrl || "").replace(/\/+$/, "")}/`);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": gatewayClientApiKey,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (err) {
    requestLog?.warn(
      { err: err?.message || String(err), url: String(url), method },
      "xplace monetization lab gateway request failed",
    );
    throw new Error(`Gateway request failed for ${method} ${path}`);
  }
  const json = await readJsonSafe(response);
  if (!response.ok) {
    requestLog?.warn(
      { status: response.status, url: String(url), method, body: json },
      "xplace monetization lab gateway response failed",
    );
    const message =
      String(json?.message || json?.error?.message || "").trim() ||
      `Gateway request failed for ${method} ${path}`;
    throw new Error(message);
  }
  return json;
}

function resolveGatewayClientApiKey({ gatewayClientApiKey, clientId, xappId, toolName }) {
  const resolved =
    typeof gatewayClientApiKey === "function"
      ? gatewayClientApiKey({ clientId, xappId, toolName })
      : gatewayClientApiKey;
  return String(resolved ?? "").trim();
}

function buildWeatherFallbackSnapshot({ latitude, longitude, units = "celsius", label, nowIso }) {
  const seed = Math.abs(Math.round(latitude * 100) + Math.round(longitude * 100));
  const celsius = Number((14 + (seed % 120) / 10).toFixed(1));
  const temperature =
    units === "fahrenheit" ? Number(((celsius * 9) / 5 + 32).toFixed(1)) : celsius;
  const windSpeedKmh = Number((6 + (seed % 80) / 10).toFixed(1));
  const weatherCode = [0, 1, 2, 3, 45, 51, 61][seed % 7];
  const elevation = Number((80 + (seed % 900)).toFixed(0));
  return {
    label: String(label || "").trim() || `${latitude},${longitude}`,
    latitude,
    longitude,
    temperature,
    temperatureUnit: units === "fahrenheit" ? "F" : "C",
    weatherCode,
    windSpeedKmh,
    elevation,
    timezone: "demo/offline",
    provider: "open-meteo-fallback",
    checkedAt: nowIso(),
  };
}

function buildWeatherPreviewFallbackBody({ fallback, message }) {
  return {
    status: "upstream_fallback",
    message,
    summary: {
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      timezone: fallback.timezone,
      elevation: fallback.elevation,
      fetchedAt: fallback.checkedAt,
      provider: fallback.provider,
    },
    tags: [
      "weather",
      fallback.latitude >= 0 ? "northern-hemisphere" : "southern-hemisphere",
      "publisher-preview",
      "offline-demo",
    ],
    badges: [
      { label: "Offline demo", tone: "warning" },
      { label: "Publisher API", tone: "success" },
      {
        label: fallback.elevation > 500 ? "High Elevation" : "Low Elevation",
        tone: fallback.elevation > 500 ? "warning" : "neutral",
      },
    ],
    stations: [
      { name: "Selected Coordinates", distanceKm: 0, kind: "target" },
      { name: "Offline Demo Context", distanceKm: 1, kind: "derived" },
    ],
    cards: [
      {
        title: "Coordinates",
        subtitle: fallback.timezone,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        elevation: fallback.elevation,
      },
      {
        title: "Current Snapshot",
        subtitle: "Offline demo fallback",
        temperature_2m: fallback.temperature,
        weather_code: fallback.weatherCode,
        time: fallback.checkedAt,
      },
    ],
    current: {
      temperature_2m: fallback.temperature,
      weather_code: fallback.weatherCode,
      time: fallback.checkedAt,
    },
  };
}

export function createXplaceToolRegistry({
  weatherApiBaseUrl,
  nowIso,
  gatewayBaseUrl = "",
  gatewayClientApiKey = "",
}) {
  function buildCertificateRequestTool({ key, xapp, title, sourceRefPrefix }) {
    return {
      key,
      mode: XPLACE_REQUEST_MODES.AUTO,
      xapp,
      title,
      validate(payload) {
        const missing = requireFields(payload, ["companyCui", "requestPurpose"]);
        if (missing.length) return { ok: false, message: `${missing.join(" and ")} are required` };
        return { ok: true };
      },
      async handle({
        payload,
        requestId,
        xappId,
        clientId,
        installationId,
        subjectId,
        requestLog,
      }) {
        const toolName = key;
        const resolvedGatewayClientApiKey = resolveGatewayClientApiKey({
          gatewayClientApiKey,
          clientId,
          xappId,
          toolName,
        });
        const company = normalizeCui(payload.companyCui);
        if (!String(gatewayBaseUrl || "").trim()) {
          return {
            status: "error",
            result: { message: "Gateway base URL is not configured for XMS certificate requests" },
          };
        }
        if (!resolvedGatewayClientApiKey) {
          return {
            status: "error",
            result: {
              message: "Target client API key is not configured for XMS certificate requests",
            },
          };
        }
        if (!String(xappId || "").trim() || !String(clientId || "").trim()) {
          return {
            status: "error",
            result: {
              message: "Xapp and client context are required for XMS certificate requests",
            },
          };
        }
        if (!String(subjectId || "").trim()) {
          return {
            status: "error",
            result: { message: "Subject context is required for XMS certificate requests" },
          };
        }

        const scopeQuery = `subject_id=${encodeURIComponent(String(subjectId || "").trim())}`;
        let accessProjection = null;
        let currentSubscription = null;
        let walletAccount = null;
        let walletLedger = null;
        let creditCost = 0;
        let requiredVirtualCurrencyCode = "";
        try {
          const usagePolicyRes = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/usage-policies/${encodeURIComponent(toolName)}`,
            requestLog,
          });
          const usagePolicy = usagePolicyRes?.usage_policy ?? null;
          creditCost = readXmsUsagePolicyCreditCost(usagePolicy, 1);
          requiredVirtualCurrencyCode = String(usagePolicy?.virtual_currency_code || "")
            .trim()
            .toUpperCase();

          const accessRes = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/access?${scopeQuery}`,
            requestLog,
          });
          accessProjection = accessRes?.access_projection ?? null;

          const subscriptionRes = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/current-subscription?${scopeQuery}`,
            requestLog,
          });
          currentSubscription = subscriptionRes?.current_subscription ?? null;

          const hasCurrentAccess = readBooleanLoose(accessProjection?.has_current_access);
          const entitlementState = String(accessProjection?.entitlement_state || "")
            .trim()
            .toLowerCase();
          const creditsRemaining = readCreditsRemainingNumber(accessProjection);

          if (
            !hasCurrentAccess &&
            entitlementState !== "active" &&
            entitlementState !== "grace_period" &&
            creditsRemaining <= 0
          ) {
            return {
              status: "error",
              result: {
                message:
                  "An active XMS entitlement or certificate credits are required for this request",
                entitlement_state: entitlementState || "inactive",
                has_current_access: hasCurrentAccess,
                credits_remaining: accessProjection?.credits_remaining ?? null,
                subscriptionStatus: currentSubscription?.status ?? null,
              },
            };
          }

          if (creditCost > 0) {
            const walletAccountsRes = await fetchGatewayJson({
              gatewayBaseUrl,
              gatewayClientApiKey: resolvedGatewayClientApiKey,
              path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/wallet-accounts?${scopeQuery}`,
              requestLog,
            });
            const wallet = readActiveWallet(
              walletAccountsRes?.items,
              creditCost,
              requiredVirtualCurrencyCode,
            );
            if (!wallet) {
              return {
                status: "error",
                result: {
                  message: requiredVirtualCurrencyCode
                    ? `Insufficient ${requiredVirtualCurrencyCode} balance for this request`
                    : "Insufficient certificate credits for this request",
                  entitlement_state: accessProjection?.entitlement_state ?? null,
                  has_current_access: hasCurrentAccess,
                  subscriptionStatus: currentSubscription?.status ?? null,
                  requiredCredits: creditCost,
                  requiredVirtualCurrencyCode: requiredVirtualCurrencyCode || null,
                  credits_remaining: accessProjection?.credits_remaining ?? null,
                },
              };
            }
            const consumed = await fetchGatewayJson({
              gatewayBaseUrl,
              gatewayClientApiKey: resolvedGatewayClientApiKey,
              path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/wallet-accounts/${encodeURIComponent(String(wallet.id))}/consume`,
              method: "POST",
              body: {
                amount: String(creditCost),
                source_ref: requestId ? `${sourceRefPrefix}:${requestId}` : sourceRefPrefix,
                metadata: {
                  tool_name: toolName,
                  company_cui: company.raw,
                  credit_cost: String(creditCost),
                  virtual_currency_code: requiredVirtualCurrencyCode || null,
                  installation_id: installationId || null,
                },
              },
              requestLog,
            });
            walletAccount = consumed?.wallet_account ?? null;
            walletLedger = consumed?.wallet_ledger ?? null;
            accessProjection =
              consumed?.access_projection && typeof consumed.access_projection === "object"
                ? {
                    ...(accessProjection && typeof accessProjection === "object"
                      ? accessProjection
                      : {}),
                    ...consumed.access_projection,
                  }
                : accessProjection;
          }
        } catch (err) {
          return {
            status: "error",
            result: {
              message: err?.message || String(err),
            },
          };
        }

        const entitlementState = String(accessProjection?.entitlement_state ?? "").trim() || null;
        const hasCurrentAccess = readBooleanLoose(accessProjection?.has_current_access);
        const accessSummary = summarizeCertificateXmsState({
          accessProjection,
          currentSubscription,
        });
        const walletCurrency = readVirtualCurrencySummary(walletAccount);
        const ledgerCurrency = readVirtualCurrencySummary(walletLedger);
        const accessCurrency = readVirtualCurrencySummary(accessProjection);

        return {
          status: "success",
          result: {
            status: "accepted",
            entitlement_state: entitlementState,
            has_current_access: hasCurrentAccess,
            access_summary: accessSummary,
            companyCui: company.raw,
            companyCuiNormalized: company.digits,
            requestPurpose: String(payload.requestPurpose || "").trim(),
            requestDetails: String(payload.requestDetails || "").trim() || null,
            credit_cost: creditCost,
            credits_remaining: accessProjection?.credits_remaining ?? null,
            subscriptionStatus: currentSubscription?.status ?? null,
            virtualCurrencyCode:
              walletCurrency.code || ledgerCurrency.code || accessCurrency.code || null,
            virtualCurrencyName:
              walletCurrency.name || ledgerCurrency.name || accessCurrency.name || null,
            walletAccountId: walletAccount?.id ?? null,
            walletLedgerId: walletLedger?.id ?? null,
            requestRef: `XMS-CERT-${Date.now()}`,
            summary: `Certificate request accepted for ${company.raw}. ${accessSummary}.`,
            checkedAt: nowIso(),
          },
        };
      },
    };
  }

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
          const fallback = buildWeatherFallbackSnapshot({
            latitude,
            longitude,
            units,
            label,
            nowIso,
          });
          return {
            status: "success",
            result: {
              locationLabel: fallback.label,
              latitude,
              longitude,
              temperature: fallback.temperature,
              temperatureUnit: fallback.temperatureUnit,
              weatherCode: fallback.weatherCode,
              windSpeedKmh: fallback.windSpeedKmh,
              provider: fallback.provider,
              upstreamStatus: "unavailable",
              summary: `Current weather for ${fallback.label}: ${fallback.temperature}${fallback.temperatureUnit}, code ${fallback.weatherCode}, wind ${fallback.windSpeedKmh} km/h (offline demo fallback)`,
              checkedAt: fallback.checkedAt,
            },
          };
        }
        if (!upstreamRes.ok || !upstreamBody || typeof upstreamBody !== "object") {
          requestLog?.warn(
            { status: upstreamRes.status },
            "xplace weather upstream returned invalid response",
          );
          const fallback = buildWeatherFallbackSnapshot({
            latitude,
            longitude,
            units,
            label,
            nowIso,
          });
          return {
            status: "success",
            result: {
              locationLabel: fallback.label,
              latitude,
              longitude,
              temperature: fallback.temperature,
              temperatureUnit: fallback.temperatureUnit,
              weatherCode: fallback.weatherCode,
              windSpeedKmh: fallback.windSpeedKmh,
              provider: fallback.provider,
              upstreamStatus: `invalid:${upstreamRes.status}`,
              summary: `Current weather for ${fallback.label}: ${fallback.temperature}${fallback.temperatureUnit}, code ${fallback.weatherCode}, wind ${fallback.windSpeedKmh} km/h (offline demo fallback)`,
              checkedAt: fallback.checkedAt,
            },
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
    submit_xms_certificate_request: buildCertificateRequestTool({
      key: "submit_xms_certificate_request",
      xapp: "xplace-certs-xms-jsonforms",
      title: "Submit XMS Certificate Request (automatic reference response)",
      sourceRefPrefix: "xplace-certs-xms-jsonforms",
    }),
    submit_xms_certificate_request_vc: buildCertificateRequestTool({
      key: "submit_xms_certificate_request_vc",
      xapp: "xplace-certs-xms-jsonforms-vc",
      title: "Submit XMS Certificate Request VC (automatic reference response)",
      sourceRefPrefix: "xplace-certs-xms-jsonforms-vc",
    }),
    open_monetization_lab: {
      key: "open_monetization_lab",
      mode: XPLACE_REQUEST_MODES.AUTO,
      xapp: "xplace-monetization-lab-jsonforms",
      title: "Open Monetization Lab (automatic reference response)",
      validate(payload) {
        const scopeKind = String(payload.scopeKind || "")
          .trim()
          .toLowerCase();
        if (
          scopeKind &&
          scopeKind !== "subject" &&
          scopeKind !== "installation" &&
          scopeKind !== "realm"
        ) {
          return {
            ok: false,
            message: "scopeKind must be subject, installation, or realm",
          };
        }
        return { ok: true };
      },
      async handle({
        payload,
        requestId,
        xappId,
        clientId,
        installationId,
        subjectId,
        requestLog,
      }) {
        const resolvedGatewayClientApiKey = resolveGatewayClientApiKey({
          gatewayClientApiKey,
          clientId,
          xappId,
          toolName: "open_monetization_lab",
        });
        const { activationScope, requestedPackage, realmRef, contactEmail, notes } =
          readNormalizedScopeSelection(payload);
        const selectedPackageLabel = getPackageLabel(requestedPackage);

        if (!String(gatewayBaseUrl || "").trim()) {
          return {
            status: "error",
            result: { message: "Gateway base URL is not configured for the monetization lab" },
          };
        }
        if (!resolvedGatewayClientApiKey) {
          return {
            status: "error",
            result: {
              message: "Target client API key is not configured for the monetization lab",
            },
          };
        }
        if (!String(xappId || "").trim()) {
          return {
            status: "error",
            result: { message: "Xapp installation context is missing for the monetization lab" },
          };
        }
        if (!String(clientId || "").trim()) {
          return {
            status: "error",
            result: { message: "Client context is missing for the monetization lab" },
          };
        }
        if (activationScope === "subject" && !String(subjectId || "").trim()) {
          return {
            status: "error",
            result: { message: "Subject context is required for subject-scoped activation" },
          };
        }
        if (activationScope === "installation" && !String(installationId || "").trim()) {
          return {
            status: "error",
            result: {
              message: "Installation context is required for installation-scoped activation",
            },
          };
        }
        if (activationScope === "realm" && !realmRef) {
          return {
            status: "error",
            result: { message: "realmRef is required for realm-scoped activation" },
          };
        }

        let preparedIntent = null;
        let transaction = null;
        let issuedAccess = null;
        let currentSubscription = null;
        let accessProjection = null;
        try {
          const catalog = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization`,
            requestLog,
          });
          const offering = Array.isArray(catalog?.items)
            ? catalog.items.find((item) =>
                Array.isArray(item?.packages)
                  ? item.packages.some((pkg) => String(pkg?.slug || "").trim() === requestedPackage)
                  : false,
              )
            : null;
          const pkg =
            offering && Array.isArray(offering.packages)
              ? offering.packages.find(
                  (item) =>
                    String(item?.slug || "")
                      .trim()
                      .toLowerCase() === requestedPackage,
                )
              : null;
          const price = pkg && Array.isArray(pkg.prices) ? (pkg.prices[0] ?? null) : null;
          if (!offering || !pkg || !price) {
            return {
              status: "error",
              result: {
                message: `Requested package is not available for this xapp: ${requestedPackage || "unknown"}`,
              },
            };
          }

          preparedIntent = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/purchase-intents/prepare`,
            method: "POST",
            body: {
              offering_id: offering.id,
              package_id: pkg.id,
              price_id: price.id,
              ...(activationScope === "subject" ? { subject_id: subjectId } : {}),
              ...(activationScope === "installation" ? { installation_id: installationId } : {}),
              ...(activationScope === "realm" ? { realm_ref: realmRef } : {}),
              request_id: requestId || null,
              source_kind: "owner_managed_external",
              source_ref: requestId
                ? `xplace-monetization-lab:${requestId}`
                : "xplace-monetization-lab",
              payment_lane: "reference_activation",
            },
            requestLog,
          });

          const intentId = String(preparedIntent?.prepared_intent?.purchase_intent_id || "").trim();
          if (!intentId) {
            throw new Error("Prepared purchase intent missing purchase_intent_id");
          }

          transaction = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/purchase-intents/${encodeURIComponent(intentId)}/transactions`,
            method: "POST",
            body: {
              status: "verified",
              provider_ref: "xplace-monetization-lab",
              evidence_ref: requestId
                ? `xplace-monetization-lab:${requestId}`
                : "xplace-monetization-lab",
              request_id: requestId || null,
            },
            requestLog,
          });

          issuedAccess = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/purchase-intents/${encodeURIComponent(intentId)}/issue-access`,
            method: "POST",
            body: {},
            requestLog,
          });

          const scopeQuery =
            activationScope === "subject"
              ? `subject_id=${encodeURIComponent(String(subjectId || "").trim())}`
              : activationScope === "installation"
                ? `installation_id=${encodeURIComponent(String(installationId || "").trim())}`
                : `realm_ref=${encodeURIComponent(String(realmRef || "").trim())}`;
          accessProjection = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/access?${scopeQuery}`,
            requestLog,
          });

          const subscriptionRes = await fetch(
            new URL(
              `/v1/xapps/${encodeURIComponent(xappId)}/monetization/current-subscription?${scopeQuery}`,
              `${String(gatewayBaseUrl || "").replace(/\/+$/, "")}/`,
            ),
            {
              headers: {
                accept: "application/json",
                "x-api-key": resolvedGatewayClientApiKey,
              },
            },
          );
          if (subscriptionRes.ok) {
            currentSubscription = await readJsonSafe(subscriptionRes);
          } else {
            currentSubscription = null;
          }
        } catch (err) {
          return {
            status: "error",
            result: {
              message: err?.message || String(err),
              activationScope,
              requestedPackage: requestedPackage || null,
              realmRef,
            },
          };
        }

        return {
          status: "success",
          result: {
            status: "success",
            activationScope,
            requestedPackage: requestedPackage || null,
            requestedPackageLabel: selectedPackageLabel,
            realmRef,
            contactEmail,
            notes,
            clientId: clientId || null,
            xappId: xappId || null,
            installationId: installationId || null,
            subjectId: subjectId || null,
            preparedIntent: preparedIntent?.prepared_intent ?? null,
            transaction: transaction?.transaction ?? null,
            accessProjection: accessProjection?.access_projection ?? null,
            currentSubscription: currentSubscription?.current_subscription ?? null,
            issuedAccess: issuedAccess
              ? {
                  idempotent: Boolean(issuedAccess.idempotent),
                  issuance_mode: issuedAccess.issuance_mode || null,
                  entitlement: issuedAccess.entitlement ?? null,
                  subscription_contract: issuedAccess.subscription_contract ?? null,
                  wallet_account: issuedAccess.wallet_account ?? null,
                  wallet_ledger: issuedAccess.wallet_ledger ?? null,
                }
              : null,
            summary: `Monetization lab activated ${selectedPackageLabel} on ${activationScope} scope for the current request context.`,
            checkedAt: nowIso(),
          },
        };
      },
    },
    spend_lab_credits: {
      key: "spend_lab_credits",
      mode: XPLACE_REQUEST_MODES.AUTO,
      xapp: "xplace-monetization-lab-jsonforms",
      title: "Spend Lab Credits (automatic reference response)",
      validate(payload) {
        const scopeKind = String(payload.scopeKind || "")
          .trim()
          .toLowerCase();
        if (
          scopeKind &&
          scopeKind !== "subject" &&
          scopeKind !== "installation" &&
          scopeKind !== "realm"
        ) {
          return {
            ok: false,
            message: "scopeKind must be subject, installation, or realm",
          };
        }
        return { ok: true };
      },
      async handle({
        payload,
        requestId,
        xappId,
        clientId,
        installationId,
        subjectId,
        requestLog,
      }) {
        const toolName = "spend_lab_credits";
        const resolvedGatewayClientApiKey = resolveGatewayClientApiKey({
          gatewayClientApiKey,
          clientId,
          xappId,
          toolName,
        });
        const { activationScope, realmRef, notes } = readNormalizedScopeSelection(payload);
        const actionLabel =
          String(payload.actionLabel || "").trim() || "Reference lab spend operation";
        if (!String(gatewayBaseUrl || "").trim()) {
          return {
            status: "error",
            result: { message: "Gateway base URL is not configured for lab credit spending" },
          };
        }
        if (!resolvedGatewayClientApiKey) {
          return {
            status: "error",
            result: {
              message: "Target client API key is not configured for lab credit spending",
            },
          };
        }
        if (!String(xappId || "").trim() || !String(clientId || "").trim()) {
          return {
            status: "error",
            result: {
              message: "Xapp and client context are required for lab credit spending",
            },
          };
        }
        if (activationScope === "subject" && !String(subjectId || "").trim()) {
          return {
            status: "error",
            result: { message: "Subject context is required for subject-scoped spending" },
          };
        }
        if (activationScope === "installation" && !String(installationId || "").trim()) {
          return {
            status: "error",
            result: {
              message: "Installation context is required for installation-scoped spending",
            },
          };
        }
        if (activationScope === "realm" && !realmRef) {
          return {
            status: "error",
            result: { message: "realmRef is required for realm-scoped spending" },
          };
        }

        const scopeQuery = buildMonetizationScopeQuery({
          activationScope,
          subjectId,
          installationId,
          realmRef,
        });
        let accessProjection = null;
        let currentSubscription = null;
        let walletAccount = null;
        let walletLedger = null;
        let spendAmount = 0;
        let requiredVirtualCurrencyCode = "";
        try {
          const usagePolicyRes = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/usage-policies/${encodeURIComponent(toolName)}`,
            requestLog,
          });
          const usagePolicy = usagePolicyRes?.usage_policy ?? null;
          spendAmount = readXmsUsagePolicyCreditCost(usagePolicy, 1);
          requiredVirtualCurrencyCode = String(usagePolicy?.virtual_currency_code || "")
            .trim()
            .toUpperCase();

          accessProjection =
            (
              await fetchGatewayJson({
                gatewayBaseUrl,
                gatewayClientApiKey: resolvedGatewayClientApiKey,
                path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/access?${scopeQuery}`,
                requestLog,
              })
            )?.access_projection ?? null;

          currentSubscription =
            (
              await fetchGatewayJson({
                gatewayBaseUrl,
                gatewayClientApiKey: resolvedGatewayClientApiKey,
                path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/current-subscription?${scopeQuery}`,
                requestLog,
              })
            )?.current_subscription ?? null;

          const walletAccountsRes = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/wallet-accounts?${scopeQuery}`,
            requestLog,
          });
          const wallet = readActiveWallet(
            walletAccountsRes?.items,
            spendAmount,
            requiredVirtualCurrencyCode,
          );
          if (!wallet) {
            return {
              status: "error",
              result: {
                message: requiredVirtualCurrencyCode
                  ? `Insufficient ${requiredVirtualCurrencyCode} balance for this operation`
                  : "Insufficient balance for this operation",
                activationScope,
                realmRef,
                spendAmount,
                requiredVirtualCurrencyCode: requiredVirtualCurrencyCode || null,
                credits_remaining: accessProjection?.credits_remaining ?? null,
                subscriptionStatus: currentSubscription?.status ?? null,
              },
            };
          }

          const consumed = await fetchGatewayJson({
            gatewayBaseUrl,
            gatewayClientApiKey: resolvedGatewayClientApiKey,
            path: `/v1/xapps/${encodeURIComponent(xappId)}/monetization/wallet-accounts/${encodeURIComponent(String(wallet.id))}/consume`,
            method: "POST",
            body: {
              amount: String(spendAmount),
              source_ref: requestId
                ? `xplace-monetization-lab:${requestId}`
                : "xplace-monetization-lab",
              metadata: {
                tool_name: toolName,
                action_label: actionLabel,
                spend_amount: String(spendAmount),
                virtual_currency_code: requiredVirtualCurrencyCode || null,
                installation_id: installationId || null,
                realm_ref: realmRef,
                notes,
              },
            },
            requestLog,
          });
          walletAccount = consumed?.wallet_account ?? null;
          walletLedger = consumed?.wallet_ledger ?? null;
          accessProjection =
            consumed?.access_projection && typeof consumed.access_projection === "object"
              ? {
                  ...(accessProjection && typeof accessProjection === "object"
                    ? accessProjection
                    : {}),
                  ...consumed.access_projection,
                }
              : accessProjection;
        } catch (err) {
          return {
            status: "error",
            result: {
              message: err?.message || String(err),
              activationScope,
              realmRef,
            },
          };
        }

        return {
          status: "success",
          result: {
            status: "success",
            activationScope,
            realmRef,
            actionLabel,
            notes,
            spendAmount,
            virtualCurrencyCode: requiredVirtualCurrencyCode || null,
            credits_remaining: accessProjection?.credits_remaining ?? null,
            subscriptionStatus: currentSubscription?.status ?? null,
            walletAccountId: walletAccount?.id ?? null,
            walletLedgerId: walletLedger?.id ?? null,
            summary: requiredVirtualCurrencyCode
              ? `Spent ${spendAmount} ${requiredVirtualCurrencyCode} for ${actionLabel}.`
              : `Spent ${spendAmount} credits for ${actionLabel}.`,
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
          const fallback = buildWeatherFallbackSnapshot({
            latitude,
            longitude,
            nowIso,
          });
          return {
            ok: true,
            status: 200,
            body: buildWeatherPreviewFallbackBody({
              fallback,
              message: "Open-Meteo preview is unavailable; showing offline demo data.",
            }),
          };
        }
        if (!upstreamRes.ok || !upstreamBody || typeof upstreamBody !== "object") {
          const fallback = buildWeatherFallbackSnapshot({
            latitude,
            longitude,
            nowIso,
          });
          return {
            ok: true,
            status: 200,
            body: buildWeatherPreviewFallbackBody({
              fallback,
              message:
                "Open-Meteo preview returned an invalid response; showing offline demo data.",
            }),
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
