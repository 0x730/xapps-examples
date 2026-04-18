import fs from "node:fs";
import {
  SHARED_BACKEND_BASE_SCRIPT_FILE,
  SHARED_EMBED_SURFACE_SCRIPT_FILE,
  SHARED_LAUNCHER_CORE_SCRIPT_FILE,
  SHARED_MARKETPLACE_RUNTIME_SCRIPT_FILE,
  SHARED_STANDARD_RUNTIME_SCRIPT_FILE,
  REFERENCE_HOST_PAGE_UTILS_SCRIPT_FILE,
  REFERENCE_HOST_SHELL_CORE_SCRIPT_FILE,
  SHARED_REFERENCE_LAUNCHER_PAGE_SCRIPT_FILE,
  SHARED_REFERENCE_MARKETPLACE_PAGE_SCRIPT_FILE,
  SHARED_REFERENCE_SINGLE_XAPP_PAGE_SCRIPT_FILE,
  TENANT_MARKETPLACE_BASE_CSS_FILE,
  TENANT_MARKETPLACE_ENTRY_CSS_FILE,
  TENANT_MARKETPLACE_ENTRY_FILE,
  TENANT_MARKETPLACE_PAGE_FILE,
  TENANT_MARKETPLACE_PAGE_CSS_FILE,
  TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE,
  TENANT_MARKETPLACE_SHELL_SCRIPT_FILE,
  TENANT_REFERENCE_CONFIG_SCRIPT_FILE,
  TENANT_SINGLE_XAPP_PAGE_FILE,
} from "../../lib/config.js";
import { applyNoStoreHeaders } from "@xapps-platform/backend-kit/backend/routes/gateway/shared";

export function sendHtmlFile(reply, filePath, hostProxyService = null) {
  return applyNoStoreHeaders(reply, hostProxyService)
    .code(200)
    .type("text/html; charset=utf-8")
    .send(fs.readFileSync(filePath, "utf8"));
}

export function sendJsFile(reply, filePath, hostProxyService = null) {
  return applyNoStoreHeaders(reply, hostProxyService)
    .code(200)
    .type("application/javascript; charset=utf-8")
    .send(fs.readFileSync(filePath, "utf8"));
}

export function sendCssFile(reply, filePath, hostProxyService = null) {
  return applyNoStoreHeaders(reply, hostProxyService)
    .code(200)
    .type("text/css; charset=utf-8")
    .send(fs.readFileSync(filePath, "utf8"));
}

export const hostAssets = {
  "host-shell-core.js": { type: "js", filePath: REFERENCE_HOST_SHELL_CORE_SCRIPT_FILE },
  "launcher-core.js": { type: "js", filePath: SHARED_LAUNCHER_CORE_SCRIPT_FILE },
  "embed-surface.js": { type: "js", filePath: SHARED_EMBED_SURFACE_SCRIPT_FILE },
  "page-utils.js": { type: "js", filePath: REFERENCE_HOST_PAGE_UTILS_SCRIPT_FILE },
  "standard-runtime.js": { type: "js", filePath: SHARED_STANDARD_RUNTIME_SCRIPT_FILE },
  "marketplace-runtime.js": { type: "js", filePath: SHARED_MARKETPLACE_RUNTIME_SCRIPT_FILE },
  "backend-base.js": { type: "js", filePath: SHARED_BACKEND_BASE_SCRIPT_FILE },
  "reference-runtime.js": {
    type: "js",
    filePath: TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE,
  },
  "reference-launcher-page.js": {
    type: "js",
    filePath: SHARED_REFERENCE_LAUNCHER_PAGE_SCRIPT_FILE,
  },
  "reference-marketplace-page.js": {
    type: "js",
    filePath: SHARED_REFERENCE_MARKETPLACE_PAGE_SCRIPT_FILE,
  },
  "reference-single-xapp-page.js": {
    type: "js",
    filePath: SHARED_REFERENCE_SINGLE_XAPP_PAGE_SCRIPT_FILE,
  },
  "reference-shell.js": { type: "js", filePath: TENANT_MARKETPLACE_SHELL_SCRIPT_FILE },
  "reference-config.js": { type: "js", filePath: TENANT_REFERENCE_CONFIG_SCRIPT_FILE },
  "xconecta-host-base.css": { type: "css", filePath: TENANT_MARKETPLACE_BASE_CSS_FILE },
  "xconecta-host-entry.css": { type: "css", filePath: TENANT_MARKETPLACE_ENTRY_CSS_FILE },
  "xconecta-host-marketplace.css": { type: "css", filePath: TENANT_MARKETPLACE_PAGE_CSS_FILE },
  "xconecta-marketplace-host.js": {
    type: "js",
    filePath: SHARED_REFERENCE_MARKETPLACE_PAGE_SCRIPT_FILE,
  },
  "xconecta-single-xapp-host.js": {
    type: "js",
    filePath: SHARED_REFERENCE_SINGLE_XAPP_PAGE_SCRIPT_FILE,
  },
  "xconecta-host-shell.js": { type: "js", filePath: TENANT_MARKETPLACE_SHELL_SCRIPT_FILE },
  "xconecta-host-runtime.js": { type: "js", filePath: TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE },
};

export const hostPages = {
  entry: TENANT_MARKETPLACE_ENTRY_FILE,
  marketplace: TENANT_MARKETPLACE_PAGE_FILE,
  singleXapp: TENANT_SINGLE_XAPP_PAGE_FILE,
};
