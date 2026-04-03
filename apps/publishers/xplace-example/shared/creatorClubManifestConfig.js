import {
  listXappHostedPaymentPresets,
  resolveXappHostedPaymentDefinition,
} from "../../../../packages/backend-kit/dist/index.js";

function readString(value) {
  return String(value || "").trim();
}

function readLocalizedText(value, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return (
      readString(value.en) ||
      readString(value.ro) ||
      Object.values(value)
        .map((item) => readString(item))
        .find(Boolean) ||
      fallback
    );
  }
  return readString(value) || fallback;
}

function humanizePaymentScheme(value) {
  const normalized = readString(value).toLowerCase().replace(/[_-]+/g, " ");
  if (!normalized) return "";
  return normalized.replace(/\b[a-z]/g, (match) => match.toUpperCase());
}

function labelForIssuerMode(value) {
  const normalized = readString(value).toLowerCase();
  if (normalized === "gateway_managed") return "Gateway managed";
  if (normalized === "tenant_delegated") return "Tenant delegated";
  if (normalized === "publisher_delegated") return "Publisher delegated";
  if (normalized === "owner_managed") return "Owner managed";
  return readString(value) || "Payment lane";
}

export function listCreatorClubPaymentPresetsFromManifest(manifest) {
  const rawPresets = listXappHostedPaymentPresets({ manifest });
  const grouped = new Map();

  for (const item of rawPresets) {
    const paymentGuardRef = readString(item?.paymentGuardRef);
    if (!paymentGuardRef) continue;
    const existing = grouped.get(paymentGuardRef) || {
      key: paymentGuardRef,
      paymentGuardRef,
      issuerMode: readString(item?.issuerMode),
      label: labelForIssuerMode(item?.issuerMode),
      acceptedSchemes: [],
      description: "",
    };
    const scheme = readString(item?.paymentScheme).toLowerCase();
    if (scheme && !existing.acceptedSchemes.includes(scheme)) {
      existing.acceptedSchemes.push(scheme);
    }
    grouped.set(paymentGuardRef, existing);
  }

  return Array.from(grouped.values()).map((item) => {
    const schemesLabel = item.acceptedSchemes.map(humanizePaymentScheme).filter(Boolean).join(", ");
    return {
      ...item,
      description: schemesLabel
        ? `Available on hosted checkout: ${schemesLabel}.`
        : "Available on hosted checkout.",
    };
  });
}

export function buildCreatorClubPaymentSessionConfigFromManifest(
  paymentGuardRef,
  paymentScheme,
  manifest,
  env = process.env,
) {
  const resolved = resolveXappHostedPaymentDefinition({
    manifest,
    paymentGuardRef,
    paymentScheme,
    env,
  });
  return {
    paymentGuardRef: resolved.paymentGuardRef,
    issuerMode: resolved.issuerMode,
    scheme: resolved.scheme,
    metadata: resolved.metadata,
  };
}

export function listCreatorClubFeaturesFromManifest(manifest) {
  const items = Array.isArray(manifest?.metadata?.creator_club?.features)
    ? manifest.metadata.creator_club.features
    : [];
  return items
    .map((item) => {
      const key = readString(item?.key);
      if (!key) return null;
      const requirements =
        item?.requirements &&
        typeof item.requirements === "object" &&
        !Array.isArray(item.requirements)
          ? item.requirements
          : {};
      return {
        key,
        title: readLocalizedText(item?.title, key),
        description: readLocalizedText(item?.description),
        requirements: {
          currentAccess: Boolean(requirements.currentAccess),
          subscription: Boolean(requirements.subscription),
          ...(requirements.credits === undefined
            ? {}
            : { credits: Number(requirements.credits) || 0 }),
        },
      };
    })
    .filter(Boolean);
}
