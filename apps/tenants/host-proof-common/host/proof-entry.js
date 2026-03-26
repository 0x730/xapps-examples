import {
  BACKEND_BASE_URL,
  IDENTITY_STORAGE_KEY,
  PROOF_NAME,
  STACK_LABEL,
  WORKSPACE_KEY,
} from "/host/proof-config.js";
import { readProofIdentity } from "./proof-identity.js";

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

function renderStoredIdentity() {
  const identity = readStoredIdentity();
  const card = $("identity");
  const copy = $("identity-copy");
  if (!card || !copy) return;
  if (!identity?.subjectId || !identity?.email) {
    card.hidden = true;
    copy.textContent = "";
    return;
  }
  card.hidden = false;
  copy.textContent = "";
  copy.append(
    document.createTextNode(
      `${String(identity.name || identity.email)} · ${String(identity.email)}`,
    ),
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

async function resolveSubject(email, name) {
  const response = await fetch("/api/host-bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
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
  renderStoredIdentity();
  renderEntryErrorFromQuery();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = String(nameInput?.value || "").trim();
    const email = String(emailInput?.value || "")
      .trim()
      .toLowerCase();
    const modeInput = form.querySelector('input[name="mode"]:checked');
    const mode = modeInput ? String(modeInput.value || "").trim() : "single-panel";
    const xappId = String(xappIdInput?.value || "").trim();
    if (!name || !email) return;
    if (mode === "single-xapp" && !xappId) {
      statusEl.className = "status error";
      statusEl.textContent = "An xapp id is required for single xapp mode.";
      return;
    }

    launchBtn.disabled = true;
    statusEl.className = "status";
    statusEl.textContent = `Resolving subject via ${BACKEND_BASE_URL} ...`;

    try {
      const resolved = await resolveSubject(email, name);
      window.localStorage.setItem(
        IDENTITY_STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          mode,
          xappId,
          subjectId: resolved.subjectId,
          bootstrapToken: resolved.bootstrapToken,
          bootstrapExpiresAt: new Date(Date.now() + resolved.expiresIn * 1000).toISOString(),
          resolvedAt: new Date().toISOString(),
        }),
      );
      renderStoredIdentity();
      if (mode === "single-xapp") {
        window.location.href = `/single-xapp.html?xappId=${encodeURIComponent(xappId)}`;
        return;
      }
      window.location.href = `/marketplace.html?mode=${encodeURIComponent(mode)}`;
    } catch (error) {
      statusEl.className = "status error";
      statusEl.textContent = String(error?.message || "Subject resolution failed");
      launchBtn.disabled = false;
    }
  });
}

main();
