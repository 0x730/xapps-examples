import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGatewayApiClient } from "../../../../packages/server-sdk/dist/index.js";
import {
  isBootstrapOriginAllowed,
  normalizeOrigin,
  parseAllowedOrigins,
} from "./bootstrapOriginPolicy.js";
import { createPublisherWorkspaceApp } from "../../shared/xplace-core/app.js";
import {
  createInMemoryPublisherSessionBridgeStore,
  registerPublisherSessionBridgeRoutes,
} from "../../shared/publisherSessionBridge.js";
import { createXplaceDb } from "../../shared/xplace-core/repo.js";
import { nowIso } from "../../shared/xplace-core/runtime.js";
import {
  createDemoPublisherSubjectProfiles,
  createPublisherSubjectProfilesEnvelopeBuilder,
} from "../../shared/xplace-core/subjectProfiles.js";
import {
  createXplacePreviewRegistry,
  createXplaceToolRegistry,
  listWorkspaceTools,
} from "../../shared/xplace-core/tools.js";
import { createPlaygroundAccountsRepo } from "./playground/accountsRepo.js";
import { registerMonetizationPlaygroundRoutes } from "./playground/routes.js";
import { createPlaygroundSessionStore } from "./playground/sessionStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const explicitEnvPath = process.env.XPLACE_EXAMPLE_ENV_FILE || process.env.ENV_FILE;
if (explicitEnvPath) {
  dotenv.config({ path: explicitEnvPath });
}
const envLocalPath = path.join(__dirname, ".env.local");
const envPath = fs.existsSync(envLocalPath) ? envLocalPath : path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const PORT = Number(process.env.XPLACE_EXAMPLE_PORT || 3016);
const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL || "http://localhost:3000";
const XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY = String(
  process.env.XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY ||
    process.env.XPLACE_EXAMPLE_API_KEY ||
    "xplace-example-dev-api-key",
);
const XPLACE_EXAMPLE_XAPP_INGEST_API_KEY = String(
  process.env.XPLACE_EXAMPLE_XAPP_INGEST_API_KEY || XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY,
);
const XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY = String(
  process.env.XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY || "",
).trim();
const XPLACE_EXAMPLE_ADMIN_KEY = String(
  process.env.XPLACE_EXAMPLE_ADMIN_KEY || "xplace-example-dev-admin-key",
);
const XPLACE_EXAMPLE_WEATHER_API_BASE_URL = String(
  process.env.XPLACE_EXAMPLE_WEATHER_API_BASE_URL || "https://api.open-meteo.com",
)
  .trim()
  .replace(/\/+$/, "");
const XPLACE_EXAMPLE_ANAF_API_BASE_URL = String(
  process.env.XPLACE_EXAMPLE_ANAF_API_BASE_URL || "https://webservicesp.anaf.ro",
)
  .trim()
  .replace(/\/+$/, "");
const XPLACE_EXAMPLE_DATABASE_URL = String(
  process.env.XPLACE_EXAMPLE_DATABASE_URL ||
    "postgresql:///xplace_example?host=/var/run/postgresql",
).trim();
const XPLACE_EXAMPLE_PUBLISHER_ID = String(process.env.XPLACE_EXAMPLE_PUBLISHER_ID || "").trim();
const XPLACE_EXAMPLE_BRIDGE_SESSION_TTL_SECONDS = Number(
  process.env.XPLACE_EXAMPLE_BRIDGE_SESSION_TTL_SECONDS || 3600,
);
const XPLACE_EXAMPLE_PLAYGROUND_SESSION_TTL_SECONDS = Number(
  process.env.XPLACE_EXAMPLE_PLAYGROUND_SESSION_TTL_SECONDS || 4 * 60 * 60,
);
const XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS = parseAllowedOrigins(
  process.env.XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS,
);
const XPLACE_EXAMPLE_PORTAL_BASE_URL = String(
  process.env.XPLACE_EXAMPLE_PORTAL_BASE_URL || "http://localhost:5177/apps/portal",
).trim();
const XPLACE_EXAMPLE_PUBLISHER_BASE_URL = String(
  process.env.XPLACE_EXAMPLE_PUBLISHER_BASE_URL || "http://localhost:5176/apps/publisher",
).trim();

const xplaceExampleRepo = await createXplaceDb({ databaseUrl: XPLACE_EXAMPLE_DATABASE_URL });
const xplaceExamplePlaygroundAccountsRepo = await createPlaygroundAccountsRepo({
  databaseUrl: XPLACE_EXAMPLE_DATABASE_URL,
});
const xplaceExamplePlaygroundSessions = createPlaygroundSessionStore({
  sessionTtlSeconds: XPLACE_EXAMPLE_PLAYGROUND_SESSION_TTL_SECONDS,
});
const { dbKind, dbTarget } = xplaceExampleRepo;
const backendAssets = [
  {
    routePath: "/widgets/widget-sdk.js",
    filePath: path.join(__dirname, "../../../../packages/widget-sdk/dist/index.js"),
    contentType: "application/javascript; charset=utf-8",
  },
  {
    routePath: "/widgets/xplace-certs-gateway-stripe-publisher-rendered.html",
    filePath: path.join(__dirname, "assets/xplace-certs-gateway-stripe-publisher-rendered.html"),
    contentType: "text/html; charset=utf-8",
  },
  {
    routePath: "/widgets/xplace-bridge-session-publisher-rendered.html",
    filePath: path.join(__dirname, "assets/xplace-bridge-session-publisher-rendered.html"),
    contentType: "text/html; charset=utf-8",
  },
  {
    routePath: "/widgets/xplace-creator-club-publisher-rendered.html",
    filePath: path.join(__dirname, "assets/xplace-creator-club-publisher-rendered.html"),
    contentType: "text/html; charset=utf-8",
  },
];

function requireApiKey(request, reply) {
  const key = String(request.headers["x-xplace-api-key"] || "").trim();
  if (!key || key !== XPLACE_EXAMPLE_XAPP_INGEST_API_KEY) {
    reply.code(401).send({ status: "error", result: { message: "Invalid API key" } });
    return false;
  }
  return true;
}

function requireAdminKey(request, reply) {
  const key = String(request.headers["x-xplace-admin-key"] || "").trim();
  if (!key || key !== XPLACE_EXAMPLE_ADMIN_KEY) {
    reply.code(401).send({ ok: false, error: { message: "Invalid admin key" } });
    return false;
  }
  return true;
}

function rejectDisallowedBootstrapOrigin(reply, hostOrigin) {
  if (!isBootstrapOriginAllowed(hostOrigin, XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS)) {
    return reply.code(403).send({
      ok: false,
      error: {
        code: "HOST_ORIGIN_NOT_ALLOWED",
        message: "Host origin is not allowed for widget bootstrap verification",
      },
    });
  }
  return null;
}

const XPLACE_EXAMPLE_TOOL_REGISTRY = createXplaceToolRegistry({
  weatherApiBaseUrl: XPLACE_EXAMPLE_WEATHER_API_BASE_URL,
  nowIso,
  gatewayBaseUrl: GATEWAY_BASE_URL,
  gatewayClientApiKey: XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY,
});
const XPLACE_EXAMPLE_PREVIEW_REGISTRY = createXplacePreviewRegistry({
  weatherApiBaseUrl: XPLACE_EXAMPLE_WEATHER_API_BASE_URL,
  anafApiBaseUrl: XPLACE_EXAMPLE_ANAF_API_BASE_URL,
  nowIso,
});
const buildPublisherSubjectProfilesEnvelope = createPublisherSubjectProfilesEnvelopeBuilder({
  workspaceName: "xplace-example",
  profiles: createDemoPublisherSubjectProfiles({
    workspaceName: "xplace-example",
    displayPrefix: "Xplace Example Demo",
  }),
});

const fastify = createPublisherWorkspaceApp({
  serviceName: "xplace-example",
  repo: xplaceExampleRepo,
  dbKind,
  gatewayBaseUrl: GATEWAY_BASE_URL,
  toolRegistry: XPLACE_EXAMPLE_TOOL_REGISTRY,
  previewRegistry: XPLACE_EXAMPLE_PREVIEW_REGISTRY,
  listWorkspaceTools,
  requireApiKey,
  requireAdminKey,
  buildPublisherSubjectProfilesEnvelope,
  assets: backendAssets,
});

await registerPublisherSessionBridgeRoutes(fastify, {
  store: createInMemoryPublisherSessionBridgeStore(),
  sessionTtlSeconds: XPLACE_EXAMPLE_BRIDGE_SESSION_TTL_SECONDS,
});

await registerMonetizationPlaygroundRoutes(fastify, {
  gatewayBaseUrl: GATEWAY_BASE_URL,
  gatewayClientApiKey: XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY,
  publisherGatewayApiKey: XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY,
  sessionStore: xplaceExamplePlaygroundSessions,
  accountsRepo: xplaceExamplePlaygroundAccountsRepo,
  portalBaseUrl: XPLACE_EXAMPLE_PORTAL_BASE_URL,
  publisherBaseUrl: XPLACE_EXAMPLE_PUBLISHER_BASE_URL,
  widgetAllowedOrigins: XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS,
});

fastify.post(
  "/widgets/xplace-certs-gateway-stripe-publisher-rendered/bootstrap-verify",
  async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const token = String(body.token || "").trim();
    const bootstrapTicket = String(body.bootstrapTicket || body.bootstrap_ticket || "").trim();
    const hostOrigin = normalizeOrigin(body.hostOrigin);
    const installationId = String(body.installationId || "").trim();
    const bindToolName = String(body.bindToolName || "").trim();
    const subjectId = String(body.subjectId || "").trim();
    const clientId = String(body.clientId || "").trim();
    const xappId = String(body.xappId || "").trim();

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
        error: {
          code: "HOST_ORIGIN_REQUIRED",
          message: "Host origin is required to verify browser widget context",
        },
      });
    }

    const blockedOriginReply = rejectDisallowedBootstrapOrigin(reply, hostOrigin);
    if (blockedOriginReply) return blockedOriginReply;

    let verified;
    try {
      verified = await createGatewayApiClient({
        baseUrl: GATEWAY_BASE_URL,
        token,
        fetchImpl: globalThis.fetch,
      }).verifyBrowserWidgetContext({
        hostOrigin,
        bootstrapTicket: bootstrapTicket || null,
        installationId: installationId || null,
        bindToolName: bindToolName || null,
        subjectId: subjectId || null,
      });
    } catch (error) {
      request.log.warn({ err: error }, "xplace-example bootstrap verify gateway call failed");
      return reply.code(502).send({
        ok: false,
        error: {
          code: "GATEWAY_UNREACHABLE",
          message: "Could not verify widget context with the gateway",
        },
      });
    }

    return reply.send({
      ok: true,
      verified: true,
      checkedAt: nowIso(),
      context: {
        installationId: installationId || null,
        clientId: clientId || null,
        xappId: xappId || null,
        subjectId: subjectId || null,
        bindToolName: bindToolName || null,
        hostOrigin,
      },
      publisherId: XPLACE_EXAMPLE_PUBLISHER_ID || null,
      latestRequestId: String(verified?.latestRequestId || "").trim() || null,
    });
  },
);

fastify.post(
  "/widgets/xplace-bridge-session-publisher-rendered/bootstrap-verify",
  async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const token = String(body.token || "").trim();
    const bootstrapTicket = String(body.bootstrapTicket || body.bootstrap_ticket || "").trim();
    const hostOrigin = normalizeOrigin(body.hostOrigin);
    const installationId = String(body.installationId || "").trim();
    const subjectId = String(body.subjectId || "").trim();

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
        error: {
          code: "HOST_ORIGIN_REQUIRED",
          message: "Host origin is required to verify browser widget context",
        },
      });
    }

    const blockedOriginReply = rejectDisallowedBootstrapOrigin(reply, hostOrigin);
    if (blockedOriginReply) return blockedOriginReply;

    let verified;
    try {
      verified = await createGatewayApiClient({
        baseUrl: GATEWAY_BASE_URL,
        token,
        fetchImpl: globalThis.fetch,
      }).verifyBrowserWidgetContext({
        hostOrigin,
        bootstrapTicket: bootstrapTicket || null,
        installationId: installationId || null,
        subjectId: subjectId || null,
      });
    } catch (error) {
      request.log.warn(
        { err: error },
        "xplace-example bridge bootstrap verify gateway call failed",
      );
      return reply.code(502).send({
        ok: false,
        error: {
          code: "GATEWAY_UNREACHABLE",
          message: "Could not verify widget context with the gateway",
        },
      });
    }

    return reply.send({
      ok: true,
      verified: true,
      checkedAt: nowIso(),
      publisherId: XPLACE_EXAMPLE_PUBLISHER_ID || null,
      context: {
        installationId: installationId || null,
        subjectId: subjectId || null,
        hostOrigin,
      },
      latestRequestId: String(verified?.latestRequestId || "").trim() || null,
    });
  },
);

fastify.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  fastify.log.info(
    {
      port: PORT,
      db: dbKind,
      dbTarget,
      tools: listWorkspaceTools(XPLACE_EXAMPLE_TOOL_REGISTRY),
    },
    "xplace-example public publisher reference listening",
  );
});
