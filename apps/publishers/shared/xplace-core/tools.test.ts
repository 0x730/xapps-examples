import { afterEach, describe, expect, it, vi } from "vitest";
import { createXplaceToolRegistry, listWorkspaceTools } from "./tools.js";

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
