import React from "react";
import { buildFeatureCopyModel } from "../lib/featureCopy.js";

export function PaywallGalleryPanel({ features, statePayload, openPaywall }) {
  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Paywall gallery</p>
          <h2>Preview every in-app paywall entry point.</h2>
        </div>
        <div className="creator-meta">
          Technical page only. Use this to inspect the current paywall presentation regardless of
          whether the tool is already available.
        </div>
      </div>
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
              <div className="creator-meta">
                {featureCopy.summary || "Preview the paywall for this feature path."}
              </div>
              <div className="creator-actions">
                <button
                  className="creator-button secondary"
                  type="button"
                  onClick={() => openPaywall(feature)}
                >
                  Preview paywall
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
