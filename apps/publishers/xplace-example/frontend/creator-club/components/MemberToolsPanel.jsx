import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import { buildFeatureCopyModel } from "../lib/featureCopy.js";

function describeFeatureUsage(feature) {
  const credits = Number(feature?.requirements?.credits || 0);
  if (credits > 0 && feature?.requirements?.currentAccess) {
    return `Consumes ${credits} credits and also expects active access coverage.`;
  }
  if (credits > 0) {
    return `Consumes ${credits} credits per run.`;
  }
  if (feature?.requirements?.subscription) {
    return "Available to members with recurring subscription coverage.";
  }
  if (feature?.requirements?.currentAccess) {
    return "Available whenever the current scope has active access.";
  }
  return "Available when the current monetization state allows it.";
}

function buildActionHint(feature, featureCopy) {
  const credits = Number(feature?.requirements?.credits || 0);
  if (credits > 0 && feature.available) {
    return `${credits} credits will be consumed on run.`;
  }
  if (credits > 0) {
    return `${credits} credits required.`;
  }
  if (feature?.requirements?.subscription) {
    return `Membership state: ${featureCopy.subscriptionLabel}.`;
  }
  return "Uses current access state.";
}

export function MemberToolsPanel({
  features,
  statePayload,
  lastFeatureResult,
  busyAction,
  handleRunFeature,
  openUpgradeOptions,
}) {
  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Tools</p>
          <h2>Available tools.</h2>
        </div>
        <div className="creator-meta">Backed by current XMS state.</div>
      </div>

      {lastFeatureResult ? (
        <StatusBox tone={lastFeatureResult.ok ? "ok" : "warn"}>
          <strong>{lastFeatureResult.feature?.title || "Latest tool result"}</strong>
          <div>{lastFeatureResult.message}</div>
          {lastFeatureResult.execution?.credits_consumed ? (
            <div style={{ marginTop: "6px" }}>
              {lastFeatureResult.execution.credits_consumed} credits consumed
            </div>
          ) : null}
        </StatusBox>
      ) : null}

      <div className="creator-tool-grid">
        {features.map((feature) => {
          const featureCopy = buildFeatureCopyModel({
            feature,
            statePayload,
            featurePaywall: null,
          });
          return (
            <article className="creator-tool-card" key={feature.key}>
              <div className="creator-feature-head">
                <div>
                  <strong>{feature.title}</strong>
                  <div className="creator-meta">{feature.description}</div>
                </div>
                <span className="creator-badge">{featureCopy.statusLabel}</span>
              </div>
              <div className="creator-meta">{describeFeatureUsage(feature)}</div>
              <div className="creator-badge-row">
                <span className="creator-badge">mix {featureCopy.assetMixLabel}</span>
                <span className="creator-badge">coverage {featureCopy.coverageLabel}</span>
                {feature.requirements?.subscription ? (
                  <span className="creator-badge">membership required</span>
                ) : null}
                {feature.requirements?.credits ? (
                  <span className="creator-badge">{feature.requirements.credits} credit spend</span>
                ) : null}
              </div>
              <div className="creator-meta">{buildActionHint(feature, featureCopy)}</div>
              {feature.available ? (
                <div className="creator-actions">
                  <button
                    className="creator-button primary"
                    type="button"
                    onClick={() => handleRunFeature(feature.key)}
                    disabled={busyAction === feature.key}
                  >
                    {busyAction === feature.key
                      ? "Running…"
                      : feature.requirements?.credits
                        ? `${feature.requirements.credits} credits`
                        : "Run"}
                  </button>
                </div>
              ) : (
                <div className="creator-stack">
                  <StatusBox tone="warn">
                    {feature.reasons?.[0] || "This tool is currently blocked."}
                  </StatusBox>
                  <div className="creator-actions">
                    <button
                      className="creator-button warn"
                      type="button"
                      onClick={() => openUpgradeOptions(feature)}
                    >
                      Review options
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
