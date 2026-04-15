import {
  createReferenceMarketplaceRuntime,
  resolveReferenceTheme,
} from "/host/reference-runtime.js";
import { setWidgetPlaceholder } from "./xconecta-host-shell.js";

export function resolveXconectTheme(themeKey) {
  return resolveReferenceTheme(themeKey, { defaultThemeKey: "harbor" });
}

export function createXconectMarketplaceRuntime(options) {
  return createReferenceMarketplaceRuntime({
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
