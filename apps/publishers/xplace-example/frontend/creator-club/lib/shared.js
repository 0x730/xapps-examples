export function readString(value) {
  return String(value || "").trim();
}

export function readObjectRecord(input) {
  return input && typeof input === "object" && !Array.isArray(input) ? input : {};
}

export function readArrayRecords(input) {
  return Array.isArray(input) ? input : [];
}

export function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
