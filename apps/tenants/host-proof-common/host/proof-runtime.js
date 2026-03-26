import {
  createReferenceMarketplaceRuntime,
  resolveReferenceTheme,
} from "/host/reference-runtime.js";

import { setWidgetPlaceholder } from "./proof-shell.js";

export function resolveProofTheme(themeKey) {
  return resolveReferenceTheme(themeKey, { defaultThemeKey: "harbor" });
}

export function createProofMarketplaceRuntime(options) {
  return createReferenceMarketplaceRuntime({
    ...options,
    onStatePatch: (patch) => {
      if (patch && typeof patch === "object" && Object.keys(patch).length > 0) {
        console.debug("[host-proof] widget state patch", patch);
      }
    },
    setWidgetPlaceholder,
    onExpandError: (error) => {
      console.warn("[host-proof] failed to handle split-panel expand request", error);
    },
  });
}
