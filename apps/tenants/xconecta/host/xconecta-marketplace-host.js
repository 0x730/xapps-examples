import { bootMarketplaceHost } from "/host/marketplace-host.js";
import { renderHostStatus } from "/host/host-status.js";
import {
  applyLocalePreference,
  applyThemePreference,
  readHeaderCollapsedPreference,
  readLocalePreference,
  readModeFromUrl,
  readStoredJson,
  readThemePreference,
  renderIdentity,
  renderMode,
  renderModeShell,
  setHeaderCollapsed,
  setLocaleInUrl,
  setModeInUrl,
  toggleHeaderCollapsed,
} from "./xconecta-host-shell.js";
import { createXconectMarketplaceRuntime } from "./xconecta-host-runtime.js";

const IDENTITY_STORAGE_KEY = "xconecta_reference_host_identity_v1";

async function main() {
  await bootMarketplaceHost({
    entryHref: "/",
    identityStorageKey: IDENTITY_STORAGE_KEY,
    sdkVersionQuery: "?v=20260319-xconecta-host-focus-3",
    applyLocalePreference,
    applyThemePreference,
    readHeaderCollapsedPreference,
    readLocalePreference,
    readModeFromUrl,
    readStoredJson,
    readThemePreference,
    renderIdentity,
    renderMode,
    renderModeShell,
    setHeaderCollapsed,
    setLocaleInUrl,
    setModeInUrl,
    toggleHeaderCollapsed,
    createMarketplaceRuntime: createXconectMarketplaceRuntime,
    renderHostStatus: (state) =>
      renderHostStatus({
        ...state,
        stackLabel: "Node + Fastify",
        workspaceKey: "xconecta",
      }),
  });
}

main().catch((error) => {
  console.error("[xconecta-host] marketplace bootstrap failed", error);
  document.body.innerHTML = `
    <div style="padding:2rem;font-family:Trebuchet MS,Segoe UI,sans-serif;color:#1f1613;">
      <h1 style="font-family:Georgia,serif;">Xconect A host bootstrap failed</h1>
      <p style="color:#6b5a53;">${String(error?.message || "Unknown error")}</p>
      <p><a href="/">Return to the entry page</a></p>
    </div>
  `;
});
