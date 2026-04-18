import { mountSingleXappEmbed } from "/host/embed-surface.js";
import {
  importBrowserAssetModule,
  normalizeLocaleTag,
  readOptionalString,
  renderPageFailure,
  setText,
} from "/host/page-utils.js";
import { readStoredHostIdentity, refreshStoredHostIdentity } from "/host/launcher-core.js";

let controller = null;

async function refreshProofIdentity(identityStorageKey, hostBootstrapUrl) {
  return refreshStoredHostIdentity(identityStorageKey, hostBootstrapUrl);
}

async function mountCurrentXapp(runtime) {
  const input = document.getElementById("xappId");
  const xappId = input instanceof HTMLInputElement ? readOptionalString(input.value) : "";
  const themeKey = runtime.applyThemePreference(runtime.readThemePreference(), { persist: false });
  const locale = runtime.readLocalePreference();
  runtime.renderSingleXappShell();
  controller?.destroy?.();
  controller = await mountSingleXappEmbed({
    backendBaseUrl: runtime.BACKEND_BASE_URL,
    entryHref: runtime.ENTRY_HREF || "/",
    identityStorageKey: runtime.IDENTITY_STORAGE_KEY,
    hostBootstrapUrl: runtime.HOST_BOOTSTRAP_URL,
    sdkPath: runtime.SDK_PATH,
    container: document.getElementById("catalog"),
    xappId,
    locale,
    themeKey,
    identity: readStoredHostIdentity(runtime.IDENTITY_STORAGE_KEY),
    refreshIdentity: (storageKey) => refreshProofIdentity(storageKey, runtime.HOST_BOOTSTRAP_URL),
    resolveTheme: runtime.resolveProofTheme,
    onSessionExpired: () =>
      runtime.renderSessionExpiredShell({
        title: "Session expired",
        message: "The hosted tenant session could not be renewed. Start again from the launcher.",
        backHref: runtime.ENTRY_HREF || "/",
      }),
  });
  runtime.renderIdentity(controller.getIdentity());
}

async function main() {
  const proofConfig = await importBrowserAssetModule("/host/proof-config.js");
  const proofShell = await importBrowserAssetModule("/host/proof-shell.js");
  const proofRuntime = await importBrowserAssetModule("/host/proof-runtime.js");
  const runtime = {
    ...proofConfig,
    ...proofShell,
    ...proofRuntime,
  };

  setText("host-proof-name", runtime.PROOF_NAME);
  setText("host-proof-workspace", runtime.WORKSPACE_KEY);
  setText("host-proof-stack", runtime.STACK_LABEL);
  runtime.setHeaderCollapsed(runtime.readHeaderCollapsedPreference());
  document.getElementById("host-theme-select")?.addEventListener("change", (event) => {
    const target = event.target;
    runtime.applyThemePreference(readOptionalString(target?.value));
    window.location.reload();
  });
  const localeSelect = document.getElementById("host-locale-select");
  if (localeSelect instanceof HTMLSelectElement) {
    const initialLocale = runtime.applyLocalePreference(runtime.readLocalePreference(), {
      persist: false,
    });
    localeSelect.value = normalizeLocaleTag(initialLocale);
    localeSelect.addEventListener("change", () => {
      const nextLocale = runtime.applyLocalePreference(localeSelect.value);
      runtime.setLocaleInUrl(nextLocale);
      controller?.setLocale?.(nextLocale);
    });
  }
  document.getElementById("host-header-toggle")?.addEventListener("click", () => {
    runtime.toggleHeaderCollapsed();
  });
  document.getElementById("loadXapp")?.addEventListener("click", () => {
    void mountCurrentXapp(runtime);
  });
  window.addEventListener("beforeunload", () => {
    controller?.destroy?.();
  });
  await mountCurrentXapp(runtime);
}

main().catch((error) => {
  console.error("[host-proof] single-xapp bootstrap failed", error);
  renderPageFailure({
    title: "Hosted tenant single-xapp bootstrap failed",
    message: String(error?.message || "Unknown error"),
    backHref: "/",
  });
});
