import { bootMarketplaceHost } from "/host/marketplace-host.js";
import { renderHostStatus } from "/host/host-status.js";
import { readProofIdentity, refreshProofIdentity } from "/host/proof-identity.js";
import {
  applyLocalePreference,
  applyThemePreference,
  readHeaderCollapsedPreference,
  readLocalePreference,
  readModeFromUrl,
  readThemePreference,
  renderIdentity,
  renderMode,
  renderModeShell,
  setHeaderCollapsed,
  setLocaleInUrl,
  setModeInUrl,
  toggleHeaderCollapsed,
} from "./xconectb-host-shell.js";
import { createXconectbMarketplaceRuntime } from "./xconectb-host-runtime.js";

const IDENTITY_STORAGE_KEY = "xconectb_reference_host_identity_v1";

async function main() {
  await bootMarketplaceHost({
    entryHref: "/",
    identityStorageKey: IDENTITY_STORAGE_KEY,
    sdkVersionQuery: "?v=20260319-xconectb-host-focus-1",
    applyLocalePreference,
    applyThemePreference,
    readHeaderCollapsedPreference,
    readLocalePreference,
    readModeFromUrl,
    readStoredJson: () => readProofIdentity(IDENTITY_STORAGE_KEY),
    refreshStoredJson: () => refreshProofIdentity(IDENTITY_STORAGE_KEY),
    readThemePreference,
    renderIdentity,
    renderMode,
    renderModeShell,
    setHeaderCollapsed,
    setLocaleInUrl,
    setModeInUrl,
    toggleHeaderCollapsed,
    createMarketplaceRuntime: createXconectbMarketplaceRuntime,
    renderHostStatus: (state) =>
      renderHostStatus({
        ...state,
        stackLabel: "Plain PHP",
        workspaceKey: "xconectb",
      }),
  });
}

main().catch((error) => {
  console.error("[xconectb-host] marketplace bootstrap failed", error);
  document.body.innerHTML = `
    <div style="padding:2rem;font-family:Trebuchet MS,Segoe UI,sans-serif;color:#1f1613;">
      <h1 style="font-family:Georgia,serif;">XconectB host bootstrap failed</h1>
      <p style="color:#6b5a53;">${String(error?.message || "Unknown error")}</p>
      <p><a href="/">Return to the entry page</a></p>
    </div>
  `;
});
