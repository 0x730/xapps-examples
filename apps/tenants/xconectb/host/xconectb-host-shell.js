import { createHostShellApi } from "/host/host-shell-core.js";

const MODE_COPY = {
  "single-panel": {
    title: "Single-panel marketplace workspace",
    subtitle:
      "Catalog and widget navigation stay in one embedded surface. This is the leanest workspace shape for teams starting with xconectb.",
  },
  "split-panel": {
    title: "Split-panel marketplace workspace",
    subtitle:
      "Catalog stays on the left and widgets open in a dedicated panel. Use this when the tenant wants stronger framing around widget execution.",
  },
};

const HEADER_COLLAPSE_STORAGE_KEY = "xconectb_reference_host_header_collapsed_v1";
const THEME_STORAGE_KEY = "xconectb_reference_host_theme_v1";
const LEGACY_THEME_ALIASES = {
  slate: "harbor",
  graphite: "atlas",
};
const VALID_THEMES = ["harbor", "atlas", "portal-blue", "copper", "emerald", "iris"];

const shellApi = createHostShellApi({
  modeCopy: MODE_COPY,
  headerCollapseStorageKey: HEADER_COLLAPSE_STORAGE_KEY,
  localeStorageKey: "xconectb_reference_host_locale_v1",
  themeStorageKey: THEME_STORAGE_KEY,
  themeAliases: LEGACY_THEME_ALIASES,
  validThemes: VALID_THEMES,
  validLocales: ["en", "ro"],
  defaultLocale: "en",
  defaultTheme: "harbor",
});

export const applyLocalePreference = shellApi.applyLocalePreference;
export const applyThemePreference = shellApi.applyThemePreference;
export const readHeaderCollapsedPreference = shellApi.readHeaderCollapsedPreference;
export const readLocalePreference = shellApi.readLocalePreference;
export const readModeFromUrl = shellApi.readModeFromUrl;
export const readStoredJson = shellApi.readStoredJson;
export const readThemePreference = shellApi.readThemePreference;
export const renderIdentity = shellApi.renderIdentity;
export const renderMode = shellApi.renderMode;
export const renderModeShell = shellApi.renderModeShell;
export const renderSessionExpiredShell = shellApi.renderSessionExpiredShell;
export const renderSingleXappShell = shellApi.renderSingleXappShell;
export const setHeaderCollapsed = shellApi.setHeaderCollapsed;
export const setLocaleInUrl = shellApi.setLocaleInUrl;
export const setModeInUrl = shellApi.setModeInUrl;
export const setWidgetPlaceholder = shellApi.setWidgetPlaceholder;
export const toggleHeaderCollapsed = shellApi.toggleHeaderCollapsed;
