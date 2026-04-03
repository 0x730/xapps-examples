function normalizeCredits(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasSubscriptionCoverage(subscription) {
  const status = String(subscription?.status || "")
    .trim()
    .toLowerCase();
  return status === "active" || status === "grace" || status === "past_due";
}

export function evaluatePlaygroundFeatures({
  featureDefinitions,
  accessProjection,
  currentSubscription,
}) {
  const creditsRemaining = normalizeCredits(accessProjection?.credits_remaining);
  const hasCurrentAccess = Boolean(accessProjection?.has_current_access);
  const hasSubscription = hasSubscriptionCoverage(currentSubscription);
  const subscriptionStatus = String(currentSubscription?.status || "")
    .trim()
    .toLowerCase();
  const features = Array.isArray(featureDefinitions) ? featureDefinitions : [];

  return features.map((feature) => {
    const reasons = [];
    if (feature.requirements.currentAccess && !hasCurrentAccess) {
      reasons.push(
        "This feature needs current access coverage. Use an unlock, membership, or hybrid package to restore access.",
      );
    }
    if (feature.requirements.subscription && !hasSubscription) {
      reasons.push(
        subscriptionStatus
          ? `This feature needs recurring membership coverage. Current subscription state is ${subscriptionStatus}.`
          : "This feature needs recurring membership coverage. No active subscription is visible for this scope.",
      );
    }
    if (feature.requirements.credits && creditsRemaining < feature.requirements.credits) {
      reasons.push(
        `This feature spends ${feature.requirements.credits} credits, but only ${creditsRemaining} are currently visible.`,
      );
    }
    return {
      ...feature,
      available: reasons.length === 0,
      reasons,
    };
  });
}

export function evaluateFeatureExecution({
  featureKey,
  featureDefinitions,
  accessProjection,
  currentSubscription,
}) {
  const evaluated = evaluatePlaygroundFeatures({
    featureDefinitions,
    accessProjection,
    currentSubscription,
  });
  const feature = evaluated.find((item) => item.key === String(featureKey || "").trim());
  if (!feature) {
    return {
      ok: false,
      message: "Unknown feature key",
    };
  }
  if (!feature.available) {
    return {
      ok: false,
      message: feature.reasons[0] || "Feature is not available for the current monetization state",
      feature,
    };
  }
  return {
    ok: true,
    message: `${feature.title} is available on the current scope and monetization state.`,
    feature,
  };
}
