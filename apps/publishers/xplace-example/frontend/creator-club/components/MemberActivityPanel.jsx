import React from "react";
import {
  buildMonetizationStateView,
  formatDateTime,
  formatStateLabel,
} from "../lib/monetizationState.js";

function formatAmount(value, currency = "") {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  const normalizedCurrency = String(currency || "")
    .trim()
    .toUpperCase();
  return normalizedCurrency ? `${raw} ${normalizedCurrency}` : raw;
}

function buildLedgerSummary(entry) {
  const kind = formatStateLabel(entry?.event_kind, "activity");
  const amount = formatAmount(entry?.amount, entry?.currency);
  const sourceRef = String(entry?.source_ref || "").trim();
  return {
    title: `${kind} · ${amount}`,
    subtitle: sourceRef ? `Source ${formatStateLabel(sourceRef)}` : "Wallet activity",
    meta: formatDateTime(entry?.occurred_at),
  };
}

function buildTransactionSummary(entry) {
  const status = formatStateLabel(entry?.status, "unknown");
  const amount = formatAmount(entry?.amount, entry?.currency);
  return {
    title: `${status} transaction`,
    subtitle: amount !== "—" ? amount : "Purchase transaction",
    meta: formatDateTime(entry?.occurred_at),
  };
}

function buildPurchaseSummary(intent) {
  const packageLabel = formatStateLabel(intent?.package?.slug || intent?.package?.id, "package");
  return {
    title: `${packageLabel} purchase`,
    subtitle: formatStateLabel(intent?.status, "current state"),
    meta: formatDateTime(intent?.updated_at || intent?.created_at),
  };
}

function buildPrimaryActivity({ latestPurchase, latestTransaction, latestLedger }) {
  if (latestTransaction) {
    return {
      label: "Latest transaction",
      title: formatStateLabel(latestTransaction?.status, "unknown"),
      subtitle:
        formatAmount(latestTransaction?.amount, latestTransaction?.currency) || "Transaction",
      meta: formatDateTime(latestTransaction?.occurred_at),
    };
  }
  if (latestPurchase) {
    return {
      label: "Latest purchase",
      title: formatStateLabel(
        latestPurchase?.package?.slug || latestPurchase?.package?.id,
        "Purchase recorded",
      ),
      subtitle: `State ${formatStateLabel(latestPurchase?.status, "unknown").toLowerCase()}`,
      meta: formatDateTime(latestPurchase?.updated_at || latestPurchase?.created_at),
    };
  }
  if (latestLedger) {
    return {
      label: "Latest wallet activity",
      title: formatStateLabel(latestLedger?.event_kind, "activity"),
      subtitle: formatAmount(latestLedger?.amount, latestLedger?.currency),
      meta: formatDateTime(latestLedger?.occurred_at),
    };
  }
  return null;
}

export function MemberActivityPanel({ statePayload }) {
  const view = buildMonetizationStateView(statePayload);
  const latestLedger = view.walletLedger[0] || null;
  const latestTransaction = view.recentTransactions[0] || null;
  const latestPurchase = view.recentPurchaseIntent;
  const primaryActivity = buildPrimaryActivity({
    latestPurchase,
    latestTransaction,
    latestLedger,
  });
  const activityItems = [
    latestPurchase ? buildPurchaseSummary(latestPurchase) : null,
    latestTransaction ? buildTransactionSummary(latestTransaction) : null,
    latestLedger ? buildLedgerSummary(latestLedger) : null,
  ].filter(Boolean);

  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Activity</p>
          <h2>Recent activity.</h2>
        </div>
        <div className="creator-meta">Current scope.</div>
      </div>

      {primaryActivity ? (
        <div className="creator-plan-highlight">
          <div className="creator-plan-highlight-main">
            <span className="creator-plan-highlight-label">{primaryActivity.label}</span>
            <strong>{primaryActivity.title}</strong>
            <span>{primaryActivity.subtitle}</span>
          </div>
          <div className="creator-badge-row">
            <span className="creator-badge">{primaryActivity.meta}</span>
          </div>
        </div>
      ) : null}

      <div className="creator-summary-grid">
        <div className="creator-summary-item">
          <label>Latest purchase</label>
          <strong>
            {latestPurchase
              ? formatStateLabel(
                  latestPurchase?.package?.slug || latestPurchase?.package?.id,
                  "Purchase recorded",
                )
              : "No recent purchase"}
          </strong>
          <span>
            {latestPurchase
              ? `State ${formatStateLabel(latestPurchase?.status, "unknown").toLowerCase()}`
              : "None."}
          </span>
        </div>
        <div className="creator-summary-item">
          <label>Latest transaction</label>
          <strong>
            {latestTransaction
              ? formatStateLabel(latestTransaction?.status, "unknown")
              : "No recent transaction"}
          </strong>
          <span>
            {latestTransaction
              ? formatAmount(latestTransaction?.amount, latestTransaction?.currency)
              : "None."}
          </span>
        </div>
        <div className="creator-summary-item">
          <label>Latest wallet activity</label>
          <strong>
            {latestLedger
              ? formatStateLabel(latestLedger?.event_kind, "activity")
              : "No wallet activity"}
          </strong>
          <span>
            {latestLedger ? formatAmount(latestLedger?.amount, latestLedger?.currency) : "None."}
          </span>
        </div>
        <div className="creator-summary-item">
          <label>Durable unlock</label>
          <strong>
            {view.durableUnlockSummary?.visible
              ? view.durableUnlockSummary.tierLabel
              : "No durable unlock inferred"}
          </strong>
          <span>
            {view.durableUnlockSummary?.visible
              ? view.durableUnlockSummary.sourceRefLabel
              : "None visible."}
          </span>
        </div>
      </div>

      {activityItems.length ? (
        <div className="creator-detail-list">
          {activityItems.slice(0, 2).map((item, index) => (
            <article className="creator-detail-card" key={`${item.title}:${item.meta}`}>
              <div className="creator-detail-head">
                <div className="creator-detail-title">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
                <span className="creator-badge">{index === 0 ? "Most recent" : item.meta}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="creator-empty">No recent activity.</div>
      )}
    </section>
  );
}
