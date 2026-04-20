import {
  importBrowserAssetModule,
  normalizeLocaleTag,
  parseObjectJson,
  readOptionalString,
} from "/host/page-utils.js";
import {
  buildStoredHostIdentity,
  executeHostBootstrap,
  readStoredHostIdentity,
  writeStoredHostIdentity,
} from "/host/launcher-core.js";

function readStoredIdentity(identityStorageKey) {
  try {
    const raw = window.localStorage.getItem(identityStorageKey) || "";
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readTheme(themeStorageKey) {
  const aliases = { slate: "harbor", graphite: "atlas", portal: "portal-blue" };
  const validThemes = new Set(["harbor", "atlas", "portal-blue", "copper", "emerald", "iris"]);
  try {
    const raw = readOptionalString(window.localStorage.getItem(themeStorageKey));
    const resolved = aliases[raw] || raw;
    return validThemes.has(resolved) ? resolved : "harbor";
  } catch {
    return "harbor";
  }
}

function applyTheme(themeStorageKey, theme, options = {}) {
  const aliases = { slate: "harbor", graphite: "atlas", portal: "portal-blue" };
  const validThemes = new Set(["harbor", "atlas", "portal-blue", "copper", "emerald", "iris"]);
  const raw = readOptionalString(theme);
  const resolved = validThemes.has(aliases[raw] || raw) ? aliases[raw] || raw : "harbor";
  document.body.dataset.theme = resolved;
  const themeSelect = document.getElementById("host-theme-select");
  if (themeSelect instanceof HTMLSelectElement) themeSelect.value = resolved;
  if (options.persist === false) return resolved;
  try {
    window.localStorage.setItem(themeStorageKey, resolved);
  } catch {
    // ignore localStorage failures
  }
  return resolved;
}

function readLocale(localeStorageKey) {
  const currentUrl = new URL(window.location.href);
  const queryLocale = readOptionalString(currentUrl.searchParams.get("locale"));
  if (queryLocale) return normalizeLocaleTag(queryLocale);
  try {
    const stored = readOptionalString(window.localStorage.getItem(localeStorageKey));
    if (stored) return normalizeLocaleTag(stored);
  } catch {
    // ignore localStorage failures
  }
  return normalizeLocaleTag(
    (navigator.languages && navigator.languages[0]) || navigator.language || "en",
  );
}

function applyLocale(localeStorageKey, locale, options = {}) {
  const resolved = normalizeLocaleTag(locale);
  document.documentElement.lang = resolved;
  const localeSelect = document.getElementById("host-locale-select");
  if (localeSelect instanceof HTMLSelectElement) localeSelect.value = resolved;
  if (options.persist === false) return resolved;
  try {
    window.localStorage.setItem(localeStorageKey, resolved);
  } catch {
    // ignore localStorage failures
  }
  return resolved;
}

function renderStoredIdentity(identityStorageKey) {
  const identity = readStoredIdentity(identityStorageKey);
  const identityCard = document.getElementById("identity");
  const identityCopy = document.getElementById("identity-copy");
  if (!identityCard || !identityCopy) return;
  if (!identity || !identity.subjectId) {
    identityCard.hidden = true;
    identityCopy.textContent = "";
    return;
  }
  identityCard.hidden = false;
  identityCopy.textContent = "";
  const titleParts = [identity.name, identity.email].filter(
    (value) => typeof value === "string" && value.trim(),
  );
  identityCopy.append(
    document.createTextNode(titleParts.length ? titleParts.join(" · ") : "Resolved subject"),
  );
  identityCopy.append(document.createElement("br"));
  const code = document.createElement("code");
  code.textContent = String(identity.subjectId);
  identityCopy.append(code);
}

function restoreFormFromStorage(identityStorageKey, form) {
  const identity = readStoredIdentity(identityStorageKey);
  if (!identity) return;
  const ids = [
    "name",
    "email",
    "xappId",
    "subjectType",
    "subjectIdentifierType",
    "subjectIdentifierValue",
    "subjectIdentifierHint",
    "subjectMetadata",
  ];
  for (const id of ids) {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) continue;
    const key = id === "subjectMetadata" ? "metadata" : id === "subjectType" ? "type" : id;
    if (id === "subjectIdentifierType" && identity.identifier?.idType)
      node.value = String(identity.identifier.idType);
    else if (id === "subjectIdentifierValue" && identity.identifier?.value)
      node.value = String(identity.identifier.value);
    else if (id === "subjectIdentifierHint" && identity.identifier?.hint)
      node.value = String(identity.identifier.hint);
    else if (
      id === "subjectMetadata" &&
      identity.metadata &&
      typeof identity.metadata === "object" &&
      !Array.isArray(identity.metadata)
    )
      node.value = JSON.stringify(identity.metadata);
    else if (typeof identity[key] === "string" && identity[key].trim())
      node.value = identity[key].trim();
  }
  if (typeof identity.mode === "string" && identity.mode.trim()) {
    const input = form.querySelector(`input[name="mode"][value="${identity.mode.trim()}"]`);
    if (input) input.checked = true;
  }
}

function mergeIdentityOverrides(...entries) {
  return entries.reduce((acc, entry) => {
    if (!entry || typeof entry !== "object") return acc;
    return {
      ...acc,
      ...entry,
      ...(entry.identifier ? { identifier: entry.identifier } : {}),
      ...(entry.metadata ? { metadata: entry.metadata } : {}),
    };
  }, {});
}

function readIdentityOverrideFromQuery() {
  const currentUrl = new URL(window.location.href);
  const subjectId = readOptionalString(currentUrl.searchParams.get("subjectId"));
  const type =
    readOptionalString(currentUrl.searchParams.get("subjectType")) ||
    readOptionalString(currentUrl.searchParams.get("type"));
  const idType =
    readOptionalString(currentUrl.searchParams.get("subjectIdentifierType")) ||
    readOptionalString(currentUrl.searchParams.get("identifierType"));
  const identifierValue =
    readOptionalString(currentUrl.searchParams.get("subjectIdentifierValue")) ||
    readOptionalString(currentUrl.searchParams.get("identifierValue"));
  const identifierHint =
    readOptionalString(currentUrl.searchParams.get("subjectIdentifierHint")) ||
    readOptionalString(currentUrl.searchParams.get("identifierHint"));
  const metadata =
    parseObjectJson(currentUrl.searchParams.get("subjectMetadata")) ||
    parseObjectJson(currentUrl.searchParams.get("metadata"));
  return {
    ...(subjectId ? { subjectId } : {}),
    ...(type ? { type } : {}),
    ...(idType && identifierValue
      ? {
          identifier: {
            idType,
            value: identifierValue,
            ...(identifierHint ? { hint: identifierHint } : {}),
          },
        }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function readIdentityOverrideFromForm() {
  const type = readOptionalString(document.getElementById("subjectType")?.value);
  const idType = readOptionalString(document.getElementById("subjectIdentifierType")?.value);
  const identifierValue = readOptionalString(
    document.getElementById("subjectIdentifierValue")?.value,
  );
  const identifierHint = readOptionalString(
    document.getElementById("subjectIdentifierHint")?.value,
  );
  const metadataRaw = readOptionalString(document.getElementById("subjectMetadata")?.value);
  let metadata = null;
  if (metadataRaw) {
    try {
      const parsed = JSON.parse(metadataRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) metadata = parsed;
    } catch {
      throw new Error("Metadata JSON must be a valid object.");
    }
  }
  return {
    ...(type ? { type } : {}),
    ...(idType && identifierValue
      ? {
          identifier: {
            idType,
            value: identifierValue,
            ...(identifierHint ? { hint: identifierHint } : {}),
          },
        }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function syncIdentityAdvancedVisibility(override = null) {
  const identityAdvancedEl = document.getElementById("identity-advanced");
  if (!(identityAdvancedEl instanceof HTMLDetailsElement)) return;
  const current =
    override ||
    mergeIdentityOverrides(readIdentityOverrideFromForm(), readIdentityOverrideFromQuery());
  identityAdvancedEl.open = Boolean(
    current?.subjectId || current?.type || current?.identifier || current?.metadata,
  );
}

function applyIdentityPreset(kind) {
  const subjectTypeInput = document.getElementById("subjectType");
  const subjectIdentifierTypeInput = document.getElementById("subjectIdentifierType");
  const subjectIdentifierValueInput = document.getElementById("subjectIdentifierValue");
  const subjectIdentifierHintInput = document.getElementById("subjectIdentifierHint");
  const subjectMetadataInput = document.getElementById("subjectMetadata");
  if (
    !(
      subjectTypeInput instanceof HTMLInputElement || subjectTypeInput instanceof HTMLSelectElement
    ) ||
    !(subjectIdentifierTypeInput instanceof HTMLInputElement) ||
    !(subjectIdentifierValueInput instanceof HTMLInputElement) ||
    !(subjectIdentifierHintInput instanceof HTMLInputElement) ||
    !(subjectMetadataInput instanceof HTMLInputElement)
  ) {
    return;
  }
  if (kind === "individual") {
    subjectTypeInput.value = "individual";
    subjectIdentifierTypeInput.value = "person_identity_id";
    subjectIdentifierValueInput.value = "person-default";
    subjectIdentifierHintInput.value = "Individual";
    subjectMetadataInput.value = '{"profile":"individual"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  if (kind === "company-a") {
    subjectTypeInput.value = "business_member";
    subjectIdentifierTypeInput.value = "tenant_member_id";
    subjectIdentifierValueInput.value = "acct-a";
    subjectIdentifierHintInput.value = "Company A";
    subjectMetadataInput.value = '{"company":"A","role":"member"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  if (kind === "company-b") {
    subjectTypeInput.value = "business_member";
    subjectIdentifierTypeInput.value = "tenant_member_id";
    subjectIdentifierValueInput.value = "acct-b";
    subjectIdentifierHintInput.value = "Company B";
    subjectMetadataInput.value = '{"company":"B","role":"member"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  subjectTypeInput.value = "";
  subjectIdentifierTypeInput.value = "";
  subjectIdentifierValueInput.value = "";
  subjectIdentifierHintInput.value = "";
  subjectMetadataInput.value = "";
  syncIdentityAdvancedVisibility({});
}

function renderEntryErrorFromQuery() {
  const currentUrl = new URL(window.location.href);
  const statusEl = document.getElementById("status");
  const errorKey = readOptionalString(currentUrl.searchParams.get("hostError"));
  if (!statusEl || errorKey !== "missing_identity") return;
  statusEl.className = "status error";
  statusEl.textContent =
    "The tenant host could not continue because the browser identity was incomplete. Resolve the subject again from this entry page.";
}

function syncSelectedModeUi(form) {
  const modeInput = form.querySelector('input[name="mode"]:checked');
  const mode = modeInput ? readOptionalString(modeInput.value) : "single-panel";
  document.body.dataset.entryMode = mode;
}

async function main() {
  const referenceConfig = await importBrowserAssetModule("/host/reference-config.js");
  const {
    DISPLAY_NAME,
    ENTRY_HREF,
    IDENTITY_STORAGE_KEY,
    LOCALE_STORAGE_KEY,
    HOST_BOOTSTRAP_URL,
    THEME_STORAGE_KEY,
  } = referenceConfig;
  const form = document.getElementById("entry-form");
  const statusEl = document.getElementById("status");
  const launchBtn = document.getElementById("launch-btn");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const xappIdInput = document.getElementById("xappId");
  const localeSelect = document.getElementById("host-locale-select");
  const themeSelect = document.getElementById("host-theme-select");
  if (!(form instanceof HTMLFormElement) || !statusEl) return;

  restoreFormFromStorage(IDENTITY_STORAGE_KEY, form);
  syncIdentityAdvancedVisibility();
  applyTheme(THEME_STORAGE_KEY, readTheme(THEME_STORAGE_KEY), { persist: false });
  applyLocale(LOCALE_STORAGE_KEY, readLocale(LOCALE_STORAGE_KEY), { persist: false });
  renderEntryErrorFromQuery();
  renderStoredIdentity(IDENTITY_STORAGE_KEY);
  syncSelectedModeUi(form);

  themeSelect?.addEventListener("change", (event) =>
    applyTheme(THEME_STORAGE_KEY, event?.target?.value),
  );
  localeSelect?.addEventListener("change", (event) =>
    applyLocale(LOCALE_STORAGE_KEY, event?.target?.value),
  );
  document
    .getElementById("identity-preset-individual")
    ?.addEventListener("click", () => applyIdentityPreset("individual"));
  document
    .getElementById("identity-preset-company-a")
    ?.addEventListener("click", () => applyIdentityPreset("company-a"));
  document
    .getElementById("identity-preset-company-b")
    ?.addEventListener("click", () => applyIdentityPreset("company-b"));
  document
    .getElementById("identity-preset-clear")
    ?.addEventListener("click", () => applyIdentityPreset("clear"));
  form
    .querySelectorAll('input[name="mode"]')
    .forEach((node) => node.addEventListener("change", () => syncSelectedModeUi(form)));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let identityOverride;
    try {
      identityOverride = mergeIdentityOverrides(
        readIdentityOverrideFromForm(),
        readIdentityOverrideFromQuery(),
      );
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(error?.message || "Identity override is invalid.");
      return;
    }
    const name = readOptionalString(nameInput?.value);
    const email = readOptionalString(emailInput?.value).toLowerCase();
    const modeInput = form.querySelector('input[name="mode"]:checked');
    const mode = modeInput ? readOptionalString(modeInput.value) : "single-panel";
    const xappId = readOptionalString(xappIdInput?.value);
    if (!identityOverride.subjectId && !identityOverride.identifier && !email) {
      statusEl.className = "status error";
      statusEl.textContent = "Provide subject identity or email before bootstrapping.";
      return;
    }
    if (identityOverride.subjectId && !identityOverride.identifier && !email) {
      statusEl.className = "status error";
      statusEl.textContent =
        "Subject id bootstrap requires email or identifier so the tenant can validate it.";
      return;
    }
    if (mode === "single-xapp" && !xappId) {
      statusEl.className = "status error";
      statusEl.textContent = "A demo xapp id is required for single xapp mode.";
      return;
    }

    if (launchBtn) launchBtn.disabled = true;
    statusEl.className = "status";
    statusEl.textContent = "Bootstrapping hosted session...";

    try {
      const bootstrapInput = {
        ...identityOverride,
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      };
      const result = await executeHostBootstrap(bootstrapInput, {
        hostBootstrapUrl: HOST_BOOTSTRAP_URL,
      });
      const identity = buildStoredHostIdentity(
        readStoredHostIdentity(IDENTITY_STORAGE_KEY),
        result,
        bootstrapInput,
        { mode, xappId },
      );
      writeStoredHostIdentity(IDENTITY_STORAGE_KEY, identity);
      renderStoredIdentity(IDENTITY_STORAGE_KEY);
      const locale = readLocale(LOCALE_STORAGE_KEY);
      if (mode === "single-xapp") {
        const target = new URL("/single-xapp.html", window.location.href);
        target.searchParams.set("locale", locale);
        target.searchParams.set("xappId", xappId);
        if (identity.subjectId) target.searchParams.set("subjectId", identity.subjectId);
        window.location.href = target.toString();
        return;
      }
      const target = new URL("/marketplace.html", window.location.href);
      target.searchParams.set("locale", locale);
      target.searchParams.set("mode", mode);
      if (identity.subjectId) target.searchParams.set("subjectId", identity.subjectId);
      window.location.href = target.toString();
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(
        error?.message || `${DISPLAY_NAME || "Reference"} bootstrap failed.`,
      );
      if (launchBtn) launchBtn.disabled = false;
    }
  });
}

void main();
