import { mountCatalogEmbed } from "/host/embed-surface.js";
import {
  importBrowserAssetModule,
  normalizeLocaleTag,
  renderPageFailure,
  setText,
} from "/host/page-utils.js";
import { readRecoverableHostIdentity, refreshStoredHostIdentity } from "/host/launcher-core.js";

let controller = null;

async function refreshProofIdentity(identityStorageKey, hostBootstrapUrl) {
  return refreshStoredHostIdentity(identityStorageKey, hostBootstrapUrl);
}

async function mount(mode, runtime) {
  const resolvedMode = mode === "split-panel" ? "split-panel" : "single-panel";
  const themeKey = runtime.applyThemePreference(runtime.readThemePreference(), { persist: false });
  const identity = readRecoverableHostIdentity(runtime.IDENTITY_STORAGE_KEY);
  runtime.renderMode(resolvedMode);
  runtime.renderModeShell(resolvedMode);
  runtime.setModeInUrl(resolvedMode);
  controller?.destroy?.();
  controller = await mountCatalogEmbed({
    backendBaseUrl: runtime.BACKEND_BASE_URL,
    entryHref: runtime.ENTRY_HREF || "/",
    identityStorageKey: runtime.IDENTITY_STORAGE_KEY,
    hostBootstrapUrl: runtime.HOST_BOOTSTRAP_URL,
    sdkPath: runtime.SDK_PATH,
    container: document.getElementById("catalog"),
    widgetContainer: document.getElementById("widget"),
    mode: resolvedMode,
    themeKey,
    locale: runtime.readLocalePreference(),
    ...(identity ? { identity } : {}),
    refreshIdentity: (storageKey) => refreshProofIdentity(storageKey, runtime.HOST_BOOTSTRAP_URL),
    createMarketplaceRuntime: runtime.createProofMarketplaceRuntime,
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
  document.querySelectorAll(".mode-btn").forEach((node) => {
    node.addEventListener("click", () => {
      const nextMode = readOptionalString(node.dataset.mode);
      void mount(nextMode, runtime);
    });
  });
  document.getElementById("host-header-toggle")?.addEventListener("click", () => {
    runtime.toggleHeaderCollapsed();
  });
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
  window.addEventListener("beforeunload", () => {
    controller?.destroy?.();
  });
  await mount(runtime.readModeFromUrl(), runtime);
}

main().catch((error) => {
  console.error("[host-proof] marketplace bootstrap failed", error);
  renderPageFailure({
    title: "Hosted tenant bootstrap failed",
    message: String(error?.message || "Unknown error"),
    backHref: "/",
  });
});
