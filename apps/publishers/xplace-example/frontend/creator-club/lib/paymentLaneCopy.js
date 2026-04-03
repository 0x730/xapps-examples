import { readString } from "./shared.js";

export function buildPaymentLaneCopy({ selectedPackage, selectedXmsMode, selectedPaymentPreset }) {
  const packageTitle = readString(selectedPackage?.packageTitle) || "No package selected";
  const xmsModeLabel = readString(selectedXmsMode?.label) || "Unknown mode";
  const xmsModeDescription =
    readString(selectedXmsMode?.description) ||
    "This package uses the current XMS monetization flow.";
  const issuerMode = readString(selectedPaymentPreset?.issuerMode);

  let hostedCheckoutLead = "Hosted checkout prepares a payment session on the current XPO rail.";
  if (issuerMode === "gateway_managed") {
    hostedCheckoutLead = "Hosted checkout is gateway-managed for this payment lane.";
  } else if (issuerMode === "tenant_delegated") {
    hostedCheckoutLead = "Hosted checkout uses the tenant-delegated issuer lane for this package.";
  } else if (issuerMode === "publisher_delegated") {
    hostedCheckoutLead =
      "Hosted checkout uses the publisher-delegated issuer lane for this package.";
  }

  return {
    packageLabel: packageTitle,
    modeLabel: xmsModeLabel,
    modeDescription: xmsModeDescription,
    laneDescription:
      readString(selectedPaymentPreset?.description) || "Available on hosted checkout.",
    referenceActivateLabel:
      issuerMode === "owner_managed" ? "Apply direct activation" : "Apply direct activation",
    hostedCheckoutLabel: "Start hosted checkout",
    reconcileLabel: "Refresh payment status",
    referenceActivateHelp:
      "Use this when you want to apply access directly without opening hosted checkout.",
    hostedCheckoutHelp: hostedCheckoutLead,
    reconcileHelp:
      "Use this after the hosted page returns to pull the latest purchase state back into the playground.",
  };
}
