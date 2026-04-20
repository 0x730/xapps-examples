import { mountCatalogEmbed } from "/host/embed-surface.js";
import { importBrowserAssetModule, renderPageFailure } from "/host/page-utils.js";
import { readRecoverableHostIdentity, refreshStoredHostIdentity } from "/host/launcher-core.js";

let controller = null;

async function refreshReferenceIdentity(identityStorageKey, hostBootstrapUrl) {
  return refreshStoredHostIdentity(identityStorageKey, hostBootstrapUrl);
}

async function mount(mode, runtime) {
  const resolvedMode = mode === "split-panel" ? "split-panel" : "single-panel";
  const locale = runtime.readLocalePreference();
  const themeKey = runtime.applyThemePreference(runtime.readThemePreference(), { persist: false });
  const identity = readRecoverableHostIdentity(runtime.IDENTITY_STORAGE_KEY);
  runtime.renderMode(resolvedMode);
  runtime.renderModeShell(resolvedMode);
  runtime.setModeInUrl(resolvedMode);
  controller?.destroy?.();
  controller = await mountCatalogEmbed({
    backendBaseUrl: window.location.origin,
    entryHref: runtime.ENTRY_HREF || "/",
    identityStorageKey: runtime.IDENTITY_STORAGE_KEY,
    hostBootstrapUrl: runtime.HOST_BOOTSTRAP_URL,
    sdkPath: "/embed/sdk/xapps-embed-sdk.esm.js",
    container: document.getElementById("catalog"),
    widgetContainer: document.getElementById("widget"),
    mode: resolvedMode,
    locale,
    themeKey,
    ...(identity ? { identity } : {}),
    refreshIdentity: (storageKey) =>
      refreshReferenceIdentity(storageKey, runtime.HOST_BOOTSTRAP_URL),
    createMarketplaceRuntime: runtime.createReferenceHostMarketplaceRuntime,
    onSessionExpired: () => {
      runtime.renderSessionExpiredShell({
        title: "Session expired",
        message:
          "The tenant reference session could not be renewed. Start again from the launcher.",
        backHref: runtime.ENTRY_HREF || "/",
      });
    },
  });
  runtime.renderIdentity(controller.getIdentity());
}

async function main() {
  const referenceConfig = await importBrowserAssetModule("/host/reference-config.js");
  const referenceShell = await importBrowserAssetModule("/host/reference-shell.js");
  const referenceRuntime = await importBrowserAssetModule("/host/reference-runtime.js");
  const runtime = {
    ...referenceConfig,
    ...referenceShell,
    ...referenceRuntime,
  };

  runtime.setHeaderCollapsed(runtime.readHeaderCollapsedPreference());
  document.querySelectorAll(".mode-btn").forEach((node) => {
    node.addEventListener("click", () => {
      const nextMode = String(node.dataset.mode || "").trim();
      void mount(nextMode, runtime);
    });
  });
  document.getElementById("host-header-toggle")?.addEventListener("click", () => {
    runtime.toggleHeaderCollapsed();
  });
  document.getElementById("host-theme-select")?.addEventListener("change", (event) => {
    const nextTheme = String(event?.target?.value || "").trim();
    runtime.applyThemePreference(nextTheme);
    window.location.reload();
  });
  const localeSelect = document.getElementById("host-locale-select");
  if (localeSelect instanceof HTMLSelectElement) {
    const initialLocale = runtime.applyLocalePreference(runtime.readLocalePreference(), {
      persist: false,
    });
    localeSelect.value = initialLocale;
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
  console.error("[reference-host] marketplace bootstrap failed", error);
  renderPageFailure({
    title: "Reference host bootstrap failed",
    message: String(error?.message || "Unknown error"),
    backHref: "/",
    bodyClassName: "",
    sectionClassName: "",
  });
});
