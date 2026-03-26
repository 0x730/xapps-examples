import { IDENTITY_STORAGE_KEY } from "/host/proof-config.js";

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

export function clearProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore localStorage failures
  }
}

export function readProofIdentity(storageKey = IDENTITY_STORAGE_KEY) {
  const identity = parseStoredIdentity(storageKey);
  if (!identity) return null;
  const bootstrapToken = String(identity.bootstrapToken || "").trim();
  const expiresAt = parseExpiry(identity);
  if (!identity?.email || !identity?.subjectId || !bootstrapToken) {
    clearProofIdentity(storageKey);
    return null;
  }
  if (expiresAt !== null && expiresAt <= Date.now()) {
    clearProofIdentity(storageKey);
    return null;
  }
  return identity;
}
