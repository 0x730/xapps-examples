import {
  BACKEND_BASE_URL,
  DASHBOARD_HREF,
  DASHBOARD_LABEL,
  HOST_BOOTSTRAP_URL,
  IDENTITY_STORAGE_KEY,
  PROOF_NAME,
  STACK_LABEL,
  WORKSPACE_KEY,
} from "/host/proof-config.js";
import { readProofIdentity } from "./proof-identity.js";

const LOCALE_STORAGE_KEY = `${WORKSPACE_KEY}_host_proof_locale_v1`;

function $(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = String(value || "");
}

function readStoredIdentity() {
  return readProofIdentity(IDENTITY_STORAGE_KEY);
}

function normalizeLocale(value) {
  const raw = String(value || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
  if (raw === "ro" || raw.startsWith("ro-")) return "ro";
  if (raw === "en" || raw.startsWith("en-")) return "en";
  return "en";
}

function readLocalePreference() {
  const currentUrl = new URL(window.location.href);
  const queryLocale = String(currentUrl.searchParams.get("locale") || "").trim();
  if (queryLocale) return normalizeLocale(queryLocale);
  try {
    const stored = String(window.localStorage.getItem(LOCALE_STORAGE_KEY) || "").trim();
    if (stored) return normalizeLocale(stored);
  } catch {
    // ignore localStorage failures
  }
  return normalizeLocale(
    typeof navigator !== "undefined"
      ? String((navigator.languages && navigator.languages[0]) || navigator.language || "")
      : "",
  );
}

function applyLocalePreference(locale, options = {}) {
  const resolved = normalizeLocale(locale);
  document.documentElement.lang = resolved;
  const select = $("host-locale-select");
  if (select instanceof HTMLSelectElement) {
    select.value = resolved;
  }
  if (options.persist === false) return resolved;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
  } catch {
    // ignore localStorage failures
  }
  return resolved;
}

function renderStoredIdentity() {
  const identity = readStoredIdentity();
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
  const errorKey = String(currentUrl.searchParams.get("hostError") || "").trim();
  const statusEl = $("status");
  if (!statusEl || errorKey !== "missing_identity") return;
  statusEl.className = "status error";
  statusEl.textContent =
    "The host could not continue because the browser identity was missing or the bootstrap session expired. Resolve the subject again from this entry page.";
}

function readOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function syncIdentityAdvancedVisibility(override = null) {
  const advanced = $("identity-advanced");
  if (!(advanced instanceof HTMLDetailsElement)) return;
  const current =
    override ||
    mergeIdentityOverrides(readIdentityOverrideFromForm(), readIdentityOverrideFromQuery());
  advanced.open = Boolean(
    current?.subjectId ||
    current?.type ||
    current?.identifier ||
    current?.metadata,
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
  const metadataRaw =
    readOptionalString(currentUrl.searchParams.get("subjectMetadata")) ||
    readOptionalString(currentUrl.searchParams.get("metadata"));
  let metadata = null;
  if (metadataRaw) {
    try {
      const parsed = JSON.parse(metadataRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metadata = parsed;
      }
    } catch {
      // ignore malformed metadata query
    }
  }
  return {
    subjectId: subjectId || null,
    type: type || null,
    identifier:
      idType && identifierValue
        ? {
            idType,
            value: identifierValue,
            ...(identifierHint ? { hint: identifierHint } : {}),
          }
        : null,
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

async function resolveSubject(input) {
  const response = await fetch(HOST_BOOTSTRAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const raw = await response.text();
  const data = (() => {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();
  if (!response.ok) {
    throw new Error(String(data?.message || "resolve-subject failed"));
  }
  const subjectId = String(data?.subjectId || data?.subject_id || "").trim();
  const bootstrapToken = String(data?.bootstrapToken || data?.bootstrap_token || "").trim();
  if (!subjectId) {
    throw new Error("resolve-subject response missing subjectId");
  }
  if (!bootstrapToken) {
    throw new Error("host-bootstrap response missing bootstrapToken");
  }
  return {
    subjectId,
    bootstrapToken,
    expiresIn: Number(data?.expiresIn || data?.expires_in || 300) || 300,
  };
}

function main() {
  setText("proof-name", PROOF_NAME);
  setText("proof-workspace", WORKSPACE_KEY);
  setText("proof-stack", STACK_LABEL);
  setText("proof-backend-base", BACKEND_BASE_URL);

  const form = $("entry-form");
  const statusEl = $("status");
  const launchBtn = $("launch-btn");
  const nameInput = $("name");
  const emailInput = $("email");
  const xappIdInput = $("xappId");
  const localeSelect = $("host-locale-select");
  $("identity-preset-individual")?.addEventListener("click", () =>
    applyIdentityPreset("individual"),
  );
  $("identity-preset-company-a")?.addEventListener("click", () => applyIdentityPreset("company-a"));
  $("identity-preset-company-b")?.addEventListener("click", () => applyIdentityPreset("company-b"));
  $("identity-preset-clear")?.addEventListener("click", () => applyIdentityPreset("clear"));
  const dashboardLink = $("dashboard-link");
  if (dashboardLink instanceof HTMLAnchorElement) {
    const dashboardHref = String(DASHBOARD_HREF || "").trim();
    if (dashboardHref) {
      dashboardLink.href = dashboardHref;
      dashboardLink.textContent =
        String(DASHBOARD_LABEL || "Back to dashboard").trim() || "Back to dashboard";
      dashboardLink.hidden = false;
    } else {
      dashboardLink.hidden = true;
    }
  }
  renderStoredIdentity();
  renderEntryErrorFromQuery();
  applyLocalePreference(readLocalePreference(), { persist: false });
  syncIdentityAdvancedVisibility();

  localeSelect?.addEventListener("change", () => {
    applyLocalePreference(localeSelect.value);
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    let identityOverride;
    try {
      identityOverride = mergeIdentityOverrides(
        readIdentityOverrideFromForm(),
        readIdentityOverrideFromQuery(),
      );
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(error?.message || "Identity override is invalid");
      return;
    }
    const name = String(nameInput?.value || "").trim();
    const email = String(emailInput?.value || "")
      .trim()
      .toLowerCase();
    const modeInput = form.querySelector('input[name="mode"]:checked');
    const mode = modeInput ? String(modeInput.value || "").trim() : "single-panel";
    const xappId = String(xappIdInput?.value || "").trim();
    if (!identityOverride.subjectId && !identityOverride.identifier && (!name || !email)) return;
    if (mode === "single-xapp" && !xappId) {
      statusEl.className = "status error";
      statusEl.textContent = "An xapp id is required for single xapp mode.";
      return;
    }

    launchBtn.disabled = true;
    statusEl.className = "status";
    statusEl.textContent = `Resolving subject via ${BACKEND_BASE_URL} ...`;

    try {
      const resolved = await resolveSubject({
        ...identityOverride,
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      });
      window.localStorage.setItem(
        IDENTITY_STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          mode,
          xappId,
          ...(identityOverride.type ? { type: identityOverride.type } : {}),
          ...(identityOverride.identifier ? { identifier: identityOverride.identifier } : {}),
          ...(identityOverride.metadata ? { metadata: identityOverride.metadata } : {}),
          subjectId: resolved.subjectId,
          bootstrapToken: resolved.bootstrapToken,
          bootstrapExpiresAt: new Date(Date.now() + resolved.expiresIn * 1000).toISOString(),
          resolvedAt: new Date().toISOString(),
        }),
      );
      renderStoredIdentity();
      if (mode === "single-xapp") {
        const target = new URL("/single-xapp.html", window.location.href);
        target.searchParams.set("locale", readLocalePreference());
        target.searchParams.set("xappId", xappId);
        window.location.href = target.toString();
        return;
      }
      const target = new URL("/marketplace.html", window.location.href);
      target.searchParams.set("locale", readLocalePreference());
      target.searchParams.set("mode", mode);
      window.location.href = target.toString();
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(error?.message || "Subject resolution failed");
      launchBtn.disabled = false;
    }
  });
}

main();
