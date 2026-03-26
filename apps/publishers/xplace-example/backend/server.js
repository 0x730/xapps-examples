import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublisherWorkspaceApp } from "../../shared/xplace-core/app.js";
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

const xplaceExampleRepo = await createXplaceDb({ databaseUrl: XPLACE_EXAMPLE_DATABASE_URL });
const { dbKind, dbTarget } = xplaceExampleRepo;

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

const XPLACE_EXAMPLE_TOOL_REGISTRY = createXplaceToolRegistry({
  weatherApiBaseUrl: XPLACE_EXAMPLE_WEATHER_API_BASE_URL,
  nowIso,
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
});

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
