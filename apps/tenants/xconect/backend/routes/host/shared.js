import fs from "node:fs";
import {
  SHARED_BACKEND_BASE_SCRIPT_FILE,
  SHARED_MARKETPLACE_HOST_SCRIPT_FILE,
  SHARED_HOST_STATUS_SCRIPT_FILE,
  SHARED_MARKETPLACE_RUNTIME_SCRIPT_FILE,
  SHARED_HOST_SHELL_SCRIPT_FILE,
  SHARED_SINGLE_XAPP_HOST_SCRIPT_FILE,
  SHARED_REFERENCE_RUNTIME_SCRIPT_FILE,
  TENANT_MARKETPLACE_BASE_CSS_FILE,
  TENANT_MARKETPLACE_ENTRY_CSS_FILE,
  TENANT_MARKETPLACE_ENTRY_FILE,
  TENANT_MARKETPLACE_PAGE_FILE,
  TENANT_MARKETPLACE_PAGE_CSS_FILE,
  TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE,
  TENANT_MARKETPLACE_SHELL_SCRIPT_FILE,
  TENANT_MARKETPLACE_SCRIPT_FILE,
  TENANT_SINGLE_XAPP_PAGE_FILE,
  TENANT_SINGLE_XAPP_SCRIPT_FILE,
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
  "host-shell.js": { type: "js", filePath: SHARED_HOST_SHELL_SCRIPT_FILE },
  "backend-base.js": { type: "js", filePath: SHARED_BACKEND_BASE_SCRIPT_FILE },
  "marketplace-runtime.js": { type: "js", filePath: SHARED_MARKETPLACE_RUNTIME_SCRIPT_FILE },
  "reference-runtime.js": {
    type: "js",
    filePath: SHARED_REFERENCE_RUNTIME_SCRIPT_FILE,
  },
  "marketplace-host.js": {
    type: "js",
    filePath: SHARED_MARKETPLACE_HOST_SCRIPT_FILE,
  },
  "host-status.js": {
    type: "js",
    filePath: SHARED_HOST_STATUS_SCRIPT_FILE,
  },
  "single-xapp-host.js": {
    type: "js",
    filePath: SHARED_SINGLE_XAPP_HOST_SCRIPT_FILE,
  },
  "xconect-host-base.css": { type: "css", filePath: TENANT_MARKETPLACE_BASE_CSS_FILE },
  "xconect-host-entry.css": { type: "css", filePath: TENANT_MARKETPLACE_ENTRY_CSS_FILE },
  "xconect-host-marketplace.css": { type: "css", filePath: TENANT_MARKETPLACE_PAGE_CSS_FILE },
  "xconect-marketplace-host.js": { type: "js", filePath: TENANT_MARKETPLACE_SCRIPT_FILE },
  "xconect-single-xapp-host.js": { type: "js", filePath: TENANT_SINGLE_XAPP_SCRIPT_FILE },
  "xconect-host-shell.js": { type: "js", filePath: TENANT_MARKETPLACE_SHELL_SCRIPT_FILE },
  "xconect-host-runtime.js": { type: "js", filePath: TENANT_MARKETPLACE_RUNTIME_SCRIPT_FILE },
};

export const hostPages = {
  entry: TENANT_MARKETPLACE_ENTRY_FILE,
  marketplace: TENANT_MARKETPLACE_PAGE_FILE,
  singleXapp: TENANT_SINGLE_XAPP_PAGE_FILE,
};
