import {
  createStandardHostMarketplaceRuntime,
  resolveStandardTheme,
} from "/host/standard-runtime.js";
import { setWidgetPlaceholder } from "./xconecta-host-shell.js";

export function resolveXconectTheme(themeKey) {
  return resolveStandardTheme(themeKey, { defaultThemeKey: "harbor" });
}

export function createXconectMarketplaceRuntime(options) {
  return createStandardHostMarketplaceRuntime({
    ...options,
    onStatePatch: (patch) => {
      if (patch && typeof patch === "object" && Object.keys(patch).length > 0) {
        console.debug("[xconecta-host] widget state patch", patch);
      }
    },
    setWidgetPlaceholder,
    onExpandError: (error) => {
      console.warn("[xconecta-host] failed to handle split-panel expand request", error);
    },
  });
}

export const createReferenceHostMarketplaceRuntime = createXconectMarketplaceRuntime;
export const resolveReferenceHostTheme = resolveXconectTheme;
