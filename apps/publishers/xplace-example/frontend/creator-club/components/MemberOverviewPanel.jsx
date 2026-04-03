import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import {
  buildMonetizationStateView,
  formatDateTime,
  formatStateLabel,
} from "../lib/monetizationState.js";

function buildPlanSummary(view) {
  const subscriptionStatus = String(view.currentSubscription?.status || "").trim();
  if (subscriptionStatus) {
    return {
      title: formatStateLabel(view.currentSubscription?.tier, "Active membership"),
      subtitle: formatStateLabel(subscriptionStatus, "Active"),
      sourceLabel: "Recurring membership",
    };
  }
  if (view.durableUnlockSummary?.visible) {
    return {
      title: view.durableUnlockSummary.tierLabel,
      subtitle: "Active",
      sourceLabel: "Durable unlock",
    };
  }
  return {
    title: "No active plan",
    subtitle: "Not subscribed",
    sourceLabel: "No current entitlement",
  };
}

function buildMembershipStatus(view, hasAccount, linkBusy, linkStatus, linkedHint) {
  if (linkBusy) {
    return {
      tone: "neutral",
      message: "Recovering session…",
    };
  }
  if (!hasAccount && linkStatus.linked) {
    return {
      tone: "warn",
      message: linkedHint
        ? `Linked for ${linkedHint}. Session not recovered yet.`
        : "Linked. Session not recovered yet.",
    };
  }
  if (!hasAccount) {
    return {
      tone: "warn",
      message: "No active linked session.",
    };
  }
  if (view.currentSubscription?.status) {
    return {
      tone: "ok",
      message: "Recurring membership active.",
    };
  }
  if (view.durableUnlockSummary?.visible) {
    return {
      tone: "ok",
      message: "Durable unlock active.",
    };
  }
  if (view.snapshotSummary?.accessCoverage?.available) {
    return {
      tone: "ok",
      message: "Access active on this scope.",
    };
  }
  return {
    tone: "warn",
    message: "No active membership or unlock.",
  };
}

export function MemberOverviewPanel({
  session,
  links,
  linkBusy,
  linkStatus,
  linkedHint,
  statePayload,
  lastStateRefreshAt,
}) {
  const view = buildMonetizationStateView(statePayload);
  const planSummary = buildPlanSummary(view);
  const hasAccount = Boolean(session?.account);
  const membershipStatus = buildMembershipStatus(
    view,
    hasAccount,
    linkBusy,
    linkStatus,
    linkedHint,
  );
  const renewalBoundary =
    view.currentSubscription?.renews_at || view.currentSubscription?.expires_at || null;

  return (
    <div className="creator-stack">
      <section className="creator-hero">
        <div className="creator-hero-copy">
          <p className="creator-kicker">Creator Club</p>
          <h1 className="creator-hero-title">Workspace</h1>
          <p className="creator-meta">Current account, membership, and access state.</p>
          <div className="creator-badge-row">
            <span className="creator-badge">plan {planSummary.title}</span>
            <span className="creator-badge">mix {view.runtimeMix.assetMixLabel}</span>
            <span className="creator-badge">
              credits {view.snapshotSummary.wallet.creditsRemaining}
            </span>
          </div>
        </div>
      </section>

      <div className="creator-state-board">
        <section className="creator-card creator-stack">
          <p className="creator-kicker">Membership snapshot</p>
          <StatusBox tone={membershipStatus.tone}>{membershipStatus.message}</StatusBox>

          <div className="creator-plan-highlight">
            <div className="creator-plan-highlight-main">
              <span className="creator-plan-highlight-label">Current plan</span>
              <strong>{planSummary.title}</strong>
              <span>{planSummary.subtitle}</span>
            </div>
            <div className="creator-badge-row">
              <span className="creator-badge">{planSummary.sourceLabel}</span>
              <span className="creator-badge">
                {view.snapshotSummary.accessCoverage.coverageLabel}
              </span>
            </div>
          </div>

          <div className="creator-summary-grid">
            <div className="creator-summary-item">
              <label>Access</label>
              <strong>{view.snapshotSummary.accessCoverage.coverageLabel}</strong>
              <span>{view.accessProvenanceLabel}</span>
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
            <div className="creator-summary-item">
              <label>Scope</label>
              <strong>{view.runtimeMix.scopeLabel}</strong>
              <span>{view.runtimeMix.scopeReferenceLabel}</span>
            </div>
          </div>
        </section>

        <section className="creator-card creator-stack">
          <p className="creator-kicker">Account and session</p>
          {hasAccount ? (
            <StatusBox tone="ok">
              Signed in as <strong>{session.account.display_name}</strong> ({session.account.email})
            </StatusBox>
          ) : (
            <StatusBox tone="warn">
              {linkedHint ? `Waiting for ${linkedHint}.` : "No linked session."}
            </StatusBox>
          )}

          <div className="creator-summary-grid">
            <div className="creator-summary-item">
              <label>Display name</label>
              <strong>{session?.account?.display_name || "Guest session"}</strong>
              <span>Session identity.</span>
            </div>
            <div className="creator-summary-item">
              <label>Email</label>
              <strong>{session?.account?.email || linkedHint || "Not available"}</strong>
              <span>Primary contact.</span>
            </div>
            <div className="creator-summary-item">
              <label>Asset mix</label>
              <strong>{view.runtimeMix.assetMixLabel}</strong>
              <span>Current entitlement mix.</span>
            </div>
            <div className="creator-summary-item">
              <label>Last refresh</label>
              <strong>{formatDateTime(lastStateRefreshAt)}</strong>
              <span>Auto-updated.</span>
            </div>
          </div>

          <div className="creator-inline-links">
            {links?.portal_marketplace_xapp ? (
              <a href={links.portal_marketplace_xapp} target="_blank" rel="noreferrer">
                Marketplace listing
              </a>
            ) : null}
            {links?.publisher_xapp_detail ? (
              <a href={links.publisher_xapp_detail} target="_blank" rel="noreferrer">
                Publisher xapp
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
