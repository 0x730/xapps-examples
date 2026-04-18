import { mountSingleXappEmbed } from "/host/embed-surface.js";
import { importBrowserAssetModule, renderPageFailure } from "/host/page-utils.js";

let controller = null;

async function mountCurrentXapp(runtime) {
  const input = document.getElementById("xappId");
  const xappId = input instanceof HTMLInputElement ? String(input.value || "").trim() : "";
  const locale = runtime.readLocalePreference();
  const themeKey = runtime.applyThemePreference(runtime.readThemePreference(), { persist: false });
  runtime.renderSingleXappShell();
  controller?.destroy?.();
  controller = await mountSingleXappEmbed({
    backendBaseUrl: window.location.origin,
    entryHref: runtime.ENTRY_HREF || "/",
    identityStorageKey: runtime.IDENTITY_STORAGE_KEY,
    sdkPath: "/embed/sdk/xapps-embed-sdk.esm.js",
    container: document.getElementById("catalog"),
    xappId,
    locale,
    themeKey,
    resolveTheme: runtime.resolveReferenceHostTheme,
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
  document.getElementById("loadXapp")?.addEventListener("click", () => {
    void mountCurrentXapp(runtime);
  });
  window.addEventListener("beforeunload", () => {
    controller?.destroy?.();
  });
  await mountCurrentXapp(runtime);
}

main().catch((error) => {
  console.error("[reference-host] single-xapp bootstrap failed", error);
  renderPageFailure({
    title: "Reference single-xapp bootstrap failed",
    message: String(error?.message || "Unknown error"),
    backHref: "/",
    bodyClassName: "",
    sectionClassName: "",
  });
});
