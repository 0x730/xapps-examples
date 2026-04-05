import React from "react";
import {
  buildMonetizationPaywallHtml,
  buildMonetizationPaywallRenderModel,
  monetizationPaywallRendererStyles,
} from "../../../../../../packages/browser-host/dist/index.js";
import { buildFeatureCopyModel } from "../lib/featureCopy.js";

export function PaywallGalleryPanel({
  features,
  statePayload,
  openPaywall,
  paywalls = [],
  workspacePaywallSlug = "",
}) {
  return (
    <section className="creator-card creator-stack">
      <style>{monetizationPaywallRendererStyles}</style>
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
      {paywalls.length ? (
        <div className="creator-stack">
          <div className="creator-badge-row">
            {paywalls.map((item) => {
              const renderModel = buildMonetizationPaywallRenderModel(item);
              const itemSlug = String(item.slug || "").trim();
              return (
                <span className="creator-badge" key={String(item.slug || renderModel.paywallLabel)}>
                  {renderModel.paywallLabel} · {renderModel.packageCountLabel}
                  {workspacePaywallSlug && itemSlug === workspacePaywallSlug
                    ? " · workspace-selected"
                    : ""}
                </span>
              );
            })}
          </div>
          {paywalls.map((item) => {
            const renderModel = buildMonetizationPaywallRenderModel(item);
            const itemSlug = String(item.slug || "").trim();
            return (
              <div key={String(item.slug || renderModel.paywallLabel)} className="creator-stack">
                <div className="creator-badge-row">
                  {itemSlug ? <span className="creator-badge">slug {itemSlug}</span> : null}
                  {item.placement ? (
                    <span className="creator-badge">placement {String(item.placement)}</span>
                  ) : null}
                  {workspacePaywallSlug && itemSlug === workspacePaywallSlug ? (
                    <span className="creator-badge">selected by workspace flow</span>
                  ) : null}
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildMonetizationPaywallHtml(item, {
                      actionLabel: "Choose plan",
                      interactive: false,
                    }),
                  }}
                />
              </div>
            );
          })}
        </div>
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
