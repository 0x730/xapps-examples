import {
  buildStoredHostIdentity,
  executeHostBootstrap,
  readStoredHostIdentity,
  writeStoredHostIdentity,
} from "/host/launcher-core.js";
import {
  importBrowserAssetModule,
  normalizeLocaleTag,
  parseObjectJson,
  readOptionalString,
  renderPageFailure,
  setText,
} from "/host/page-utils.js";

function $(id) {
  return document.getElementById(id);
}

function byAnyId(...ids) {
  for (const id of ids) {
    const node = $(id);
    if (node) return node;
  }
  return null;
}

function readStoredIdentity(identityStorageKey) {
  return readStoredHostIdentity(identityStorageKey);
}

function readLocalePreference(localeStorageKey) {
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
    typeof navigator !== "undefined"
      ? String((navigator.languages && navigator.languages[0]) || navigator.language || "")
      : "",
  );
}

function applyLocalePreference(localeStorageKey, locale, options = {}) {
  const resolved = normalizeLocaleTag(locale);
  document.documentElement.lang = resolved;
  const select = $("host-locale-select");
  if (select instanceof HTMLSelectElement) select.value = resolved;
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
  const card = $("identity");
  const copy = $("identity-copy");
  if (!card || !copy) return;
  if (!identity?.subjectId) {
    card.hidden = true;
    copy.textContent = "";
    return;
  }
  card.hidden = false;
  copy.textContent = "";
  const titleParts = [identity.name, identity.email].filter(
    (value) => typeof value === "string" && value.trim(),
  );
  copy.append(
    document.createTextNode(titleParts.length ? titleParts.join(" · ") : "Resolved subject"),
  );
  copy.append(document.createElement("br"));
  const code = document.createElement("code");
  code.textContent = String(identity.subjectId);
  copy.append(code);
}

function renderEntryErrorFromQuery() {
  const currentUrl = new URL(window.location.href);
  const statusEl = $("status");
  const errorKey = readOptionalString(currentUrl.searchParams.get("hostError"));
  if (!statusEl || errorKey !== "missing_identity") return;
  statusEl.className = "status error";
  statusEl.textContent =
    "The host could not continue because the browser identity was missing or the bootstrap session expired. Resolve the subject again from this entry page.";
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

function syncIdentityAdvancedVisibility(override = null) {
  const advanced = $("identity-advanced");
  if (!(advanced instanceof HTMLDetailsElement)) return;
  const current =
    override ||
    mergeIdentityOverrides(readIdentityOverrideFromForm(), readIdentityOverrideFromQuery());
  advanced.open = Boolean(
    current?.subjectId || current?.type || current?.identifier || current?.metadata,
  );
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
  const subjectType = readOptionalString($("subjectType")?.value);
  const idType = readOptionalString($("subjectIdentifierType")?.value);
  const identifierValue = readOptionalString($("subjectIdentifierValue")?.value);
  const identifierHint = readOptionalString($("subjectIdentifierHint")?.value);
  const metadataRaw = readOptionalString($("subjectMetadata")?.value);
  let metadata = null;
  if (metadataRaw) {
    try {
      const parsed = JSON.parse(metadataRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metadata = parsed;
      }
    } catch {
      throw new Error("Metadata JSON must be a valid object");
    }
  }
  return {
    ...(subjectType ? { type: subjectType } : {}),
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

function applyIdentityPreset(kind) {
  const subjectType = $("subjectType");
  const identifierType = $("subjectIdentifierType");
  const identifierValue = $("subjectIdentifierValue");
  const identifierHint = $("subjectIdentifierHint");
  const metadata = $("subjectMetadata");
  if (
    !(subjectType instanceof HTMLInputElement || subjectType instanceof HTMLSelectElement) ||
    !(identifierType instanceof HTMLInputElement) ||
    !(identifierValue instanceof HTMLInputElement) ||
    !(identifierHint instanceof HTMLInputElement) ||
    !(metadata instanceof HTMLInputElement)
  ) {
    return;
  }
  if (kind === "individual") {
    subjectType.value = "individual";
    identifierType.value = "person_identity_id";
    identifierValue.value = "person-default";
    identifierHint.value = "Individual";
    metadata.value = '{"profile":"individual"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  if (kind === "company-a") {
    subjectType.value = "business_member";
    identifierType.value = "tenant_member_id";
    identifierValue.value = "acct-a";
    identifierHint.value = "Company A";
    metadata.value = '{"company":"A","role":"member"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  if (kind === "company-b") {
    subjectType.value = "business_member";
    identifierType.value = "tenant_member_id";
    identifierValue.value = "acct-b";
    identifierHint.value = "Company B";
    metadata.value = '{"company":"B","role":"member"}';
    syncIdentityAdvancedVisibility();
    return;
  }
  subjectType.value = "";
  identifierType.value = "";
  identifierValue.value = "";
  identifierHint.value = "";
  metadata.value = "";
  syncIdentityAdvancedVisibility({});
}

async function main() {
  const proofConfig = await importBrowserAssetModule("/host/proof-config.js");
  const {
    BACKEND_BASE_URL,
    HOST_BOOTSTRAP_URL,
    ENTRY_HREF,
    IDENTITY_STORAGE_KEY,
    PROOF_NAME,
    STACK_LABEL,
    WORKSPACE_KEY,
  } = proofConfig;
  const form = byAnyId("identity-form", "entry-form");
  const statusEl = $("status");
  const localeStorageKey = `${WORKSPACE_KEY}_host_proof_locale_v1`;
  if (!(form instanceof HTMLFormElement) || !statusEl) return;

  setText("host-proof-name", PROOF_NAME);
  setText("host-proof-workspace", WORKSPACE_KEY);
  setText("host-proof-stack", STACK_LABEL);
  setText("host-proof-backend-base", BACKEND_BASE_URL);
  setText("proof-name", PROOF_NAME);
  setText("proof-workspace", WORKSPACE_KEY);
  setText("proof-stack", STACK_LABEL);
  setText("proof-backend-base", BACKEND_BASE_URL);
  restoreStoredForm(IDENTITY_STORAGE_KEY);
  syncIdentityAdvancedVisibility();
  renderEntryErrorFromQuery();
  renderStoredIdentity(IDENTITY_STORAGE_KEY);

  const localeSelect = $("host-locale-select");
  if (localeSelect instanceof HTMLSelectElement) {
    const initialLocale = applyLocalePreference(
      localeStorageKey,
      readLocalePreference(localeStorageKey),
      { persist: false },
    );
    localeSelect.value = initialLocale;
    localeSelect.addEventListener("change", () => {
      applyLocalePreference(localeStorageKey, localeSelect.value);
    });
  }

  $("identity-preset-individual")?.addEventListener("click", () =>
    applyIdentityPreset("individual"),
  );
  $("identity-preset-company-a")?.addEventListener("click", () => applyIdentityPreset("company-a"));
  $("identity-preset-company-b")?.addEventListener("click", () => applyIdentityPreset("company-b"));
  $("identity-preset-clear")?.addEventListener("click", () => applyIdentityPreset("clear"));

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

    const subjectId = readOptionalString($("subjectId")?.value);
    const email = readOptionalString($("email")?.value).toLowerCase();
    const name = readOptionalString($("name")?.value);
    const modeInput = form.querySelector('input[name="mode"]:checked');
    const mode = modeInput ? readOptionalString(modeInput.value) : "single-panel";
    const xappId = readOptionalString($("xappId")?.value);
    const metadata = mergeIdentityOverrides(identityOverride, subjectId ? { subjectId } : {});

    if (!metadata.subjectId && !metadata.identifier && !email) {
      statusEl.className = "status error";
      statusEl.textContent = "Provide subject identity or email before bootstrapping.";
      return;
    }

    try {
      statusEl.className = "status";
      statusEl.textContent = "Bootstrapping hosted session...";
      const bootstrapInput = {
        ...metadata,
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      };
      const result = await executeHostBootstrap(bootstrapInput, {
        hostBootstrapUrl: HOST_BOOTSTRAP_URL,
      });
      const nextIdentity = buildStoredHostIdentity(
        readStoredHostIdentity(IDENTITY_STORAGE_KEY),
        result,
        bootstrapInput,
        {
          mode,
          xappId,
        },
      );
      writeStoredHostIdentity(IDENTITY_STORAGE_KEY, nextIdentity);
      renderStoredIdentity(IDENTITY_STORAGE_KEY);
      const locale = readLocalePreference(localeStorageKey);
      if (mode === "single-xapp") {
        const target = new URL("/single-xapp.html", window.location.href);
        target.searchParams.set("locale", locale);
        if (xappId) target.searchParams.set("xappId", xappId);
        window.location.assign(target.toString());
        return;
      }
      const target = new URL("/marketplace.html", window.location.href);
      target.searchParams.set("locale", locale);
      target.searchParams.set("mode", mode === "split-panel" ? "split-panel" : "single-panel");
      window.location.assign(target.toString());
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(error?.message || "host bootstrap failed");
    }
  });
}

function restoreStoredForm(identityStorageKey) {
  const identity = readStoredIdentity(identityStorageKey);
  if (!identity) return;
  const mappings = {
    name: identity.name,
    email: identity.email,
    xappId: identity.xappId,
    subjectType: identity.type,
    subjectIdentifierType: identity.identifier?.idType,
    subjectIdentifierValue: identity.identifier?.value,
    subjectIdentifierHint: identity.identifier?.hint,
    subjectMetadata:
      identity.metadata &&
      typeof identity.metadata === "object" &&
      !Array.isArray(identity.metadata)
        ? JSON.stringify(identity.metadata)
        : "",
  };
  Object.entries(mappings).forEach(([id, value]) => {
    const node = $(id);
    if (
      (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) &&
      typeof value === "string" &&
      value.trim()
    ) {
      node.value = value.trim();
    }
  });
  if (typeof identity.mode === "string" && identity.mode.trim()) {
    const input = document.querySelector(`input[name="mode"][value="${identity.mode.trim()}"]`);
    if (input instanceof HTMLInputElement) input.checked = true;
  }
}

void main().catch((error) => {
  console.error("[host-proof] launcher bootstrap failed", error);
  renderPageFailure({
    title: "Hosted tenant launcher failed",
    message: String(error?.message || "Unknown error"),
    backHref: "/",
  });
});
