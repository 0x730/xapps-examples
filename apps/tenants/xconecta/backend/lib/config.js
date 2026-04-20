import { createHash } from "node:crypto";
import dotenv from "dotenv";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

function firstExistingPath(candidates, fallback) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return fallback;
}

function parseEnvJsonRecord(raw) {
  const value = String(raw || "").trim();
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const explicitEnvPath = process.env.XCONECTA_ENV_FILE || process.env.ENV_FILE;
if (explicitEnvPath) dotenv.config({ path: explicitEnvPath });
const envLocalPath = path.join(backendDir, ".env.dev");
const envPath = fs.existsSync(envLocalPath) ? envLocalPath : path.join(backendDir, ".env");
dotenv.config({ path: envPath });
const hostStateScope = createHash("sha1").update(backendDir).digest("hex").slice(0, 12);
const hostStateDir = path.resolve(
  process.env.XCONECTA_HOST_STATE_DIR ||
    path.join(os.tmpdir(), "xapps", `xconecta-host-state-${hostStateScope}`),
);

export const PORT = Number(process.env.XCONECTA_PORT || 3314);

export const GUARD_INGEST_API_KEY = String(
  process.env.XCONECTA_GUARD_INGEST_API_KEY || "xconecta-tenant-guard-dev-key",
);

export const TENANT_PAYMENT_URL = String(
  process.env.XCONECTA_TENANT_PAYMENT_URL || "http://localhost:3314/tenant-payment.html",
)
  .trim()
  .replace(/\/+$/, "");

export const TENANT_PAYMENT_RETURN_SECRET = String(
  process.env.XCONECTA_TENANT_PAYMENT_RETURN_SECRET || "",
).trim();

export const TENANT_PAYMENT_RETURN_SECRET_REF = String(
  process.env.XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF || "",
).trim();

export const TENANT_PAYMENT_RETURN_URL_ALLOWLIST = String(
  process.env.XCONECTA_TENANT_PAYMENT_RETURN_URL_ALLOWLIST ||
    "http://localhost:3314,http://127.0.0.1:3314",
).trim();

export const ALLOWED_ORIGINS = String(process.env.XCONECTA_ALLOWED_ORIGINS || "").trim();
export const HOST_BOOTSTRAP_API_KEYS = String(
  process.env.XCONECTA_HOST_BOOTSTRAP_API_KEYS || "",
).trim();
export const HOST_BOOTSTRAP_SIGNING_SECRET = String(
  process.env.XCONECTA_HOST_BOOTSTRAP_SIGNING_SECRET || "",
).trim();
export const HOST_BOOTSTRAP_SIGNING_KEY_ID = String(
  process.env.XCONECTA_HOST_BOOTSTRAP_SIGNING_KEY_ID || "",
).trim();
export const HOST_BOOTSTRAP_VERIFIER_KEYS = parseEnvJsonRecord(
  process.env.XCONECTA_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON ||
    process.env.XCONECTA_HOST_BOOTSTRAP_VERIFIER_KEYS ||
    "",
);
export const HOST_SESSION_SIGNING_SECRET = String(
  process.env.XCONECTA_HOST_SESSION_SIGNING_SECRET || "",
).trim();
export const HOST_SESSION_SIGNING_KEY_ID = String(
  process.env.XCONECTA_HOST_SESSION_SIGNING_KEY_ID || "",
).trim();
export const HOST_SESSION_VERIFIER_KEYS = parseEnvJsonRecord(
  process.env.XCONECTA_HOST_SESSION_VERIFIER_KEYS_JSON ||
    process.env.XCONECTA_HOST_SESSION_VERIFIER_KEYS ||
    "",
);
export const HOST_BOOTSTRAP_REPLAY_FILE = path.resolve(hostStateDir, "host-bootstrap-replay.json");
export const HOST_SESSION_REVOCATIONS_FILE = path.resolve(
  hostStateDir,
  "host-session-revocations.json",
);
export const HOST_SESSION_STATE_FILE = path.resolve(hostStateDir, "host-session-state.json");

export const GATEWAY_URL = String(
  process.env.XAPPS_GATEWAY_URL || process.env.GATEWAY_BASE_URL || "http://localhost:3000",
).trim();

export const GATEWAY_API_KEY = String(
  process.env.XCONECTA_GATEWAY_API_KEY ||
    process.env.XCONECTA_TENANT_API_KEY ||
    process.env.XAPPS_API_KEY ||
    "",
).trim();

export const TENANT_PAYMENT_PAGE_FILE = path.resolve(backendDir, "../host/tenant-payment.html");
export const TENANT_MARKETPLACE_ENTRY_FILE = path.resolve(backendDir, "../host/index.html");
export const TENANT_MARKETPLACE_PAGE_FILE = path.resolve(backendDir, "../host/marketplace.html");
export const TENANT_SINGLE_XAPP_PAGE_FILE = path.resolve(backendDir, "../host/single-xapp.html");
export const TENANT_MARKETPLACE_SHELL_SCRIPT_FILE = path.resolve(
  backendDir,
  "../host/xconecta-host-shell.js",
);
export const TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE = path.resolve(
  backendDir,
  "../host/xconecta-host-runtime.js",
);
export const TENANT_REFERENCE_CONFIG_SCRIPT_FILE = path.resolve(
  backendDir,
  "../host/xconecta-reference-config.js",
);
export const TENANT_MARKETPLACE_BASE_CSS_FILE = path.resolve(
  backendDir,
  "../host/xconecta-host-base.css",
);
export const TENANT_MARKETPLACE_ENTRY_CSS_FILE = path.resolve(
  backendDir,
  "../host/xconecta-host-entry.css",
);
export const TENANT_MARKETPLACE_PAGE_CSS_FILE = path.resolve(
  backendDir,
  "../host/xconecta-host-marketplace.css",
);
const SHARED_BROWSER_HOST_DIST_DIR = firstExistingPath(
  [
    path.resolve(backendDir, "../../../../packages/browser-host/dist"),
    path.resolve(backendDir, "../../../../node_modules/@xapps-platform/browser-host/dist"),
  ],
  path.resolve(backendDir, "../../../../packages/browser-host/dist"),
);
const REFERENCE_HOST_COMMON_DIR = path.resolve(
  backendDir,
  "../../../../apps/tenants/reference-host-common/host",
);
export const SHARED_LAUNCHER_CORE_SCRIPT_FILE = path.resolve(
  SHARED_BROWSER_HOST_DIST_DIR,
  "launcher-core.js",
);
export const SHARED_EMBED_SURFACE_SCRIPT_FILE = path.resolve(
  SHARED_BROWSER_HOST_DIST_DIR,
  "embed-surface.js",
);
export const SHARED_STANDARD_RUNTIME_SCRIPT_FILE = path.resolve(
  SHARED_BROWSER_HOST_DIST_DIR,
  "standard-runtime.js",
);
export const SHARED_MARKETPLACE_RUNTIME_SCRIPT_FILE = path.resolve(
  SHARED_BROWSER_HOST_DIST_DIR,
  "marketplace-runtime.js",
);
export const SHARED_BACKEND_BASE_SCRIPT_FILE = path.resolve(
  SHARED_BROWSER_HOST_DIST_DIR,
  "backend-base.js",
);
export const REFERENCE_HOST_PAGE_UTILS_SCRIPT_FILE = path.resolve(
  REFERENCE_HOST_COMMON_DIR,
  "page-utils.js",
);
export const REFERENCE_HOST_SHELL_CORE_SCRIPT_FILE = path.resolve(
  REFERENCE_HOST_COMMON_DIR,
  "host-shell-core.js",
);
export const SHARED_REFERENCE_LAUNCHER_PAGE_SCRIPT_FILE = path.resolve(
  REFERENCE_HOST_COMMON_DIR,
  "reference-launcher-page.js",
);
export const SHARED_REFERENCE_MARKETPLACE_PAGE_SCRIPT_FILE = path.resolve(
  REFERENCE_HOST_COMMON_DIR,
  "reference-marketplace-page.js",
);
export const SHARED_REFERENCE_SINGLE_XAPP_PAGE_SCRIPT_FILE = path.resolve(
  REFERENCE_HOST_COMMON_DIR,
  "reference-single-xapp-page.js",
);
export const EMBED_SDK_ESM_CANDIDATE_FILES = [
  path.resolve(backendDir, "../../../../dist/sdk/xapps-embed-sdk.esm.js"),
  path.resolve(backendDir, "../../../../node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js"),
  path.resolve(
    backendDir,
    "../../../../node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js",
  ),
];
export const TENANT_SEED_LOGO_FILE = path.resolve(backendDir, "public/xconecta-seed-logo.svg");
