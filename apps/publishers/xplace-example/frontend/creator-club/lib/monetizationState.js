import { summarizeXappMonetizationSnapshot } from "../../../../../../node_modules/@xapps-platform/browser-host/dist/index.js";
import { readArrayRecords, readObjectRecord, readString } from "./shared.js";

export function formatDateTime(value) {
  const raw = readString(value);
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatStateLabel(value, fallback = "—") {
  const raw = readString(value);
  if (!raw) return fallback;
  return raw.replace(/_/g, " ");
}

export function formatScopeReference(subjectId, installationId, realmRef) {
  const subject = readString(subjectId);
  if (subject) return `subject ${subject}`;
  const installation = readString(installationId);
  if (installation) return `installation ${installation}`;
  const realm = readString(realmRef);
  if (realm) return `realm ${realm}`;
  return "shared";
}

function buildAssetMixLabel({ hasAccess, hasSubscription, walletCount }) {
  if (hasSubscription && walletCount > 0) return "Subscription + credits";
  if (hasSubscription && hasAccess) return "Subscription-backed access";
  if (walletCount > 0 && hasAccess) return "Credits + access";
  if (walletCount > 0) return "Credits only";
  if (hasAccess) return "Access only";
  return "No active assets";
}

function isUsageCreditSource(sourceRef) {
  return readString(sourceRef).toLowerCase().includes("usage_credit");
}

function sortByOccurredAtDescending(items) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(String(left?.occurred_at || ""));
    const rightTime = Date.parse(String(right?.occurred_at || ""));
    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0;
    if (Number.isNaN(leftTime)) return 1;
    if (Number.isNaN(rightTime)) return -1;
    return rightTime - leftTime;
  });
}

function buildAccessProvenanceLabel({
  accessProjection,
  currentSubscription,
  recentPurchaseIntent,
  recentTransactions,
}) {
  if (currentSubscription) {
    const tier = formatStateLabel(currentSubscription?.tier, "subscription");
    return `${tier} subscription`;
  }
  const sourceRef = String(accessProjection?.source_ref || "").trim();
  const normalizedSourceRef = readString(accessProjection?.source_ref);
  if (normalizedSourceRef) {
    const packageSlug = readString(recentPurchaseIntent?.package?.slug);
    return packageSlug
      ? `${formatStateLabel(normalizedSourceRef)} via ${packageSlug}`
      : formatStateLabel(normalizedSourceRef);
  }
  const verifiedTransaction = recentTransactions.find(
    (item) => readString(item?.status).toLowerCase() === "verified",
  );
  if (verifiedTransaction) {
    return `transaction ${readString(verifiedTransaction.id) || "verified"}`;
  }
  const purchaseIntentId = readString(recentPurchaseIntent?.purchase_intent_id);
  if (purchaseIntentId) return `purchase intent ${purchaseIntentId}`;
  return "Not yet resolved";
}

function buildDurableUnlockSummary({
  accessProjection,
  currentSubscription,
  additiveEntitlements,
  recentPurchaseIntent,
  recentTransactions,
  snapshotSummary,
}) {
  const activeAdditiveEntitlements = Array.isArray(additiveEntitlements)
    ? additiveEntitlements.filter(
        (item) =>
          readString(item?.status).toLowerCase() === "active" &&
          Boolean(readString(item?.product_id)),
      )
    : [];
  const primaryAdditiveEntitlement = activeAdditiveEntitlements[0] || null;
  const sourceRef = readString(accessProjection?.source_ref);
  const subscriptionStatus = readString(currentSubscription?.status);
  const entitlementState = readString(accessProjection?.entitlement_state);
  const tier = readString(accessProjection?.tier);
  const recentPackageSlug = readString(
    recentPurchaseIntent?.package?.slug || recentPurchaseIntent?.package?.id,
  );
  const likelyUnlockFromRecentPackage =
    recentPackageSlug.toLowerCase().includes("unlock") ||
    readString(recentPurchaseIntent?.package?.package_kind).toLowerCase() === "one_time_unlock";
  const likelyDurableUnlock =
    activeAdditiveEntitlements.length > 0 ||
    Boolean(likelyUnlockFromRecentPackage) ||
    (!subscriptionStatus &&
      !isUsageCreditSource(sourceRef) &&
      Boolean(
        entitlementState === "active" ||
        entitlementState === "expired" ||
        entitlementState === "suspended" ||
        entitlementState === "grace_period" ||
        (tier && sourceRef),
      ));

  if (!likelyDurableUnlock) {
    return {
      visible: false,
    };
  }

  const latestTransaction =
    recentTransactions.find((item) => readString(item?.status).toLowerCase() === "verified") ||
    recentTransactions[0] ||
    null;

  let inferenceReason =
    "Inferred from the current access projection because no active subscription is visible on this scope.";
  if (primaryAdditiveEntitlement) {
    inferenceReason = subscriptionStatus
      ? "Backed by an explicit active add-on entitlement on top of the current recurring membership."
      : "Backed by an explicit active durable entitlement for this scope.";
  } else if (likelyUnlockFromRecentPackage) {
    inferenceReason = subscriptionStatus
      ? "Backed by a recent unlock-style purchase. It is additive to the active recurring membership rather than a membership replacement."
      : "Backed by the recent unlock-style package plus the current access projection for this scope.";
  } else if (sourceRef) {
    inferenceReason = `Backed by access projection source ${formatStateLabel(sourceRef)} with no active subscription present.`;
  }

  return {
    visible: true,
    additiveToSubscription: Boolean(subscriptionStatus),
    statusLabel: formatStateLabel(
      primaryAdditiveEntitlement?.status || entitlementState,
      "unknown",
    ),
    tierLabel: formatStateLabel(primaryAdditiveEntitlement?.tier || tier, "—"),
    coverageLabel: snapshotSummary.accessCoverage.coverageLabel,
    sourceRefLabel: formatStateLabel(primaryAdditiveEntitlement?.source_ref || sourceRef, "—"),
    stateVersionLabel: formatStateLabel(
      primaryAdditiveEntitlement?.state_version || accessProjection?.state_version,
      "—",
    ),
    recentPackageLabel: formatStateLabel(recentPackageSlug, "—"),
    purchaseIntentLabel:
      readString(primaryAdditiveEntitlement?.purchase_intent_id) ||
      readString(recentPurchaseIntent?.purchase_intent_id) ||
      "—",
    transactionLabel: readString(latestTransaction?.id) || "—",
    transactionStatusLabel: formatStateLabel(latestTransaction?.status, "—"),
    inferenceReason,
    entitlements: activeAdditiveEntitlements,
  };
}

export function buildMonetizationStateView(statePayload) {
  const state = readObjectRecord(statePayload);
  const accessProjection = readObjectRecord(state.access_projection);
  const currentSubscription = readObjectRecord(state.current_subscription);
  const scopeFields = readObjectRecord(state.scope_fields);
  const walletAccounts = readArrayRecords(state.wallet_accounts);
  const walletLedger = sortByOccurredAtDescending(readArrayRecords(state.wallet_ledger));
  const recentTransactions = sortByOccurredAtDescending(
    readArrayRecords(state.recent_transactions),
  );
  const additiveEntitlements = readArrayRecords(state.additive_entitlements);
  const recentPurchaseIntent = readObjectRecord(state.recent_purchase_intent);
  const snapshotSummary = summarizeXappMonetizationSnapshot(state);
  const durableUnlockSummary = buildDurableUnlockSummary({
    accessProjection,
    currentSubscription,
    additiveEntitlements,
    recentPurchaseIntent,
    recentTransactions,
    snapshotSummary,
  });

  return {
    accessProjection,
    currentSubscription,
    additiveEntitlements,
    scopeFields,
    walletAccounts,
    walletLedger,
    recentTransactions,
    recentPurchaseIntent,
    snapshotSummary,
    runtimeMix: {
      assetMixLabel: buildAssetMixLabel({
        hasAccess: snapshotSummary.accessCoverage.available,
        hasSubscription: Boolean(currentSubscription?.status),
        walletCount: walletAccounts.length,
      }),
      scopeLabel: formatStateLabel(state.scope_kind, "subject"),
      scopeReferenceLabel: formatScopeReference(
        scopeFields.subject_id,
        scopeFields.installation_id,
        scopeFields.realm_ref,
      ),
      walletCountLabel: walletAccounts.length ? String(walletAccounts.length) : "0",
    },
    accessProvenanceLabel: buildAccessProvenanceLabel({
      accessProjection,
      currentSubscription,
      recentPurchaseIntent,
      recentTransactions,
    }),
    durableUnlockSummary,
  };
}
