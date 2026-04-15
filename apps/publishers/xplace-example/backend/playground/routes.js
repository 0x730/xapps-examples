import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import {
  createGatewayApiClient,
  createPublisherApiClient,
} from "../../../../../packages/server-sdk/dist/index.js";
import {
  buildCreatorClubPaymentSessionConfigFromManifest,
  listCreatorClubFeaturesFromManifest,
  listCreatorClubPaymentPresetsFromManifest,
} from "../../shared/creatorClubManifestConfig.js";
import { createPlaygroundGatewayClient } from "./gatewayClient.js";
import { executeCreatorClubFeature } from "./featureExecution.js";
import { evaluateFeatureExecution } from "./featureRules.js";
import {
  bindLinkedAccountToSession,
  bundlePlaygroundApp,
  completePublisherLinkForAccount,
  readPlaygroundState,
  readPublisherLinkStatus,
  requirePlaygroundSession,
  samePlaygroundContext,
  sanitizePlaygroundSession,
  sendPublisherLinkError,
} from "./runtimeSupport.js";

export const PLAYGROUND_SLUG = "xplace-creator-club-publisher-rendered";
export const PLAYGROUND_JS_ROUTE = `/widgets/${PLAYGROUND_SLUG}.app.js`;
export const PLAYGROUND_BOOTSTRAP_ROUTE = `/widgets/${PLAYGROUND_SLUG}/bootstrap-verify`;
export const PLAYGROUND_API_BASE_ROUTE = `/widgets/${PLAYGROUND_SLUG}/api`;
export const PLAYGROUND_SETUP_BASE_ROUTE = "/creator-club";
const RECENT_XMS_EVENT_LIMIT = 10;

function normalizeOriginLoose(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return "";
  }
}

function hashPassword(password, salt) {
  return scryptSync(String(password || ""), String(salt || ""), 64).toString("hex");
}

function verifyPassword(password, account) {
  const expected = Buffer.from(String(account?.password_hash || ""), "hex");
  const actual = Buffer.from(hashPassword(password, account?.password_salt), "hex");
  if (expected.length === 0 || expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function buildPlaygroundLinks({ portalBaseUrl, publisherBaseUrl, session }) {
  const xappId = String(session?.context?.xapp_id || "").trim();
  return {
    portal_marketplace_xapp: xappId
      ? `${String(portalBaseUrl || "").replace(/\/+$/, "")}/marketplace/xapps/${encodeURIComponent(xappId)}`
      : String(portalBaseUrl || "").replace(/\/+$/, ""),
    publisher_xapp_detail: xappId
      ? `${String(publisherBaseUrl || "").replace(/\/+$/, "")}/xapps/${encodeURIComponent(xappId)}`
      : String(publisherBaseUrl || "").replace(/\/+$/, ""),
    publisher_monetization_studio: xappId
      ? `${String(publisherBaseUrl || "").replace(/\/+$/, "")}/xapps/${encodeURIComponent(xappId)}/monetization`
      : String(publisherBaseUrl || "").replace(/\/+$/, ""),
  };
}

function buildSetupUrl(request, pathname) {
  return new URL(
    String(pathname || "/"),
    `${request.protocol}://${String(request.headers.host || "")}`,
  );
}

function buildSetupRedirectUrl(request, pathname, params = {}) {
  const url = buildSetupUrl(request, pathname);
  for (const [key, value] of Object.entries(params)) {
    const nextValue = String(value || "").trim();
    if (nextValue) {
      url.searchParams.set(key, nextValue);
    }
  }
  return url.toString();
}

function readJsonBody(request) {
  return request.body && typeof request.body === "object" ? request.body : {};
}

function buildWidgetSurfaceUrl(request) {
  const referer = String(request.headers.referer || "").trim();
  if (referer) return referer;
  return buildSetupUrl(request, `/widgets/${PLAYGROUND_SLUG}.html`).toString();
}

function buildCreatorClubSetupPage({
  title,
  heading,
  description,
  submitLabel,
  submitPath,
  alternateLabel,
  alternateHref,
  accent,
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(180deg, #f6f3ec 0%, #fff 100%); color: #241b10; }
    .card { width: min(460px, calc(100vw - 32px)); background: rgba(255,255,255,0.96); border: 1px solid rgba(58,47,28,0.14); border-radius: 24px; padding: 28px; box-shadow: 0 18px 48px rgba(36,27,16,0.1); }
    .badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: rgba(15,118,110,0.08); color: #155e75; font-size: 12px; font-weight: 700; margin-bottom: 14px; }
    h1 { margin: 0 0 10px; font: 700 1.65rem/1.15 "IBM Plex Serif", Georgia, serif; }
    p { margin: 0 0 18px; color: #6c5d49; line-height: 1.5; }
    label { display: grid; gap: 8px; margin-bottom: 14px; font-size: 13px; font-weight: 700; color: #3a2f1c; }
    input { width: 100%; box-sizing: border-box; padding: 12px 13px; border-radius: 14px; border: 1px solid rgba(58,47,28,0.18); background: rgba(255,255,255,0.96); font: inherit; }
    button { width: 100%; border: 0; border-radius: 999px; padding: 12px 16px; background: ${accent}; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    button[disabled] { opacity: 0.72; cursor: wait; }
    .footer { margin-top: 18px; color: #6c5d49; font-size: 14px; }
    .footer a { color: #155e75; font-weight: 700; text-decoration: none; }
    .meta { margin-top: 16px; display: grid; gap: 8px; font-size: 12px; color: #6c5d49; }
    .error { margin-top: 14px; color: #b91c1c; font-size: 14px; min-height: 20px; }
  </style>
</head>
<body>
  <main class="card">
    <div class="badge">Creator Club • Linking setup</div>
    <h1>${heading}</h1>
    <p>${description}</p>
    <form id="setupForm">
      <label>
        Email
        <input id="email" name="email" type="email" required placeholder="name@example.com" />
      </label>
      <label>
        Password
        <input id="password" name="password" type="password" required placeholder="••••••••" />
      </label>
      <label id="displayNameField" style="display:none;">
        Display name
        <input id="displayName" name="displayName" type="text" placeholder="Creator name" />
      </label>
      <button id="submitBtn" type="submit">${submitLabel}</button>
      <div id="errorMessage" class="error"></div>
    </form>
    <div class="footer">${alternateLabel} <a id="alternateLink" href="${alternateHref}">${alternateHref.includes("/register") ? "Register" : "Login"}</a></div>
    <div class="meta">
      <div>subjectId: <strong id="meta-subject">n/a</strong></div>
      <div>installationId: <strong id="meta-installation">n/a</strong></div>
      <div>xappId: <strong id="meta-xapp">n/a</strong></div>
    </div>
  </main>
  <script>
    const params = new URLSearchParams(window.location.search);
    const subjectId = params.get("subjectId") || params.get("subject_id") || "";
    const installationId = params.get("installationId") || params.get("installation_id") || "";
    const xappId = params.get("xappId") || params.get("xapp_id") || "";
    const returnUrl = params.get("returnUrl") || "";
    const emailParam = params.get("email") || "";
    const alternateLink = document.getElementById("alternateLink");
    const alternateUrl = new URL(alternateLink.getAttribute("href"), window.location.origin);
    if (subjectId) alternateUrl.searchParams.set("subjectId", subjectId);
    if (installationId) alternateUrl.searchParams.set("installationId", installationId);
    if (xappId) alternateUrl.searchParams.set("xappId", xappId);
    if (returnUrl) alternateUrl.searchParams.set("returnUrl", returnUrl);
    if (emailParam) alternateUrl.searchParams.set("email", emailParam);
    alternateLink.href = alternateUrl.toString();
    if (emailParam) document.getElementById("email").value = emailParam;
    document.getElementById("meta-subject").textContent = subjectId || "n/a";
    document.getElementById("meta-installation").textContent = installationId || "n/a";
    document.getElementById("meta-xapp").textContent = xappId || "n/a";
    const displayNameField = document.getElementById("displayNameField");
    if (${JSON.stringify(submitPath)}.includes("register")) {
      displayNameField.style.display = "grid";
    }
    document.getElementById("setupForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      const errorMessage = document.getElementById("errorMessage");
      submitBtn.disabled = true;
      errorMessage.textContent = "";
      try {
        const response = await fetch(${JSON.stringify(submitPath)}, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            displayName: document.getElementById("displayName") ? document.getElementById("displayName").value : "",
            subjectId,
            installationId,
            xappId,
            returnUrl,
          }),
        });
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(String(json?.error?.message || json?.message || "Linking setup failed"));
        }
        try {
          if (window.parent) window.parent.postMessage({ type: "XAPPS_UI_REFRESH" }, "*");
        } catch {}
        if (json?.returnUrl) {
          window.location.assign(String(json.returnUrl));
          return;
        }
        window.location.assign(${JSON.stringify(PLAYGROUND_SETUP_BASE_ROUTE + "/dashboard")} + window.location.search + "&publisherUserEmail=" + encodeURIComponent(json?.publisherUserEmail || ""));
      } catch (error) {
        errorMessage.textContent = error && error.message ? error.message : String(error);
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

export async function registerMonetizationPlaygroundRoutes(fastify, options) {
  const {
    gatewayBaseUrl,
    gatewayClientApiKey,
    resolveGatewayClientApiKey,
    publisherGatewayApiKey,
    repo,
    sessionStore,
    accountsRepo,
    portalBaseUrl,
    publisherBaseUrl,
    widgetAllowedOrigins = [],
  } = options;

  function resolveSessionGatewayClientApiKey(session) {
    const clientId = String(session?.context?.client_id || "").trim();
    if (typeof resolveGatewayClientApiKey === "function") {
      const resolved = String(resolveGatewayClientApiKey({ clientId, session }) || "").trim();
      if (resolved) return resolved;
    }
    return String(gatewayClientApiKey || "").trim();
  }

  function buildGatewayClientForSession(session) {
    return createPlaygroundGatewayClient({
      gatewayBaseUrl,
      gatewayClientApiKey: resolveSessionGatewayClientApiKey(session),
    });
  }
  const publisherLinkClient = createPublisherApiClient({
    baseUrl: gatewayBaseUrl,
    apiKey: publisherGatewayApiKey,
  });

  async function readWorkspaceLinkStatus(session) {
    const widgetToken = String(session?.widget_token || "").trim();
    if (!widgetToken) {
      return { linked: false };
    }
    try {
      return await readPublisherLinkStatus({
        gatewayBaseUrl,
        widgetToken,
      });
    } catch {
      return { linked: false };
    }
  }

  function buildWorkspaceAuth(session, request) {
    const context = session?.context && typeof session.context === "object" ? session.context : {};
    const params = {
      subjectId: context.subject_id,
      installationId: context.installation_id,
      xappId: context.xapp_id,
      returnUrl: buildWidgetSurfaceUrl(request),
    };
    return {
      login_url: buildSetupRedirectUrl(request, `${PLAYGROUND_SETUP_BASE_ROUTE}/login`, params),
      register_url: buildSetupRedirectUrl(
        request,
        `${PLAYGROUND_SETUP_BASE_ROUTE}/register`,
        params,
      ),
    };
  }

  async function readCatalogData(session) {
    const gatewayClient = buildGatewayClientForSession(session);
    const xappId = session?.context?.xapp_id;
    const [catalog, xappDetail] = await Promise.all([
      gatewayClient.listCatalog({ xappId }),
      gatewayClient.readXappDetail({ xappId }),
    ]);
    const manifest =
      xappDetail?.manifest && typeof xappDetail.manifest === "object" ? xappDetail.manifest : {};
    return {
      items: Array.isArray(catalog?.items) ? catalog.items : [],
      paywalls: Array.isArray(catalog?.paywalls) ? catalog.paywalls : [],
      payment_presets: listCreatorClubPaymentPresetsFromManifest(manifest),
      feature_definitions: listCreatorClubFeaturesFromManifest(manifest),
    };
  }

  async function readStateData(session, query = {}) {
    const gatewayClient = buildGatewayClientForSession(session);
    return readPlaygroundState({
      gatewayClient,
      session,
      scopeKind: query.scopeKind,
      realmRef: query.realmRef,
      intentId: query.intentId,
    });
  }

  async function readRecentXmsEvents(session) {
    if (!repo?.listWebhooks) return [];
    const xappId = String(session?.context?.xapp_id || "").trim();
    if (!xappId) return [];
    const rows = await repo.listWebhooks({ limit: Math.max(40, RECENT_XMS_EVENT_LIMIT * 4) });
    return rows
      .filter((row) => {
        const envelope = row?.payload && typeof row.payload === "object" ? row.payload : {};
        const payload =
          envelope?.payload && typeof envelope.payload === "object" ? envelope.payload : {};
        return (
          String(row?.event_type || "").startsWith("xapps.xms.") &&
          String(payload?.xapp_id || "").trim() === xappId
        );
      })
      .slice(0, RECENT_XMS_EVENT_LIMIT)
      .map((row) => {
        const envelope = row?.payload && typeof row.payload === "object" ? row.payload : {};
        const payload =
          envelope?.payload && typeof envelope.payload === "object" ? envelope.payload : {};
        return {
          id: String(row.id || "").trim() || null,
          event_id: String(row.event_id || "").trim() || null,
          event_type: String(row.event_type || "").trim() || null,
          received_at: String(row.received_at || "").trim() || null,
          request_id: String(payload?.request_id || "").trim() || null,
          payment_session_id: String(payload?.payment_session_id || "").trim() || null,
          purchase_intent_id: String(payload?.purchase_intent_id || "").trim() || null,
          snapshot_id: String(payload?.snapshot_id || "").trim() || null,
          reason: String(payload?.reason || "").trim() || null,
          source_ref: String(payload?.source_ref || "").trim() || null,
        };
      });
  }

  async function maybeFinalizeWorkspacePayment(session, query = {}) {
    const gatewayClient = buildGatewayClientForSession(session);
    const intentId = String(query.intentId || "").trim();
    if (!intentId) {
      return null;
    }
    try {
      const finalized = await gatewayClient.finalizePaymentSession({
        xappId: session.context.xapp_id,
        intentId,
      });
      return {
        attempted: true,
        finalized: true,
        payment_session_id:
          String(finalized?.payment_session?.payment_session_id || "").trim() || null,
        payment_status: String(finalized?.payment_session?.status || "").trim() || null,
        intent_status: String(finalized?.prepared_intent?.status || "").trim() || null,
        issuance_mode: String(finalized?.issued?.issuance_mode || "").trim() || null,
        idempotent: finalized?.issued?.idempotent === true,
        lifecycle_events: [
          "xapps.xms.transaction.reconciled",
          "xapps.xms.access.issued",
          "xapps.xms.access_snapshot.refreshed",
        ],
      };
    } catch (error) {
      return {
        attempted: true,
        finalized: false,
        message:
          error && error.message ? String(error.message) : "Workspace payment refresh failed",
      };
    }
  }

  async function buildWorkspaceSnapshot(request, session, query = {}) {
    const payment_refresh = await maybeFinalizeWorkspacePayment(session, query);
    const [catalogData, state, linkStatus, xmsEvents] = await Promise.all([
      readCatalogData(session),
      readStateData(session, query),
      readWorkspaceLinkStatus(session),
      readRecentXmsEvents(session),
    ]);
    return {
      ok: true,
      session: sanitizePlaygroundSession(session),
      links: buildPlaygroundLinks({ portalBaseUrl, publisherBaseUrl, session }),
      link_status: linkStatus,
      auth: buildWorkspaceAuth(session, request),
      ...(payment_refresh ? { payment_refresh } : {}),
      xms_events: xmsEvents,
      ...catalogData,
      ...state,
    };
  }

  async function runReferenceActivate(session, body) {
    const gatewayClient = buildGatewayClientForSession(session);
    const activation = await gatewayClient.referenceActivate({
      xappId: session.context.xapp_id,
      context: session.context,
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      offeringId: body.offeringId,
      packageId: body.packageId,
      priceId: body.priceId,
    });
    const state = await readStateData(session, {
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      intentId: activation?.prepared_intent?.purchase_intent_id,
    });
    return { ok: true, activation, ...state };
  }

  async function runCreatePaymentSession(request, session, body) {
    const gatewayClient = buildGatewayClientForSession(session);
    const host = String(request.headers.host || "").trim();
    const protocol = request.protocol || "http";
    const widgetUrl = `${protocol}://${host}/widgets/${PLAYGROUND_SLUG}.html`;
    const hostedPaymentPageUrl = `${String(gatewayBaseUrl || "").replace(/\/+$/, "")}/v1/gateway-payment.html`;
    const xappDetail = await gatewayClient.readXappDetail({
      xappId: session.context.xapp_id,
    });
    const manifest =
      xappDetail?.manifest && typeof xappDetail.manifest === "object" ? xappDetail.manifest : {};
    const sessionConfig = buildCreatorClubPaymentSessionConfigFromManifest(
      String(body.paymentGuardRef || body.payment_guard_ref || "").trim(),
      String(body.paymentScheme || body.payment_scheme || "").trim(),
      manifest,
      process.env,
    );
    const payment = await gatewayClient.createPaymentSession({
      xappId: session.context.xapp_id,
      context: session.context,
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      offeringId: body.offeringId,
      packageId: body.packageId,
      priceId: body.priceId,
      paymentGuardRef: sessionConfig.paymentGuardRef,
      scheme: sessionConfig.scheme,
      returnUrl: body.returnUrl || widgetUrl,
      cancelUrl: body.cancelUrl || widgetUrl,
      pageUrl: hostedPaymentPageUrl,
      metadata: sessionConfig.metadata,
    });
    return {
      ok: true,
      ...payment,
      payment_runtime: {
        session_creator: "gateway:/v1/payment-sessions",
        orchestration_entry:
          "xms:/v1/xapps/:xappId/monetization/purchase-intents/:intentId/payment-session",
        payment_guard_ref: sessionConfig.paymentGuardRef,
        payment_scheme: sessionConfig.scheme,
        issuer_mode: sessionConfig.issuerMode,
        definition_source: "xapp_manifest.payment_guard_definitions",
        lifecycle: [
          "prepare_purchase_intent",
          "create_gateway_payment_session",
          "hosted_payment_completion",
          "platform_finalize_purchase",
          "refresh_workspace_state",
        ],
      },
    };
  }

  async function runReconcilePaymentSession(session, body) {
    const reconciled = await gatewayClient.reconcilePaymentSession({
      xappId: session.context.xapp_id,
      intentId: body.intentId,
    });
    const state = await readStateData(session, {
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      intentId: body.intentId,
    });
    return { ok: true, reconciled, issued: reconciled?.issued || null, ...state };
  }

  async function runFeatureExecution(session, body) {
    if (!session.account) {
      return {
        statusCode: 401,
        payload: {
          ok: false,
          error: { message: "Login or register first to run Creator Club tools" },
        },
      };
    }
    const state = await readStateData(session, {
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      intentId: body.intentId,
    });
    const execution = evaluateFeatureExecution({
      featureKey: body.featureKey,
      featureDefinitions: state.feature_definitions,
      accessProjection: state.access_projection,
      currentSubscription: state.current_subscription,
    });
    if (!execution.ok) {
      return {
        statusCode: 200,
        payload: {
          ok: execution.ok,
          message: execution.message,
          feature: execution.feature || null,
          ...state,
        },
      };
    }
    const featureResult = await executeCreatorClubFeature({
      session,
      feature: execution.feature,
      scopeFields: state.scope_fields,
      xappId: session.context.xapp_id,
      gatewayClient,
    });
    const refreshedState = await readStateData(session, {
      scopeKind: body.scopeKind,
      realmRef: body.realmRef,
      intentId: body.intentId,
    });
    return {
      statusCode: 200,
      payload: {
        ok: featureResult.ok,
        message: featureResult.message,
        feature: execution.feature || null,
        execution: featureResult.execution,
        ...refreshedState,
      },
    };
  }

  fastify.get(PLAYGROUND_JS_ROUTE, async (_request, reply) => {
    const bundle = await bundlePlaygroundApp({ apiBaseRoute: PLAYGROUND_API_BASE_ROUTE });
    return reply.code(200).type("application/javascript; charset=utf-8").send(bundle);
  });

  fastify.post(PLAYGROUND_BOOTSTRAP_ROUTE, async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const token = String(body.token || "").trim();
    const bootstrapTicket = String(body.bootstrapTicket || body.bootstrap_ticket || "").trim();
    const hostOrigin = normalizeOriginLoose(body.hostOrigin);
    const installationId = String(body.installationId || "").trim();
    const subjectId = String(body.subjectId || "").trim();
    const clientId = String(body.clientId || "").trim();
    const xappId = String(body.xappId || "").trim();
    const previousSessionToken = String(
      body.previousSessionToken || body.previous_session_token || "",
    ).trim();

    if (!token && !bootstrapTicket) {
      return reply.code(401).send({
        ok: false,
        error: {
          code: "WIDGET_TOKEN_REQUIRED",
          message: "Widget token or bootstrap ticket is required",
        },
      });
    }
    if (!hostOrigin) {
      return reply.code(400).send({
        ok: false,
        error: { code: "HOST_ORIGIN_REQUIRED", message: "Host origin is required" },
      });
    }
    if (widgetAllowedOrigins.length > 0 && !widgetAllowedOrigins.includes(hostOrigin)) {
      return reply.code(403).send({
        ok: false,
        error: {
          code: "HOST_ORIGIN_NOT_ALLOWED",
          message: "Host origin is not allowed for this playground",
        },
      });
    }

    let verified;
    try {
      verified = await createGatewayApiClient({
        baseUrl: gatewayBaseUrl,
        token,
        fetchImpl: globalThis.fetch,
      }).verifyBrowserWidgetContext({
        hostOrigin,
        bootstrapTicket: bootstrapTicket || null,
        installationId: installationId || null,
        subjectId: subjectId || null,
      });
    } catch (error) {
      request.log.warn({ err: error }, "xplace-example playground bootstrap verify failed");
      return reply.code(502).send({
        ok: false,
        error: {
          code: "GATEWAY_UNREACHABLE",
          message: "Could not verify widget context with the gateway",
        },
      });
    }

    const nextContext = {
      installation_id: installationId || null,
      client_id: clientId || null,
      xapp_id: xappId || null,
      subject_id: subjectId || null,
      host_origin: hostOrigin,
      latest_request_id: String(verified?.latestRequestId || "").trim() || null,
      widget_token: token || null,
    };

    const reusableSession = previousSessionToken
      ? sessionStore.readSession(previousSessionToken)
      : null;
    let nextSession =
      reusableSession && samePlaygroundContext(reusableSession.context, nextContext)
        ? sessionStore.updateSession(reusableSession.token, {
            context: nextContext,
            widgetToken: token || null,
          }) || reusableSession
        : sessionStore.createSession({
            context: nextContext,
          });

    nextSession = await bindLinkedAccountToSession({
      sessionStore,
      session: nextSession,
      sessionToken: nextSession.token,
      gatewayBaseUrl,
      widgetToken: token || null,
      accountsRepo,
    });

    return reply.send({
      ok: true,
      verified: true,
      session_token: nextSession.token,
      session: sanitizePlaygroundSession(nextSession),
      links: buildPlaygroundLinks({ portalBaseUrl, publisherBaseUrl, session: nextSession }),
    });
  });

  fastify.get(`${PLAYGROUND_API_BASE_ROUTE}/me`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    return reply.send({
      ok: true,
      session: sanitizePlaygroundSession(resolved.session),
      links: buildPlaygroundLinks({ portalBaseUrl, publisherBaseUrl, session: resolved.session }),
    });
  });

  fastify.get(`${PLAYGROUND_SETUP_BASE_ROUTE}/login`, async (request, reply) => {
    reply.type("text/html; charset=utf-8");
    return reply.send(
      buildCreatorClubSetupPage({
        title: "Creator Club Login",
        heading: "Login and link",
        description:
          "Use the publisher account you want to bind to the current platform subject before the guarded widget opens.",
        submitLabel: "Login and link",
        submitPath: `${PLAYGROUND_SETUP_BASE_ROUTE}/api/login-and-link`,
        alternateLabel: "Need a new account?",
        alternateHref: `${PLAYGROUND_SETUP_BASE_ROUTE}/register`,
        accent: "linear-gradient(135deg, #0f766e, #155e75)",
      }),
    );
  });

  fastify.get(`${PLAYGROUND_SETUP_BASE_ROUTE}/register`, async (request, reply) => {
    reply.type("text/html; charset=utf-8");
    return reply.send(
      buildCreatorClubSetupPage({
        title: "Creator Club Register",
        heading: "Register and link",
        description:
          "Create a lightweight publisher account for Creator Club, then complete the platform link in the same flow.",
        submitLabel: "Register and link",
        submitPath: `${PLAYGROUND_SETUP_BASE_ROUTE}/api/register-and-link`,
        alternateLabel: "Already have an account?",
        alternateHref: `${PLAYGROUND_SETUP_BASE_ROUTE}/login`,
        accent: "linear-gradient(135deg, #a16207, #ca8a04)",
      }),
    );
  });

  fastify.get(`${PLAYGROUND_SETUP_BASE_ROUTE}/dashboard`, async (request, reply) => {
    const query = request.query && typeof request.query === "object" ? request.query : {};
    const returnUrl = String(query.returnUrl || "").trim();
    const publisherUserEmail = String(query.publisherUserEmail || "").trim();
    const backHref =
      returnUrl || buildSetupRedirectUrl(request, `${PLAYGROUND_SETUP_BASE_ROUTE}/login`, query);
    reply.type("text/html; charset=utf-8");
    return reply.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Creator Club Linking Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f6f3ec; color: #241b10; }
    .card { max-width: 760px; margin: 0 auto; background: rgba(255,255,255,0.96); border: 1px solid rgba(58,47,28,0.14); border-radius: 24px; padding: 24px; box-shadow: 0 18px 48px rgba(36,27,16,0.08); }
    h1 { margin: 0 0 10px; font: 700 1.65rem/1.15 "IBM Plex Serif", Georgia, serif; }
    p, li { color: #6c5d49; line-height: 1.5; }
    .row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    a, button { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 12px 16px; font-weight: 700; text-decoration: none; border: 1px solid rgba(58,47,28,0.14); }
    a.primary { background: linear-gradient(135deg, #0f766e, #155e75); color: #fff; border: 0; }
    a.secondary, button.secondary { background: rgba(255,255,255,0.96); color: #241b10; }
    .meta { display: grid; gap: 8px; margin-top: 16px; font-size: 13px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Creator Club linked</h1>
    <p>The publisher-side linking flow completed. You can now return to the guarded widget and continue with the React playground, monetization state, and XMS actions.</p>
    <ul>
      <li>publisher account: <strong>${publisherUserEmail || "linked"}</strong></li>
      <li>subjectId: <strong>${String(query.subjectId || query.subject_id || "").trim() || "n/a"}</strong></li>
      <li>xappId: <strong>${String(query.xappId || query.xapp_id || "").trim() || "n/a"}</strong></li>
    </ul>
    <div class="row">
      <a class="primary" href="${backHref}">Return</a>
      <a class="secondary" href="${buildSetupRedirectUrl(request, `${PLAYGROUND_SETUP_BASE_ROUTE}/login`, query)}">Open login</a>
    </div>
  </main>
</body>
</html>`);
  });

  fastify.post(`${PLAYGROUND_SETUP_BASE_ROUTE}/api/login-and-link`, async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const subjectId = String(body.subjectId || body.subject_id || "").trim();
    const installationId = String(body.installationId || body.installation_id || "").trim();
    const xappId = String(body.xappId || body.xapp_id || "").trim();
    const returnUrl = String(body.returnUrl || "").trim();
    const account = await accountsRepo.findAccountByEmail(email);
    if (!account || !verifyPassword(password, account)) {
      return reply.code(401).send({ ok: false, error: { message: "Invalid email or password" } });
    }
    if (subjectId && account.subject_id && subjectId !== account.subject_id) {
      return reply.code(403).send({
        ok: false,
        error: {
          message: "This publisher account belongs to a different platform subject context",
        },
      });
    }
    try {
      await completePublisherLinkForAccount({
        publisherLinkClient,
        account,
        subjectId,
        xappId,
        installationId,
        clientId: null,
      });
      return reply.send({
        ok: true,
        linked: Boolean(subjectId && xappId),
        publisherUserId: account.id,
        publisherUserEmail: account.email,
        returnUrl:
          returnUrl ||
          buildSetupRedirectUrl(request, `${PLAYGROUND_SETUP_BASE_ROUTE}/dashboard`, {
            subjectId,
            installationId,
            xappId,
            publisherUserEmail: account.email,
          }),
      });
    } catch (error) {
      return sendPublisherLinkError(
        reply,
        error,
        "Could not login and complete the publisher link",
      );
    }
  });

  fastify.post(`${PLAYGROUND_SETUP_BASE_ROUTE}/api/register-and-link`, async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const email = String(body.email || "").trim();
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");
    const subjectId = String(body.subjectId || body.subject_id || "").trim();
    const installationId = String(body.installationId || body.installation_id || "").trim();
    const xappId = String(body.xappId || body.xapp_id || "").trim();
    const returnUrl = String(body.returnUrl || "").trim();
    if (!email || !displayName || password.length < 6) {
      return reply.code(400).send({
        ok: false,
        error: {
          message: "displayName, email, and a password with at least 6 characters are required",
        },
      });
    }
    const existing = await accountsRepo.findAccountByEmail(email);
    if (existing) {
      return reply
        .code(409)
        .send({ ok: false, error: { message: "An account already exists for this email" } });
    }
    const salt = randomBytes(12).toString("hex");
    const account = await accountsRepo.createAccount({
      clientId: null,
      subjectId: subjectId || null,
      email,
      displayName,
      passwordHash: hashPassword(password, salt),
      passwordSalt: salt,
    });
    try {
      await completePublisherLinkForAccount({
        publisherLinkClient,
        account,
        subjectId,
        xappId,
        installationId,
        clientId: null,
      });
      return reply.send({
        ok: true,
        linked: Boolean(subjectId && xappId),
        publisherUserId: account.id,
        publisherUserEmail: account.email,
        returnUrl:
          returnUrl ||
          buildSetupRedirectUrl(request, `${PLAYGROUND_SETUP_BASE_ROUTE}/dashboard`, {
            subjectId,
            installationId,
            xappId,
            publisherUserEmail: account.email,
          }),
      });
    } catch (error) {
      return sendPublisherLinkError(
        reply,
        error,
        "Could not create the publisher account and complete the link",
      );
    }
  });

  fastify.get(`${PLAYGROUND_API_BASE_ROUTE}/link-status`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const widgetToken = String(resolved.session.widget_token || "").trim();
    if (!widgetToken) {
      return reply.code(400).send({
        ok: false,
        error: {
          message: "Widget session token is missing for publisher link status",
        },
      });
    }
    try {
      const status = await readPublisherLinkStatus({
        gatewayBaseUrl,
        widgetToken,
      });
      return reply.send({ ok: true, status });
    } catch (error) {
      return sendPublisherLinkError(reply, error, "Could not read publisher link status");
    }
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/register`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const email = String(body.email || "").trim();
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");
    if (!email || !displayName || password.length < 6) {
      return reply.code(400).send({
        ok: false,
        error: {
          message: "displayName, email, and a password with at least 6 characters are required",
        },
      });
    }
    const existing = await accountsRepo.findAccountByEmail(email);
    if (existing) {
      return reply
        .code(409)
        .send({ ok: false, error: { message: "An account already exists for this email" } });
    }
    const salt = randomBytes(12).toString("hex");
    const account = await accountsRepo.createAccount({
      clientId: resolved.session.context.client_id,
      subjectId: resolved.session.context.subject_id,
      email,
      displayName,
      passwordHash: hashPassword(password, salt),
      passwordSalt: salt,
    });
    const nextSession = sessionStore.bindAccount(resolved.token, account);
    return reply.send({ ok: true, session: sanitizePlaygroundSession(nextSession) });
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/login`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const account = await accountsRepo.findAccountByEmail(email);
    if (!account || !verifyPassword(password, account)) {
      return reply.code(401).send({ ok: false, error: { message: "Invalid email or password" } });
    }
    if (
      resolved.session.context.subject_id &&
      account.subject_id &&
      resolved.session.context.subject_id !== account.subject_id
    ) {
      return reply.code(403).send({
        ok: false,
        error: { message: "This account belongs to a different platform subject context" },
      });
    }
    const nextSession = sessionStore.bindAccount(resolved.token, account);
    return reply.send({ ok: true, session: sanitizePlaygroundSession(nextSession) });
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/logout`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const nextSession = sessionStore.clearAccount(resolved.token);
    return reply.send({ ok: true, session: sanitizePlaygroundSession(nextSession) });
  });

  const sendXmsCatalog = async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    return reply.send({
      ok: true,
      ...(await readCatalogData(resolved.session)),
    });
  };

  fastify.get(`${PLAYGROUND_API_BASE_ROUTE}/app/workspace`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const query = request.query && typeof request.query === "object" ? request.query : {};
    return reply.send(await buildWorkspaceSnapshot(request, resolved.session, query));
  });

  fastify.get(`${PLAYGROUND_API_BASE_ROUTE}/xms-catalog`, sendXmsCatalog);

  fastify.get(`${PLAYGROUND_API_BASE_ROUTE}/state`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const query = request.query && typeof request.query === "object" ? request.query : {};
    const state = await readStateData(resolved.session, query);
    return reply.send({ ok: true, ...state });
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/reference-activate`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    try {
      return reply.send(await runReferenceActivate(resolved.session, body));
    } catch (error) {
      request.log.error(
        {
          module: "creator-club-playground",
          action: "reference_activate_failed",
          xappId: resolved.session.context.xapp_id,
          scopeKind: body.scopeKind,
          offeringId: body.offeringId,
          packageId: body.packageId,
          priceId: body.priceId,
          err: error,
        },
        "creator_club_reference_activate_failed",
      );
      return reply.code(400).send({
        ok: false,
        error: {
          message: error && error.message ? String(error.message) : "Reference activation failed",
        },
      });
    }
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/payment-session`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    try {
      return reply.send(await runCreatePaymentSession(request, resolved.session, body));
    } catch (error) {
      return reply.code(400).send({
        ok: false,
        error: {
          message:
            error && error.message ? String(error.message) : "Payment session creation failed",
        },
      });
    }
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/payment-session/reconcile`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    return reply.send(await runReconcilePaymentSession(resolved.session, body));
  });

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/run-feature`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    try {
      const result = await runFeatureExecution(resolved.session, body);
      return reply.code(result.statusCode).send(result.payload);
    } catch (error) {
      const state = await readStateData(resolved.session, body);
      const execution = evaluateFeatureExecution({
        featureKey: body.featureKey,
        featureDefinitions: state.feature_definitions,
        accessProjection: state.access_projection,
        currentSubscription: state.current_subscription,
      });
      return reply.code(400).send({
        ok: false,
        message: error && error.message ? String(error.message) : "Feature execution failed",
        feature: execution.feature || null,
        ...state,
      });
    }
  });

  fastify.post(
    `${PLAYGROUND_API_BASE_ROUTE}/app/plans/reference-activate`,
    async (request, reply) => {
      const resolved = requirePlaygroundSession(request, reply, sessionStore);
      if (!resolved) return;
      const body = readJsonBody(request);
      try {
        return reply.send(await runReferenceActivate(resolved.session, body));
      } catch (error) {
        return reply.code(400).send({
          ok: false,
          error: {
            message: error && error.message ? String(error.message) : "Plan activation failed",
          },
        });
      }
    },
  );

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/app/plans/payment-session`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    try {
      return reply.send(await runCreatePaymentSession(request, resolved.session, body));
    } catch (error) {
      return reply.code(400).send({
        ok: false,
        error: {
          message: error && error.message ? String(error.message) : "Plan checkout creation failed",
        },
      });
    }
  });

  fastify.post(
    `${PLAYGROUND_API_BASE_ROUTE}/app/plans/payment-session/reconcile`,
    async (request, reply) => {
      const resolved = requirePlaygroundSession(request, reply, sessionStore);
      if (!resolved) return;
      const body = readJsonBody(request);
      return reply.send(await runReconcilePaymentSession(resolved.session, body));
    },
  );

  fastify.post(`${PLAYGROUND_API_BASE_ROUTE}/app/tools/run`, async (request, reply) => {
    const resolved = requirePlaygroundSession(request, reply, sessionStore);
    if (!resolved) return;
    const body = readJsonBody(request);
    try {
      const result = await runFeatureExecution(resolved.session, body);
      return reply.code(result.statusCode).send(result.payload);
    } catch (error) {
      const state = await readStateData(resolved.session, body);
      const execution = evaluateFeatureExecution({
        featureKey: body.featureKey,
        featureDefinitions: state.feature_definitions,
        accessProjection: state.access_projection,
        currentSubscription: state.current_subscription,
      });
      return reply.code(400).send({
        ok: false,
        message: error && error.message ? String(error.message) : "Tool execution failed",
        feature: execution.feature || null,
        ...state,
      });
    }
  });
}
