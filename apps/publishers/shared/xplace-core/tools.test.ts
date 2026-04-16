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
    expect(tool?.mode).toBe("manual");
    expect(tool?.xapp).toBe("xplace-certs-xms-jsonforms");
  });

  it("exposes the VC XMS certificate request tool in the shared workspace registry", () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
    });

    const tool = registry.submit_xms_certificate_request_vc;
    expect(tool).toBeDefined();
    expect(tool?.mode).toBe("auto");
    expect(tool?.xapp).toBe("xplace-certs-xms-jsonforms-vc");
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
              credit_cost: 1,
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
        expect(body.amount).toBe("1");
        expect(body.source_ref).toBe("xplace-certs-xms-jsonforms:req_1");
        expect(body.metadata.tool_name).toBe("submit_xms_certificate_request");
        expect(body.metadata.credit_cost).toBe("1");
        return new Response(
          JSON.stringify({
            wallet_account: { id: "wallet_1", balance_remaining: "4" },
            wallet_ledger: { id: "ledger_1", event_kind: "consume", amount: "1" },
            access_projection: { credits_remaining: "4", balance_state: "sufficient" },
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
    expect(result.result.status).toBe("accepted");
    expect(String(result.result.requestRef || "")).toContain("XMS-CERT-");
    expect(result.result.summary).toBe("Certificate request accepted for RO12345678.");
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
    expect(result.result.status).toBe("accepted");
    expect(String(result.result.requestRef || "")).toContain("XMS-CERT-");
    expect(result.result.summary).toBe("Certificate request accepted for RO12345678.");
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
              credit_cost: 1,
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
        expect(body.amount).toBe("1");
        return new Response(
          JSON.stringify({
            wallet_account: { id: "wallet_1", balance_remaining: "2" },
            wallet_ledger: { id: "ledger_1", event_kind: "consume", amount: "1" },
            access_projection: { credits_remaining: "2", balance_state: "sufficient" },
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
    expect(result.result.status).toBe("accepted");
    expect(String(result.result.requestRef || "")).toContain("XMS-CERT-");
    expect(result.result.summary).toBe("Certificate request accepted for RO12345678.");
    expect(fetchSpy).toHaveBeenCalledTimes(5);
  });

  it("selects the wallet matching the authored virtual currency code when usage policy requires it", async () => {
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
              credit_cost: 1,
              virtual_currency_code: "CERT_CREDITS",
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
            items: [
              {
                id: "wallet_wrong",
                status: "active",
                balance_remaining: "50",
                virtual_currency: { code: "OTHER_CREDITS" },
              },
              {
                id: "wallet_cert",
                status: "active",
                balance_remaining: "5",
                virtual_currency: { code: "CERT_CREDITS" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/wallet-accounts/wallet_cert/consume")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.amount).toBe("1");
        expect(body.metadata.virtual_currency_code).toBe("CERT_CREDITS");
        return new Response(
          JSON.stringify({
            wallet_account: {
              id: "wallet_cert",
              balance_remaining: "4",
              virtual_currency: { code: "CERT_CREDITS" },
            },
            wallet_ledger: {
              id: "ledger_cert",
              event_kind: "consume",
              amount: "1",
              virtual_currency: { code: "CERT_CREDITS" },
            },
            access_projection: { credits_remaining: "4", balance_state: "sufficient" },
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
    expect(result.result.status).toBe("accepted");
    expect(String(result.result.requestRef || "")).toContain("XMS-CERT-");
    expect(fetchSpy).toHaveBeenCalledTimes(5);
  });

  it("uses the VC certificate source ref prefix and exposes named currency details", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (
        url.includes(
          "/v1/xapps/xapp_1/monetization/usage-policies/submit_xms_certificate_request_vc",
        )
      ) {
        return new Response(
          JSON.stringify({
            usage_policy: {
              tool_name: "submit_xms_certificate_request_vc",
              unit: "certificate_request",
              credit_cost: 2,
              virtual_currency_code: "CERT_CREDITS",
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
              credits_remaining: "5",
              virtual_currency: { code: "CERT_CREDITS", name: "Certificate Credits" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            current_subscription: { id: "sub_1", status: "active" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/wallet-accounts?subject_id=subject_1")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "wallet_cert_vc",
                status: "active",
                balance_remaining: "5",
                virtual_currency: { code: "CERT_CREDITS", name: "Certificate Credits" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/wallet-accounts/wallet_cert_vc/consume")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.source_ref).toBe("xplace-certs-xms-jsonforms-vc:req_vc_1");
        expect(body.metadata.tool_name).toBe("submit_xms_certificate_request_vc");
        expect(body.metadata.virtual_currency_code).toBe("CERT_CREDITS");
        return new Response(
          JSON.stringify({
            wallet_account: {
              id: "wallet_cert_vc",
              balance_remaining: "3",
              virtual_currency: { code: "CERT_CREDITS", name: "Certificate Credits" },
            },
            wallet_ledger: {
              id: "ledger_cert_vc",
              event_kind: "consume",
              amount: "2",
              virtual_currency: { code: "CERT_CREDITS", name: "Certificate Credits" },
            },
            access_projection: {
              credits_remaining: "3",
              balance_state: "sufficient",
              virtual_currency: { code: "CERT_CREDITS", name: "Certificate Credits" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.submit_xms_certificate_request_vc.handle({
      requestId: "req_vc_1",
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
    expect(result.result.virtualCurrencyCode).toBe("CERT_CREDITS");
    expect(result.result.virtualCurrencyName).toBe("Certificate Credits");
    expect(result.result.walletLedgerId).toBe("ledger_cert_vc");
    expect(fetchSpy).toHaveBeenCalledTimes(5);
  });

  it("resolves the gateway client API key per request client when a resolver is provided", async () => {
    const seenKeys = [];
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: ({ clientId }) =>
        clientId === "client_xconectc"
          ? "xapps_test_xconectc_key_123456789"
          : "xconect-dev-api-key",
    });
    vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      seenKeys.push(String(init?.headers?.["x-api-key"] || ""));
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
      clientId: "client_xconectc",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        companyCui: "RO12345678",
        requestPurpose: "licitatie",
      },
    });

    expect(result.status).toBe("success");
    expect(seenKeys).toEqual([
      "xapps_test_xconectc_key_123456789",
      "xapps_test_xconectc_key_123456789",
      "xapps_test_xconectc_key_123456789",
    ]);
  });

  it("spends a named virtual currency on the monetization lab lane", async () => {
    const registry = createXplaceToolRegistry({
      weatherApiBaseUrl: "https://api.open-meteo.com",
      nowIso: () => "2026-04-01T12:00:00.000Z",
      gatewayBaseUrl: "http://localhost:3000",
      gatewayClientApiKey: "xconect-dev-api-key",
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/v1/xapps/xapp_1/monetization/usage-policies/spend_lab_credits")) {
        return new Response(
          JSON.stringify({
            usage_policy: {
              tool_name: "spend_lab_credits",
              unit: "lab_operation",
              credit_cost: 25,
              virtual_currency_code: "LAB_CREDITS",
              status: "active",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?realm_ref=workspace%3Aalpha")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "active",
              balance_state: "sufficient",
              has_current_access: true,
              credits_remaining: "500",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (
        url.includes(
          "/v1/xapps/xapp_1/monetization/current-subscription?realm_ref=workspace%3Aalpha",
        )
      ) {
        return new Response(
          JSON.stringify({
            current_subscription: {
              id: "sub_team",
              status: "active",
              tier: "team",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (
        url.includes("/v1/xapps/xapp_1/monetization/wallet-accounts?realm_ref=workspace%3Aalpha")
      ) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "wallet_other",
                status: "active",
                balance_remaining: "300",
                virtual_currency: { code: "OTHER_CREDITS" },
              },
              {
                id: "wallet_lab",
                status: "active",
                balance_remaining: "500",
                virtual_currency: { code: "LAB_CREDITS" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/wallet-accounts/wallet_lab/consume")) {
        const body = JSON.parse(String(init?.body || "{}"));
        expect(body.amount).toBe("25");
        expect(body.metadata.virtual_currency_code).toBe("LAB_CREDITS");
        expect(body.metadata.realm_ref).toBe("workspace:alpha");
        return new Response(
          JSON.stringify({
            wallet_account: {
              id: "wallet_lab",
              balance_remaining: "475",
              virtual_currency: { code: "LAB_CREDITS" },
            },
            wallet_ledger: {
              id: "ledger_lab",
              event_kind: "consume",
              amount: "25",
              virtual_currency: { code: "LAB_CREDITS" },
            },
            access_projection: { credits_remaining: "475", balance_state: "sufficient" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.spend_lab_credits.handle({
      requestId: "req_spend_1",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        scopeKind: "realm",
        realmRef: "workspace:alpha",
        actionLabel: "Generate export bundle",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.virtualCurrencyCode).toBe("LAB_CREDITS");
    expect(result.result.spendAmount).toBe(25);
    expect(result.result.walletLedgerId).toBe("ledger_lab");
    expect(result.result.summary).toContain("Generate export bundle");
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

  it("activates the subscription package on subject scope in the monetization lab", async () => {
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
                    id: "package_sub",
                    slug: "pro_monthly",
                    prices: [{ id: "price_sub", amount: "49", currency: "RON" }],
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
        expect(body.subject_id).toBe("subject_1");
        expect(body.request_id).toBe("req_sub");
        return new Response(
          JSON.stringify({
            prepared_intent: {
              purchase_intent_id: "intent_sub",
              status: "created",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_sub/transactions")) {
        return new Response(
          JSON.stringify({
            transaction: { id: "txn_sub", status: "verified" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_sub/issue-access")) {
        return new Response(
          JSON.stringify({
            idempotent: false,
            issuance_mode: "subscription",
            subscription_contract: {
              id: "contract_sub",
              status: "active",
              tier: "pro",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?subject_id=")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "active",
              balance_state: "unknown",
              tier: "pro",
              credits_remaining: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=")) {
        return new Response(
          JSON.stringify({
            current_subscription: {
              id: "contract_sub",
              status: "active",
              tier: "pro",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.open_monetization_lab.handle({
      requestId: "req_sub",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        scopeKind: "subject",
        requestedPackage: "pro_monthly",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.requestedPackage).toBe("pro_monthly");
    expect(result.result.issuedAccess.issuance_mode).toBe("subscription");
    expect(result.result.issuedAccess.subscription_contract.id).toBe("contract_sub");
    expect(result.result.currentSubscription.id).toBe("contract_sub");
    expect(result.result.accessProjection.tier).toBe("pro");
    expect(result.result.summary).toContain("Pro Monthly");
    expect(fetchSpy).toHaveBeenCalledTimes(6);
  });

  it("activates the credit-pack package with named virtual currency on subject scope", async () => {
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
                id: "offering_credits",
                slug: "upgrade_path",
                packages: [
                  {
                    id: "package_credits",
                    slug: "credits_500",
                    prices: [{ id: "price_credits", amount: "79", currency: "RON" }],
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
        expect(body.subject_id).toBe("subject_1");
        return new Response(
          JSON.stringify({
            prepared_intent: {
              purchase_intent_id: "intent_credits",
              status: "created",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (
        url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_credits/transactions")
      ) {
        return new Response(
          JSON.stringify({
            transaction: { id: "txn_credits", status: "verified" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (
        url.endsWith("/v1/xapps/xapp_1/monetization/purchase-intents/intent_credits/issue-access")
      ) {
        return new Response(
          JSON.stringify({
            idempotent: false,
            issuance_mode: "wallet_topup",
            wallet_account: {
              id: "wallet_lab",
              balance_remaining: "500",
              virtual_currency: {
                code: "LAB_CREDITS",
                name: "Lab Credits",
              },
            },
            wallet_ledger: {
              id: "ledger_topup",
              event_kind: "top_up",
              amount: "500",
              virtual_currency: {
                code: "LAB_CREDITS",
                name: "Lab Credits",
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/access?subject_id=")) {
        return new Response(
          JSON.stringify({
            access_projection: {
              entitlement_state: "inactive",
              balance_state: "sufficient",
              credits_remaining: "500",
              virtual_currency: {
                code: "LAB_CREDITS",
                name: "Lab Credits",
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      if (url.includes("/v1/xapps/xapp_1/monetization/current-subscription?subject_id=")) {
        return new Response(
          JSON.stringify({
            current_subscription: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ) as any;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await registry.open_monetization_lab.handle({
      requestId: "req_credits",
      xappId: "xapp_1",
      clientId: "client_1",
      installationId: "inst_1",
      subjectId: "subject_1",
      payload: {
        scopeKind: "subject",
        requestedPackage: "credits_500",
      },
    });

    expect(result.status).toBe("success");
    expect(result.result.requestedPackage).toBe("credits_500");
    expect(result.result.issuedAccess.issuance_mode).toBe("wallet_topup");
    expect(result.result.issuedAccess.wallet_account.virtual_currency.code).toBe("LAB_CREDITS");
    expect(result.result.issuedAccess.wallet_ledger.virtual_currency.code).toBe("LAB_CREDITS");
    expect(result.result.accessProjection.virtual_currency.code).toBe("LAB_CREDITS");
    expect(result.result.accessProjection.credits_remaining).toBe("500");
    expect(result.result.summary).toContain("Credits 500");
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
