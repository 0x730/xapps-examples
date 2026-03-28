import { HOST_BOOTSTRAP_URL, IDENTITY_STORAGE_KEY } from "/host/proof-config.js";

function parseStoredIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  try {
    const raw = window.localStorage.getItem(storageKey) || "";
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function parseExpiry(identity) {
  const iso = String(identity?.bootstrapExpiresAt || "").trim();
  if (!iso) return null;
  const timestamp = Date.parse(iso);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function readStoredProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  const identity = parseStoredIdentity(storageKey);
  return identity && typeof identity === "object" ? identity : null;
}

export function clearProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore localStorage failures
  }
}

export function readProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  const identity = readStoredProofIdentity(storageKey);
  if (!identity) return null;
  const bootstrapToken = String(identity.bootstrapToken || "").trim();
  const expiresAt = parseExpiry(identity);
  if (!identity?.email || !identity?.subjectId || !bootstrapToken) {
    clearProofIdentity(storageKey);
    return null;
  }
  if (expiresAt !== null && expiresAt <= Date.now()) {
    return null;
  }
  return identity;
}

export async function refreshProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  const identity = readStoredProofIdentity(storageKey);
  const email = String(identity?.email || "")
    .trim()
    .toLowerCase();
  const name = String(identity?.name || "").trim();
  if (!email || !name) {
    throw new Error("Stored host identity is missing email/name for silent re-bootstrap");
  }

  const response = await fetch(HOST_BOOTSTRAP_URL, {
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
    throw new Error(String(data?.message || "host bootstrap refresh failed"));
  }

  const subjectId = String(data?.subjectId || data?.subject_id || identity?.subjectId || "").trim();
  const bootstrapToken = String(data?.bootstrapToken || data?.bootstrap_token || "").trim();
  const expiresIn = Number(data?.expiresIn || data?.expires_in || 300) || 300;
  if (!subjectId || !bootstrapToken) {
    throw new Error("host bootstrap refresh response missing subjectId/bootstrapToken");
  }

  const nextIdentity = {
    ...identity,
    name,
    email,
    subjectId,
    bootstrapToken,
    bootstrapExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    resolvedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(storageKey, JSON.stringify(nextIdentity));
  return nextIdentity;
}
