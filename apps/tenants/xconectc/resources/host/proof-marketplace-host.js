import { bootMarketplaceHost } from "/host/marketplace-host.js";
import {
    BACKEND_BASE_URL,
    IDENTITY_STORAGE_KEY,
    PROOF_NAME,
    SDK_PATH,
    STACK_LABEL,
    WORKSPACE_KEY,
} from "/host/proof-config.js";
import {
    applyLocalePreference,
    applyThemePreference,
    readHeaderCollapsedPreference,
    readLocalePreference,
    readModeFromUrl,
    readThemePreference,
    renderIdentity,
    renderMode,
    renderModeShell,
    setHeaderCollapsed,
    setLocaleInUrl,
    setModeInUrl,
    toggleHeaderCollapsed,
} from "/host/proof-shell.js";
import { readProofIdentity } from "/host/proof-identity.js";
import { createProofMarketplaceRuntime } from "/host/proof-runtime.js";

function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value || "");
}

async function main() {
    setText("host-proof-name", PROOF_NAME);
    setText("host-proof-workspace", WORKSPACE_KEY);
    setText("host-proof-stack", STACK_LABEL);
    await bootMarketplaceHost({
        backendBaseUrl: BACKEND_BASE_URL,
        entryHref: "/catalog",
        identityStorageKey: IDENTITY_STORAGE_KEY,
        sdkPath: SDK_PATH,
        applyLocalePreference,
        applyThemePreference,
        readHeaderCollapsedPreference,
        readLocalePreference,
        readModeFromUrl,
        readStoredJson: () => readProofIdentity(IDENTITY_STORAGE_KEY),
        readThemePreference,
        renderIdentity,
        renderMode,
        renderModeShell,
        setHeaderCollapsed,
        setLocaleInUrl,
        setModeInUrl,
        toggleHeaderCollapsed,
        createMarketplaceRuntime: createProofMarketplaceRuntime,
    });
}

main().catch((error) => {
    console.error("[host-proof] marketplace bootstrap failed", error);
    document.body.textContent = "";
    const main = document.createElement("main");
    main.className = "page-shell";
    const section = document.createElement("section");
    section.className = "panel";
    const title = document.createElement("h1");
    title.textContent = `${PROOF_NAME} bootstrap failed`;
    const message = document.createElement("p");
    message.textContent = String(error?.message || "Unknown error");
    const linkWrap = document.createElement("p");
    const link = document.createElement("a");
    link.href = "/catalog";
    link.textContent = "Return to the launcher";
    linkWrap.append(link);
    section.append(title, message, linkWrap);
    main.append(section);
    document.body.append(main);
});
