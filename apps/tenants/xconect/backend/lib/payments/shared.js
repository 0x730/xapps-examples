export function readString(value) {
  return String(value ?? "").trim();
}

// Tiny shared readers/parsers used by multiple payment helpers.
export function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function isPlaceholderToken(value) {
  const raw = readString(value);
  return /^__[^_].*__$/.test(raw);
}

export function parseResumeToken(token) {
  const raw = readString(token);
  if (!raw) return {};
  try {
    return asObject(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")));
  } catch {
    return {};
  }
}
