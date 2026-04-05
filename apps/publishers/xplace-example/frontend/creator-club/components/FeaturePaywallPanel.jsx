import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import { buildPackageCopy } from "../lib/packageCopy.js";

export function FeaturePaywallPanel({
  activePaywallFeature,
  featurePaywall,
  featureCopy,
  closePaywall,
  setSelected,
  busyAction,
  handleReferenceActivate,
  handleCreatePaymentSession,
  handleReconcile,
  lastIntentId,
  lastPaymentPageUrl,
}) {
  if (!activePaywallFeature || !featurePaywall) return null;

  return (
    <section className="creator-card">
      <div className="creator-paywall">
        <div className="creator-paywall-head">
          <div>
            <p className="creator-kicker">Feature paywall</p>
            <h3 style={{ margin: 0 }}>{activePaywallFeature.title}</h3>
            <div className="creator-meta">{activePaywallFeature.description}</div>
          </div>
          <div className="creator-actions">
            <span className="creator-badge">preview open</span>
            <button className="creator-button secondary" type="button" onClick={closePaywall}>
              Close paywall
            </button>
          </div>
        </div>
        {featureCopy ? (
          <div className="creator-stack">
            <StatusBox tone="warn">{featureCopy.summary}</StatusBox>
            <div className="creator-badge-row">
              <span className="creator-badge">mix {featureCopy.assetMixLabel}</span>
              <span className="creator-badge">coverage {featureCopy.coverageLabel}</span>
              <span className="creator-badge">membership {featureCopy.subscriptionLabel}</span>
              <span className="creator-badge">credits {featureCopy.creditsLabel}</span>
              {featureCopy.gapBadges.map((badge) => (
                <span className="creator-badge" key={badge}>
                  {badge}
                </span>
              ))}
            </div>
            {featureCopy.missingLines.length > 1 ? (
              <div className="creator-meta">{featureCopy.missingLines.slice(1).join(" ")}</div>
            ) : null}
            <div className="creator-meta">
              {featureCopy.candidateLead || featureCopy.recommendationLead}
            </div>
          </div>
        ) : null}
        {activePaywallFeature.reasons?.length ? (
          <StatusBox tone="warn">{activePaywallFeature.reasons[0]}</StatusBox>
        ) : null}
        <div className="creator-paywall-options">
          {(featurePaywall.candidatePackages?.length
            ? featurePaywall.candidatePackages
            : featurePaywall.rankedPackages?.length
              ? featurePaywall.rankedPackages
              : featurePaywall.allPackages
          ).map((item) => {
            const active = featurePaywall.activePackage?.packageId === item.packageId;
            const copy = buildPackageCopy(item);
            return (
              <button
                key={item.packageId}
                type="button"
                className={`creator-paywall-option ${active ? "active" : ""}`}
                onClick={() => setSelected(item)}
              >
                <div className="creator-package-title">
                  <div>
                    <strong>{item.packageTitle}</strong>
                    <p>{item.description || copy.summary}</p>
                  </div>
                  <span className="creator-badge">{item.moneyLabel}</span>
                </div>
                <div className="creator-badge-row">
                  <span className="creator-badge">{copy.fitLabel}</span>
                  <span className="creator-badge">{item.offeringTitle}</span>
                  {copy.signals.slice(0, 2).map((signal) => (
                    <span className="creator-badge" key={signal}>
                      {signal}
                    </span>
                  ))}
                </div>
                {item.candidateReasons?.length || item.recommendationReasons?.length ? (
                  <div className="creator-paywall-reasons">
                    {(item.candidateReasons || item.recommendationReasons)
                      .slice(0, 2)
                      .map((reason) => (
                        <div key={reason}>{reason}</div>
                      ))}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="creator-actions">
          <button
            className="creator-button primary"
            type="button"
            onClick={() => handleReferenceActivate(featurePaywall.activePackage)}
            disabled={!featurePaywall.activePackage || busyAction === "reference"}
          >
            {busyAction === "reference" ? "Issuing..." : "Reference activate"}
          </button>
          <button
            className="creator-button secondary"
            type="button"
            onClick={() => handleCreatePaymentSession(featurePaywall.activePackage)}
            disabled={!featurePaywall.activePackage || busyAction === "payment"}
          >
            {busyAction === "payment"
              ? "Preparing..."
              : featureCopy?.ctaLabel || "Create payment session"}
          </button>
          <button
            className="creator-button warn"
            type="button"
            onClick={handleReconcile}
            disabled={!lastIntentId || busyAction === "reconcile"}
          >
            {busyAction === "reconcile" ? "Reconciling..." : "Reconcile latest payment"}
          </button>
        </div>
        {lastPaymentPageUrl ? (
          <div className="creator-inline-links">
            <a href={lastPaymentPageUrl} target="_blank" rel="noreferrer">
              Open hosted payment page
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
