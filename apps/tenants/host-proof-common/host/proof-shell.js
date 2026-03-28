import { createHostShellApi } from "/host/host-shell.js";
import { WORKSPACE_KEY } from "/host/proof-config.js";

const MODE_COPY = {
  "single-panel": {
    title: "Single-panel marketplace workspace",
    subtitle: `Catalog and widget navigation stay in one embedded surface while ${WORKSPACE_KEY} keeps the backend on another origin.`,
  },
  "split-panel": {
    title: "Split-panel marketplace workspace",
    subtitle:
      "Catalog stays on the left and widgets open in a dedicated panel, still backed by the remote tenant workspace API.",
  },
};

const shellApi = createHostShellApi({
  modeCopy: MODE_COPY,
  headerCollapseStorageKey: `${WORKSPACE_KEY}_host_proof_header_collapsed_v1`,
  localeStorageKey: `${WORKSPACE_KEY}_host_proof_locale_v1`,
  themeStorageKey: `${WORKSPACE_KEY}_host_proof_theme_v1`,
  themeAliases: { slate: "harbor", graphite: "atlas" },
  validThemes: ["harbor", "atlas", "copper", "emerald", "iris"],
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
