import React from "react";
import {
  buildMonetizationPaywallRenderModel,
  resolveMonetizationPackagePurchasePolicy,
} from "../../../../../../packages/browser-host/dist/index.js";
import { StatusBox } from "./StatusBox.jsx";
import { buildPackageCopy } from "../lib/packageCopy.js";
import {
  buildMonetizationStateView,
  formatDateTime,
  formatStateLabel,
} from "../lib/monetizationState.js";

function buildCurrentPlanLabel(view) {
  if (view.currentSubscription?.tier) {
    return formatStateLabel(view.currentSubscription.tier, "Current plan");
  }
  if (view.durableUnlockSummary?.visible) {
    return view.durableUnlockSummary.tierLabel;
  }
  return "No active plan";
}

function getWorkspacePackagePurchasePolicy(item, view) {
  return resolveMonetizationPackagePurchasePolicy({
    item,
    currentSubscription: view?.currentSubscription || null,
    additiveEntitlements: Array.isArray(view?.additiveEntitlements)
      ? view.additiveEntitlements
      : [],
  });
}

export function WorkspacePlansPanel({
  statePayload,
  packages,
  workspacePaywall,
  selected,
  setSelected,
  selectedPaymentPreset,
  busyAction,
  lastIntentId,
  lastPaymentPageUrl,
  handleAppReferenceActivate,
  handleAppCreatePaymentSession,
  handleAppReconcile,
}) {
  const view = buildMonetizationStateView(statePayload);
  const paymentRefresh =
    statePayload?.payment_refresh &&
    typeof statePayload.payment_refresh === "object" &&
    !Array.isArray(statePayload.payment_refresh)
      ? statePayload.payment_refresh
      : null;
  const paywallRenderModel = workspacePaywall
    ? buildMonetizationPaywallRenderModel(workspacePaywall)
    : null;
  const renewalBoundary =
    view.currentSubscription?.renews_at || view.currentSubscription?.expires_at || null;
  const selectedPurchasePolicy = selected
    ? getWorkspacePackagePurchasePolicy(selected, view)
    : null;
  const selectedIsCurrent = selectedPurchasePolicy?.status === "current_recurring_plan";
  const selectedIsOwnedAdditiveUnlock = selectedPurchasePolicy?.status === "owned_additive_unlock";
  const selectedIsAdditiveCompanion =
    selectedPurchasePolicy?.transitionKind === "buy_additive_unlock" &&
    String(view.currentSubscription?.status || "")
      .trim()
      .toLowerCase() === "active";

  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Plans</p>
          <h2>Choose and activate a plan.</h2>
        </div>
        <div className="creator-meta">
          {paywallRenderModel
            ? `${paywallRenderModel.paywallLabel} · ${paywallRenderModel.packageCountLabel}`
            : "Main app purchase flow."}
        </div>
      </div>

      {paywallRenderModel ? (
        <div className="creator-badge-row">
          {workspacePaywall?.slug ? (
            <span className="creator-badge">selected {String(workspacePaywall.slug)}</span>
          ) : null}
          {workspacePaywall?.placement ? (
            <span className="creator-badge">placement {String(workspacePaywall.placement)}</span>
          ) : null}
          {paywallRenderModel.badges.map((badge) => (
            <span className="creator-badge" key={badge}>
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      <div className="creator-summary-grid">
        <div className="creator-summary-item">
          <label>Current plan</label>
          <strong>{buildCurrentPlanLabel(view)}</strong>
          <span>{view.accessProvenanceLabel}</span>
        </div>
        <div className="creator-summary-item">
          <label>Current access</label>
          <strong>{view.snapshotSummary.accessCoverage.coverageLabel}</strong>
          <span>{view.runtimeMix.assetMixLabel}</span>
        </div>
        <div className="creator-summary-item">
          <label>Credits</label>
          <strong>{view.snapshotSummary.wallet.creditsRemaining}</strong>
          <span>{view.snapshotSummary.wallet.balanceStateLabel}</span>
        </div>
        <div className="creator-summary-item">
          <label>Renewal</label>
          <strong>{formatDateTime(renewalBoundary)}</strong>
          <span>
            {view.currentSubscription?.status ? "Subscription boundary." : "Not applicable."}
          </span>
        </div>
        {view.durableUnlockSummary?.visible ? (
          <div className="creator-summary-item">
            <label>Add-on unlock</label>
            <strong>{view.durableUnlockSummary.tierLabel}</strong>
            <span>
              {view.durableUnlockSummary.additiveToSubscription
                ? "Added on top of the active membership."
                : view.durableUnlockSummary.sourceRefLabel}
            </span>
          </div>
        ) : null}
      </div>

      {paymentRefresh?.finalized &&
      String(paymentRefresh?.payment_status || "")
        .trim()
        .toLowerCase() === "completed" ? (
        <StatusBox tone="ok">
          Latest hosted checkout is applied.
          {paymentRefresh?.issuance_mode
            ? ` Issuance mode: ${formatStateLabel(paymentRefresh.issuance_mode, "access")}.`
            : ""}
        </StatusBox>
      ) : null}

      <div className="creator-list">
        {packages.map((item) => {
          const active = selected?.packageId === item.packageId;
          const purchasePolicy = getWorkspacePackagePurchasePolicy(item, view);
          const current = purchasePolicy.status === "current_recurring_plan";
          const ownedAdditiveUnlock = purchasePolicy.status === "owned_additive_unlock";
          const additiveCompanion =
            purchasePolicy.transitionKind === "buy_additive_unlock" &&
            String(view.currentSubscription?.status || "")
              .trim()
              .toLowerCase() === "active";
          const copy = buildPackageCopy(item);
          return (
            <button
              key={item.packageId}
              type="button"
              className={`creator-package ${active ? "active" : ""}`}
              onClick={() => setSelected(item)}
              style={{ textAlign: "left", cursor: "pointer" }}
            >
              <div className="creator-package-title">
                <div>
                  <h4>{item.packageTitle}</h4>
                  <p>{item.description || copy.summary}</p>
                </div>
                <span className="creator-badge">{copy.fitLabel}</span>
              </div>
              <div className="creator-badge-row">
                <span className="creator-badge">
                  {item.amount} {item.currency}
                  {item.billingPeriod ? ` / ${item.billingPeriod}` : ""}
                </span>
                <span className="creator-badge">{item.offeringTitle}</span>
                {ownedAdditiveUnlock ? <span className="creator-badge">Owned unlock</span> : null}
                {current ? <span className="creator-badge">Current plan</span> : null}
                {additiveCompanion ? (
                  <span className="creator-badge">Add-on with membership</span>
                ) : null}
                {copy.signals.slice(0, 2).map((signal) => (
                  <span className="creator-badge" key={signal}>
                    {signal}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="creator-stack">
          <StatusBox tone="ok">
            {selectedIsCurrent
              ? `${selected.packageTitle} is already active on the current scope.`
              : selectedIsAdditiveCompanion
                ? `${selected.packageTitle} is an additive unlock. It adds access on top of the active recurring membership instead of replacing it.`
                : selectedPaymentPreset?.label
                  ? `Checkout uses ${selectedPaymentPreset.label}. The workspace refreshes the latest hosted checkout automatically.`
                  : "Checkout lane is not available for the current package set."}
          </StatusBox>

          <div className="creator-actions">
            <button
              className="creator-button secondary"
              type="button"
              onClick={() => handleAppReferenceActivate(selected)}
              disabled={
                busyAction === "reference" || selectedIsCurrent || selectedIsOwnedAdditiveUnlock
              }
            >
              {selectedIsCurrent
                ? "Plan active"
                : selectedIsOwnedAdditiveUnlock
                  ? "Owned unlock active"
                  : selectedIsAdditiveCompanion
                    ? "Activate add-on unlock"
                    : busyAction === "reference"
                      ? "Activating…"
                      : "Activate plan"}
            </button>
            <button
              className="creator-button primary"
              type="button"
              onClick={() => handleAppCreatePaymentSession(selected)}
              disabled={
                busyAction === "payment" ||
                !selectedPaymentPreset ||
                selectedIsCurrent ||
                selectedIsOwnedAdditiveUnlock
              }
            >
              {selectedIsCurrent
                ? "Current plan active"
                : selectedIsOwnedAdditiveUnlock
                  ? "Owned unlock active"
                  : selectedIsAdditiveCompanion
                    ? "Purchase add-on unlock"
                    : busyAction === "payment"
                      ? "Preparing…"
                      : "Purchase plan"}
            </button>
            <button
              className="creator-button secondary"
              type="button"
              onClick={() => handleAppReconcile()}
              disabled={busyAction === "reconcile" || !lastIntentId}
            >
              {busyAction === "reconcile" ? "Checking…" : "Check payment"}
            </button>
          </div>

          {lastPaymentPageUrl ? (
            <div className="creator-inline-links">
              <a href={lastPaymentPageUrl} target="_blank" rel="noreferrer">
                Open hosted payment
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
