import { buildFeaturePaywallCopyModel } from "../../../../../../packages/browser-host/src/xms.ts";
import { buildMonetizationStateView, formatStateLabel } from "./monetizationState.js";
import { readString } from "./shared.js";

export function buildFeatureCopyModel({ feature, statePayload, featurePaywall }) {
  const view = buildMonetizationStateView(statePayload);
  const activePackage =
    featurePaywall?.activePackage && typeof featurePaywall.activePackage === "object"
      ? featurePaywall.activePackage
      : null;
  const sharedCopy = buildFeaturePaywallCopyModel({
    feature,
    snapshotSummary: view.snapshotSummary,
    currentSubscriptionStatus: view.currentSubscription?.status,
    activePackage,
    assetMixLabel: view.runtimeMix.assetMixLabel,
  });

  return {
    ...sharedCopy,
    subscriptionLabel: formatStateLabel(view.currentSubscription?.status, "inactive"),
    activePackageLabel: activePackage ? readString(activePackage.packageTitle) : "",
  };
}
