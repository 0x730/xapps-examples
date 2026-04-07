import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createXplacePreviewRegistry,
  createXplaceToolRegistry,
  listWorkspaceTools,
} from "./tools.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("xplace monetization lab tool", () => {
  it("exposes the monetization lab tool in the shared workspace registry", () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
    });

    const tool = registry.open_monetization_lab;
    expect(tool).toBeDefined();
    expect(tool?.mode).toBe("auto");
    expect(tool?.xapp).toBe("xplace-monetization-lab-jsonforms");

    const listed = listWorkspaceTools(registry);
    expect(listed.some((entry) => entry.tool_name === "open_monetization_lab")).toBe(true);
  });

  it("exposes the XMS certificate request tool in the shared workspace registry", () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
    });

    const tool = registry.submit_xms_certificate_request;
    expect(tool).toBeDefined();
    expect(tool?.mode).toBe("auto");
    expect(tool?.xapp).toBe("xplace-certs-xms-jsonforms");
  });

  it("consumes XMS wallet credits for the certificate reference request", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (
        url.includes("/v1/xapps/xapp_1/monetization/usage-policies/submit_xms_certificate_request")
      ) {
        return new Response(
          JSON.stringify({
            usage_policy: {
              tool_name: "submit_xms_certificate_request",
              unit: "certificate_request",
              credit_cost: 2,
              status: "active",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "inactive",
              balance_state: "sufficient",
              has_current_access: true,
              credits_remaining: "5",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            current_subscription: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/wallet-accounts?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            items: [{ id: "wallet_1", status: "active", balance_remaining: "5" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/wallet-accounts/wallet_1/consume")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.amount).toBe("2");
        expect(body.source_ref).toBe("xplace-certs-xms-jsonforms:req_1");
        expect(body.metadata.tool_name).toBe("submit_xms_certificate_request");
        expect(body.metadata.credit_cost).toBe("2");
        return new Response(
          JSON.stringify({
            wallet_account: { id: "wallet_1", balance_remaining: "3" },
            wallet_ledger: { id: "ledger_1", event_kind: "consume", amount: "2" },
            access_projection: { credits_remaining: "3", balance_state: "sufficient" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.submit_xms_certificate_request.handle({
      requestId: "req_1",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        companyCui: "RO12345678",
        requestPurpose: "licitatie",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.entitlement_state).toBe("inactive");
    expect(result.result.has_current_access).toBe(true);
    expect(result.result.access_summary).toBe(
      "Current subject access with usable certificate credits",
    );
    expect(result.result.credit_cost).toBe(2);
    expect(result.result.credits_remaining).toBe("3");
    expect(result.result.walletLedgerId).toBe("ledger_1");
    expect(fetchSpy).toHaveBeenCalledTimes(5);
  });

  it("accepts zero-cost certificate usage policies without consuming wallet credits", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (
        url.includes("/v1/xapps/xapp_1/monetization/usage-policies/submit_xms_certificate_request")
      ) {
        return new Response(
          JSON.stringify({
            usage_policy: {
              tool_name: "submit_xms_certificate_request",
              unit: "certificate_request",
              credit_cost: 0,
              status: "active",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "active",
              balance_state: "unknown",
              has_current_access: true,
              credits_remaining: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            current_subscription: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.submit_xms_certificate_request.handle({
      requestId: "req_1",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        companyCui: "RO12345678",
        requestPurpose: "licitatie",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.entitlement_state).toBe("active");
    expect(result.result.has_current_access).toBe(true);
    expect(result.result.access_summary).toBe("Current subject access");
    expect(result.result.credit_cost).toBe(0);
    expect(result.result.walletLedgerId).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("requires subscription access and consumes bundled credits for certificate subscription requests", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (
        url.includes("/v1/xapps/xapp_1/monetization/usage-policies/submit_xms_certificate_request")
      ) {
        return new Response(
          JSON.stringify({
            usage_policy: {
              tool_name: "submit_xms_certificate_request",
              unit: "certificate_request",
              credit_cost: 2,
              status: "active",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "active",
              balance_state: "sufficient",
              has_current_access: true,
              credits_remaining: "3",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            current_subscription: { id: "sub_1", status: "active", tier: "cert_membership" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/wallet-accounts?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            items: [{ id: "wallet_1", status: "active", balance_remaining: "3" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/wallet-accounts/wallet_1/consume")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.amount).toBe("2");
        return new Response(
          JSON.stringify({
            wallet_account: { id: "wallet_1", balance_remaining: "1" },
            wallet_ledger: { id: "ledger_1", event_kind: "consume", amount: "2" },
            access_projection: { credits_remaining: "1", balance_state: "sufficient" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.submit_xms_certificate_request.handle({
      requestId: "req_1",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        companyCui: "RO12345678",
        requestPurpose: "licitatie",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.entitlement_state).toBe("active");
    expect(result.result.has_current_access).toBe(true);
    expect(result.result.access_summary).toBe(
      "Active subscription with usable certificate credits",
    );
    expect(result.result.credit_cost).toBe(2);
    expect(result.result.credits_remaining).toBe("1");
    expect(result.result.subscriptionStatus).toBe("active");
    expect(result.result.walletLedgerId).toBe("ledger_1");
    expect(fetchSpy).toHaveBeenCalledTimes(5);
  });

  it("activates the selected monetization package on the current request scope", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/v1/xapps/xapp_1/monetization")) {
        return new Response(
          JSON.stringify({
            xapp_id: "xapp_1",
            items: [
              {
                id: "offering_1",
                slug: "default_paywall",
                packages: [
                  {
                    id: "package_1",
                    slug: "team_hybrid",
                    prices: [
                      {
                        id: "price_1",
                        amount: "129",
                        currency: "RON",
                      },
                    ],
                  },
                ],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/prepare")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.realm_ref).toBe("workspace:alpha");
        expect(body.request_id).toBe("req_1");
        expect(body.source_kind).toBe("owner_managed_external");
        return new Response(
          JSON.stringify({
            prepared_intent: {
              purchase_intent_id: "intent_1",
              status: "created",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_1/transactions")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.status).toBe("verified");
        return new Response(
          JSON.stringify({
            transaction: {
              id: "txn_1",
              status: "verified",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_1/issue-access")) {
        return new Response(
          JSON.stringify({
            idempotent: false,
            issuance_mode: "entitlement",
            subscription_contract: {
              id: "contract_1",
              status: "active",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?realm_ref=")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "active",
              balance_state: "unknown",
              tier: "team",
              credits_remaining: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?realm_ref=")) {
        return new Response(
          JSON.stringify({
            current_subscription: {
              id: "contract_1",
              status: "active",
              tier: "team",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.open_monetization_lab.handle({
      requestId: "req_1",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        scopeKind: "realm",
        requestedPackage: "team_hybrid",
        realmRef: "workspace:alpha",
        contactEmail: "owner@example.com",
        notes: "Need plan validation",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.activationScope).toBe("realm");
    expect(result.result.requestedPackage).toBe("team_hybrid");
    expect(result.result.realmRef).toBe("workspace:alpha");
    expect(result.result.preparedIntent.purchase_intent_id).toBe("intent_1");
    expect(result.result.transaction.id).toBe("txn_1");
    expect(result.result.accessProjection.tier).toBe("team");
    expect(result.result.currentSubscription.id).toBe("contract_1");
    expect(result.result.summary).toContain("Team Hybrid");
    expect(fetchSpy).toHaveBeenCalledTimes(6);
  });

  it("returns an explicit configuration error when the target client key is missing", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "",
    });

    const result = await registry.open_monetization_lab.handle({
      requestId: "req_2",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        scopeKind: "subject",
        requestedPackage: "starter_unlock",
      },
    });

    expect(result.status).toBe("error");
    expect(result.result.message).toContain("Target client API key");
  });
});

describe("xplace weather preview/tool fallback", () => {
  it("returns offline demo weather data when the tool upstream is unavailable", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
    });
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("fetch failed"));

    const result = await registry.lookup_weather_now.handle({
      payload: {
        latitude: 46.7712,
        longitude: 23.6236,
        locationLabel: "Cluj",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.provider).toBe("open-meteo-fallback");
    expect(result.result.upstreamStatus).toBe("unavailable");
    expect(result.result.summary).toContain("offline demo fallback");
  });

  it("returns offline demo preview data when the preview upstream is unavailable", async () => {
    const registry = createXplacePreviewRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      anafApiBaseUrl: "https://webservicesp.anaf.ro",
      nowIso: () => "2026-04-01T12:00:00.000Z",
    });
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("fetch failed"));

    const result = await registry.weather_location_details.handle({
      payload: {
        latitude: 46.7712,
        longitude: 23.6236,
      },
    });

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("upstream_fallback");
    expect(result.body.summary.provider).toBe("open-meteo-fallback");
    expect(result.body.tags).toContain("offline-demo");
  });
});
