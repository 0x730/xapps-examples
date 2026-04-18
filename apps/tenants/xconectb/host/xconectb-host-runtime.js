import {
  createStandardHostMarketplaceRuntime,
  resolveStandardTheme,
} from "/host/standard-runtime.js";
import { setWidgetPlaceholder } from "./xconectb-host-shell.js";

export function resolveXconectbTheme(themeKey) {
  return resolveStandardTheme(themeKey, { defaultThemeKey: "harbor" });
}

export function createXconectbMarketplaceRuntime(options) {
  return createStandardHostMarketplaceRuntime({
    ...options,
    onStatePatch: (patch) => {
      if (patch && typeof patch === "object" && Object.keys(patch).length > 0) {
        console.debug("[xconectb-host] widget state patch", patch);
      }
    },
    setWidgetPlaceholder,
    onExpandError: (error) => {
      console.warn("[xconectb-host] failed to handle split-panel expand request", error);
    },
  });
}

export const createReferenceHostMarketplaceRuntime = createXconectbMarketplaceRuntime;
export const resolveReferenceHostTheme = resolveXconectbTheme;
