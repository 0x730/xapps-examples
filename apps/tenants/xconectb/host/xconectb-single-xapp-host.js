import { bootSingleXappHost } from "/host/single-xapp-host.js";
import { renderHostStatus } from "/host/host-status.js";
import {
  applyLocalePreference,
  applyThemePreference,
  readHeaderCollapsedPreference,
  readLocalePreference,
  renderSingleXappShell,
  readStoredJson,
  readThemePreference,
  renderIdentity,
  setHeaderCollapsed,
  setLocaleInUrl,
  toggleHeaderCollapsed,
} from "./xconectb-host-shell.js";
import { resolveXconectbTheme } from "./xconectb-host-runtime.js";

const IDENTITY_STORAGE_KEY = "xconectb_reference_host_identity_v1";

async function main() {
  await bootSingleXappHost({
    entryHref: "/",
    identityStorageKey: IDENTITY_STORAGE_KEY,
    sdkVersionQuery: "?v=20260319-xconectb-host-focus-1",
    applyLocalePreference,
    applyThemePreference,
    readHeaderCollapsedPreference,
    readLocalePreference,
    renderSingleXappShell,
    readStoredJson,
    readThemePreference,
    renderIdentity,
    setHeaderCollapsed,
    setLocaleInUrl,
    toggleHeaderCollapsed,
    resolveTheme: resolveXconectbTheme,
    renderHostStatus: (state) =>
      renderHostStatus({
        ...state,
        stackLabel: "Plain PHP",
        workspaceKey: "xconectb",
      }),
  });
}

main().catch((error) => {
  console.error("[xconectb-host] single-xapp bootstrap failed", error);
  document.body.innerHTML = `
    <div style="padding:2rem;font-family:Trebuchet MS,Segoe UI,sans-serif;color:#1f1613;">
      <h1 style="font-family:Georgia,serif;">XconectB single-xapp bootstrap failed</h1>
      <p style="color:#6b5a53;">${String(error?.message || "Unknown error")}</p>
      <p><a href="/">Return to the entry page</a></p>
    </div>
  `;
});
