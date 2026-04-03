export function normalizeOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (!parsed.protocol || !parsed.host) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function parseAllowedOrigins(value) {
  const parts = Array.isArray(value) ? value : String(value || "").split(/[,\n]/);
  const normalized = parts.map((entry) => normalizeOrigin(entry)).filter((entry) => Boolean(entry));
  return Array.from(new Set(normalized));
}

export function isBootstrapOriginAllowed(hostOrigin, allowedOrigins = []) {
  const normalizedHostOrigin = normalizeOrigin(hostOrigin);
  if (!normalizedHostOrigin) return false;
  const normalizedAllowedOrigins = parseAllowedOrigins(allowedOrigins);
  if (normalizedAllowedOrigins.length === 0) return true;
  return normalizedAllowedOrigins.includes(normalizedHostOrigin);
}
