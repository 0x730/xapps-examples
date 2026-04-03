import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import { buildFeatureCopyModel } from "../lib/featureCopy.js";

export function FeaturePlaygroundPanel({
  features,
  statePayload,
  lastFeatureResult,
  busyAction,
  handleRunFeature,
  openPaywall,
}) {
  return (
    <div className="creator-wide-grid">
      <section className="creator-card creator-stack">
        <p className="creator-kicker">Feature playground</p>
        {lastFeatureResult ? (
          <StatusBox tone={lastFeatureResult.ok ? "ok" : "warn"}>
            <strong>{lastFeatureResult.feature?.title || "Feature result"}</strong>
            <div>{lastFeatureResult.message}</div>
            {Array.isArray(lastFeatureResult.feature?.reasons) &&
            lastFeatureResult.feature.reasons.length ? (
              <div style={{ marginTop: "6px" }}>
                Blocking reason: {lastFeatureResult.feature.reasons[0]}
              </div>
            ) : null}
          </StatusBox>
        ) : null}
        <div className="creator-list">
          {features.map((feature) => {
            const featureCopy = buildFeatureCopyModel({
              feature,
              statePayload,
              featurePaywall: null,
            });
            return (
              <div className="creator-feature" key={feature.key}>
                <div className="creator-feature-head">
                  <div>
                    <strong>{feature.title}</strong>
                    <div className="creator-meta">{feature.description}</div>
                  </div>
                  <span className="creator-badge">{featureCopy.statusLabel}</span>
                </div>
                {feature.reasons?.length ? (
                  <StatusBox tone="warn">{feature.reasons[0]}</StatusBox>
                ) : (
                  <div className="creator-meta">
                    {feature.title} is available on the current scope and can run now.
                  </div>
                )}
                <div className="creator-actions">
                  {feature.available ? (
                    <button
                      className="creator-button secondary"
                      type="button"
                      onClick={() => handleRunFeature(feature.key)}
                      disabled={busyAction === feature.key}
                    >
                      {busyAction === feature.key ? "Running..." : "Run feature"}
                    </button>
                  ) : (
                    <button
                      className="creator-button warn"
                      type="button"
                      onClick={() => openPaywall(feature)}
                    >
                      {featureCopy.openPaywallLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
