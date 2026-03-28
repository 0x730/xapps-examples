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
} from "./xconect-host-shell.js";
import { resolveXconectTheme } from "./xconect-host-runtime.js";

const IDENTITY_STORAGE_KEY = "xconect_reference_host_identity_v1";

async function main() {
  await bootSingleXappHost({
    entryHref: "/",
    identityStorageKey: IDENTITY_STORAGE_KEY,
    sdkVersionQuery: "?v=20260319-xconect-host-focus-3",
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
    resolveTheme: resolveXconectTheme,
    renderHostStatus: (state) =>
      renderHostStatus({
        ...state,
        stackLabel: "Node + Fastify",
        workspaceKey: "xconect",
      }),
  });
}

main().catch((error) => {
  console.error("[xconect-host] single-xapp bootstrap failed", error);
  document.body.innerHTML = `
    <div style="padding:2rem;font-family:Trebuchet MS,Segoe UI,sans-serif;color:#1f1613;">
      <h1 style="font-family:Georgia,serif;">Xconect single-xapp bootstrap failed</h1>
      <p style="color:#6b5a53;">${String(error?.message || "Unknown error")}</p>
      <p><a href="/">Return to the entry page</a></p>
    </div>
  `;
});
