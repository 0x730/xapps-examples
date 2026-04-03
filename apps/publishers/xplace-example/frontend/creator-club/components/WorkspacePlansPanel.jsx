import React from "react";
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

export function WorkspacePlansPanel({
  statePayload,
  packages,
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
  const renewalBoundary =
    view.currentSubscription?.renews_at || view.currentSubscription?.expires_at || null;

  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Plans</p>
          <h2>Choose and activate a plan.</h2>
        </div>
        <div className="creator-meta">Main app purchase flow.</div>
      </div>

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
      </div>

      <div className="creator-list">
        {packages.map((item) => {
          const active = selected?.packageId === item.packageId;
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
            {selectedPaymentPreset?.label
              ? `Checkout uses ${selectedPaymentPreset.label}.`
              : "Checkout lane is not available for the current package set."}
          </StatusBox>

          <div className="creator-actions">
            <button
              className="creator-button secondary"
              type="button"
              onClick={() => handleAppReferenceActivate(selected)}
              disabled={busyAction === "reference"}
            >
              {busyAction === "reference" ? "Activating…" : "Activate plan"}
            </button>
            <button
              className="creator-button primary"
              type="button"
              onClick={() => handleAppCreatePaymentSession(selected)}
              disabled={busyAction === "payment" || !selectedPaymentPreset}
            >
              {busyAction === "payment" ? "Preparing…" : "Purchase plan"}
            </button>
            <button
              className="creator-button secondary"
              type="button"
              onClick={() => handleAppReconcile()}
              disabled={busyAction === "reconcile" || !lastIntentId}
            >
              {busyAction === "reconcile" ? "Refreshing…" : "Refresh payment status"}
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
