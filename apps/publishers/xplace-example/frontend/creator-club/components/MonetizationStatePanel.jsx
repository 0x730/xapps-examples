import React from "react";
import {
  buildMonetizationStateView,
  formatDateTime,
  formatScopeReference,
  formatStateLabel,
} from "../lib/monetizationState.js";

function renderSourceMeta(sourceKind, stateVersion) {
  return `${formatStateLabel(sourceKind, "unknown source")} · state version ${formatStateLabel(
    stateVersion,
  )}`;
}

export function MonetizationStatePanel({ statePayload }) {
  const view = buildMonetizationStateView(statePayload);
  const {
    accessProjection,
    currentSubscription,
    walletAccounts,
    walletLedger,
    recentTransactions,
    recentPurchaseIntent,
    snapshotSummary,
    runtimeMix,
    accessProvenanceLabel,
    durableUnlockSummary,
  } = view;

  return (
    <section className="creator-card creator-stack">
      <p className="creator-kicker">Monetization state</p>
      <div className="creator-state-board">
        <section className="creator-state-block">
          <h3>Runtime mix</h3>
          <div className="creator-mix-grid">
            <div className="creator-summary-item">
              <label>Asset mix</label>
              <strong>{runtimeMix.assetMixLabel}</strong>
              <span>Resolved from the current access, subscription, and wallet snapshot.</span>
            </div>
            <div className="creator-summary-item">
              <label>Scope kind</label>
              <strong>{runtimeMix.scopeLabel}</strong>
              <span>The runtime scope used for the latest XMS read.</span>
            </div>
            <div className="creator-summary-item">
              <label>Scope reference</label>
              <strong>{runtimeMix.scopeReferenceLabel}</strong>
              <span>Subject, installation, or realm currently driving this state.</span>
            </div>
            <div className="creator-summary-item">
              <label>Wallet accounts</label>
              <strong>{runtimeMix.walletCountLabel}</strong>
              <span>Stored wallet rows currently attached to this scope.</span>
            </div>
          </div>
        </section>

        <section className="creator-state-block">
          <h3>Access coverage</h3>
          {Object.keys(accessProjection).length ? (
            <div className="creator-summary-grid">
              <div className="creator-summary-item">
                <label>Coverage</label>
                <strong>{snapshotSummary.accessCoverage.coverageLabel}</strong>
                <span>Derived from the current XMS access projection.</span>
              </div>
              <div className="creator-summary-item">
                <label>Access state</label>
                <strong>{snapshotSummary.accessCoverage.accessStateLabel}</strong>
                <span>Underlying entitlement state returned by XMS.</span>
              </div>
              <div className="creator-summary-item">
                <label>Tier</label>
                <strong>{snapshotSummary.accessCoverage.tierLabel}</strong>
                <span>Current access tier carried by the resolved projection.</span>
              </div>
              <div className="creator-summary-item">
                <label>Provenance</label>
                <strong>{accessProvenanceLabel}</strong>
                <span>Best current explanation for what is driving this access state.</span>
              </div>
              <div className="creator-summary-item">
                <label>Current access</label>
                <strong>{snapshotSummary.wallet.currentAccessLabel}</strong>
                <span>Fast answer for whether the current scope is usable right now.</span>
              </div>
              <div className="creator-summary-item">
                <label>State version</label>
                <strong>{formatStateLabel(accessProjection?.state_version)}</strong>
                <span>Useful when comparing repeated refreshes on the same scope.</span>
              </div>
            </div>
          ) : (
            <div className="creator-empty">
              No access projection is available yet for the current scope.
            </div>
          )}
        </section>

        <section className="creator-state-block">
          <h3>Durable unlock / entitlement</h3>
          {durableUnlockSummary?.visible ? (
            <div className="creator-summary-grid">
              <div className="creator-summary-item">
                <label>Status</label>
                <strong>{durableUnlockSummary.statusLabel}</strong>
                <span>Best current entitlement-style state inferred for this scope.</span>
              </div>
              <div className="creator-summary-item">
                <label>Tier</label>
                <strong>{durableUnlockSummary.tierLabel}</strong>
                <span>Current unlock tier visible through the access projection.</span>
              </div>
              <div className="creator-summary-item">
                <label>Coverage</label>
                <strong>{durableUnlockSummary.coverageLabel}</strong>
                <span>Whether the inferred unlock currently grants access.</span>
              </div>
              <div className="creator-summary-item">
                <label>Source</label>
                <strong>{durableUnlockSummary.sourceRefLabel}</strong>
                <span>Current projection source reference for the inferred unlock.</span>
              </div>
              <div className="creator-summary-item">
                <label>State version</label>
                <strong>{durableUnlockSummary.stateVersionLabel}</strong>
                <span>Useful when comparing repeated refreshes of the same unlock state.</span>
              </div>
              <div className="creator-summary-item">
                <label>Recent package</label>
                <strong>{durableUnlockSummary.recentPackageLabel}</strong>
                <span>Most recent package contributing provenance when available.</span>
              </div>
              <div className="creator-summary-item">
                <label>Purchase intent</label>
                <strong>{durableUnlockSummary.purchaseIntentLabel}</strong>
                <span>Latest intent linked to this inferred unlock path.</span>
              </div>
              <div className="creator-summary-item">
                <label>Latest transaction</label>
                <strong>{durableUnlockSummary.transactionLabel}</strong>
                <span>{durableUnlockSummary.transactionStatusLabel}</span>
              </div>
              <div className="creator-summary-item">
                <label>Inference</label>
                <strong>Likely durable unlock</strong>
                <span>{durableUnlockSummary.inferenceReason}</span>
              </div>
            </div>
          ) : (
            <div className="creator-empty">
              No durable unlock is currently inferred for this scope. Access may instead be coming
              from an active subscription, credits, or no monetized asset at all.
            </div>
          )}
        </section>

        <section className="creator-state-block">
          <h3>Current subscription</h3>
          {Object.keys(currentSubscription).length ? (
            <div className="creator-summary-grid">
              <div className="creator-summary-item">
                <label>Status</label>
                <strong>{snapshotSummary.currentSubscription.statusLabel}</strong>
                <span>Current subscription lifecycle status from XMS.</span>
              </div>
              <div className="creator-summary-item">
                <label>Plan tier</label>
                <strong>{snapshotSummary.currentSubscription.tierLabel}</strong>
                <span>Active subscription tier currently covering this scope.</span>
              </div>
              <div className="creator-summary-item">
                <label>Coverage</label>
                <strong>{snapshotSummary.currentSubscription.coverageLabel}</strong>
                <span>{snapshotSummary.currentSubscription.coverageReasonLabel}</span>
              </div>
              <div className="creator-summary-item">
                <label>Renews at</label>
                <strong>{formatDateTime(snapshotSummary.currentSubscription.renewsAt)}</strong>
                <span>Next renewal boundary reported by XMS.</span>
              </div>
              <div className="creator-summary-item">
                <label>Expires at</label>
                <strong>{formatDateTime(snapshotSummary.currentSubscription.expiresAt)}</strong>
                <span>Current paid period end for this subscription.</span>
              </div>
              <div className="creator-summary-item">
                <label>Payment session</label>
                <strong>{snapshotSummary.currentSubscription.paymentSessionIdLabel}</strong>
                <span>Last linked hosted payment session when one exists.</span>
              </div>
              <div className="creator-summary-item">
                <label>Source</label>
                <strong>{formatStateLabel(currentSubscription?.source_ref)}</strong>
                <span>Source reference for the current subscription contract.</span>
              </div>
            </div>
          ) : (
            <div className="creator-empty">
              No active subscription is returned for the selected scope.
            </div>
          )}
        </section>

        <section className="creator-state-block">
          <h3>Wallet / credits</h3>
          <div className="creator-summary-grid">
            <div className="creator-summary-item">
              <label>Credits remaining</label>
              <strong>{snapshotSummary.wallet.creditsRemaining}</strong>
              <span>Current usable credit balance from the access projection.</span>
            </div>
            <div className="creator-summary-item">
              <label>Balance state</label>
              <strong>{snapshotSummary.wallet.balanceStateLabel}</strong>
              <span>Wallet/balance state currently exposed by XMS.</span>
            </div>
            <div className="creator-summary-item">
              <label>Current access</label>
              <strong>{snapshotSummary.wallet.currentAccessLabel}</strong>
              <span>Useful when credits and access coverage coexist.</span>
            </div>
          </div>
          {walletAccounts.length ? (
            <div className="creator-detail-list">
              {walletAccounts.map((account, index) => (
                <div
                  className="creator-detail-card"
                  key={String(account?.id || account?.product_slug || `wallet-${index}`)}
                >
                  <div className="creator-detail-head">
                    <div className="creator-detail-title">
                      <strong>
                        {String(account?.product_slug || account?.product_id || "wallet account")}
                      </strong>
                      <span>{String(account?.id || "").trim() || "wallet id unavailable"}</span>
                    </div>
                    <span className="creator-badge">
                      {formatStateLabel(account?.status, "unknown")}
                    </span>
                  </div>
                  <div className="creator-badge-row">
                    <span className="creator-badge">
                      balance {String(account?.balance_remaining || "0")}{" "}
                      {String(account?.currency || "").trim() || "credits"}
                    </span>
                    <span className="creator-badge">
                      {formatScopeReference(
                        account?.subject_id,
                        account?.installation_id,
                        account?.realm_ref,
                      )}
                    </span>
                    <span className="creator-badge">
                      source {formatStateLabel(account?.source_ref, "—")}
                    </span>
                  </div>
                  <div className="creator-meta">
                    {renderSourceMeta(account?.source_kind, account?.state_version)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="creator-empty">
              No wallet accounts are currently stored for this scope, even if the access projection
              reports a credit-derived balance.
            </div>
          )}
        </section>

        <section className="creator-state-block">
          <h3>Wallet ledger</h3>
          {walletLedger.length ? (
            <div className="creator-detail-list">
              {walletLedger.slice(0, 5).map((entry, index) => (
                <div
                  className="creator-detail-card"
                  key={String(entry?.id || `${entry?.wallet_account_id || "ledger"}-${index}`)}
                >
                  <div className="creator-detail-head">
                    <div className="creator-detail-title">
                      <strong>{formatStateLabel(entry?.event_kind, "ledger event")}</strong>
                      <span>{String(entry?.id || "").trim() || "ledger id unavailable"}</span>
                    </div>
                    <span className="creator-badge">
                      {String(entry?.amount || "0")} {String(entry?.currency || "").trim() || "—"}
                    </span>
                  </div>
                  <div className="creator-badge-row">
                    <span className="creator-badge">
                      wallet {String(entry?.wallet_product_slug || entry?.wallet_account_id || "—")}
                    </span>
                    <span className="creator-badge">{formatDateTime(entry?.occurred_at)}</span>
                    {entry?.payment_session_id ? (
                      <span className="creator-badge">
                        session {String(entry.payment_session_id)}
                      </span>
                    ) : null}
                  </div>
                  <div className="creator-meta">
                    {formatStateLabel(entry?.source_kind, "unknown source")}
                    {entry?.source_ref ? ` · ${formatStateLabel(entry.source_ref)}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="creator-empty">
              No wallet ledger entries are visible yet for the selected scope.
            </div>
          )}
        </section>

        <section className="creator-state-block">
          <h3>Recent purchase activity</h3>
          {Object.keys(recentPurchaseIntent).length || recentTransactions.length ? (
            <div className="creator-stack">
              {Object.keys(recentPurchaseIntent).length ? (
                <div className="creator-summary-grid">
                  <div className="creator-summary-item">
                    <label>Intent</label>
                    <strong>
                      {String(recentPurchaseIntent?.purchase_intent_id || "").trim() || "—"}
                    </strong>
                    <span>Latest purchase intent currently attached to this view.</span>
                  </div>
                  <div className="creator-summary-item">
                    <label>Status</label>
                    <strong>{formatStateLabel(recentPurchaseIntent?.status, "unknown")}</strong>
                    <span>Current lifecycle state of the recent intent.</span>
                  </div>
                  <div className="creator-summary-item">
                    <label>Package</label>
                    <strong>
                      {formatStateLabel(
                        recentPurchaseIntent?.package?.slug ||
                          recentPurchaseIntent?.package?.id ||
                          "",
                        "—",
                      )}
                    </strong>
                    <span>Package currently tied to the recent intent.</span>
                  </div>
                  <div className="creator-summary-item">
                    <label>Price</label>
                    <strong>
                      {String(recentPurchaseIntent?.price?.amount || "—")}{" "}
                      {String(recentPurchaseIntent?.price?.currency || "").trim()}
                    </strong>
                    <span>Resolved price currently carried by the recent intent.</span>
                  </div>
                  <div className="creator-summary-item">
                    <label>Payment lane</label>
                    <strong>{formatStateLabel(recentPurchaseIntent?.payment_lane, "—")}</strong>
                    <span>Lane recorded by XMS when this intent was prepared.</span>
                  </div>
                  <div className="creator-summary-item">
                    <label>Source</label>
                    <strong>{formatStateLabel(recentPurchaseIntent?.source_ref, "—")}</strong>
                    <span>
                      Useful for understanding durable unlock or hosted purchase provenance.
                    </span>
                  </div>
                </div>
              ) : null}
              {recentTransactions.length ? (
                <div className="creator-detail-list">
                  {recentTransactions.slice(0, 4).map((transaction, index) => (
                    <div
                      className="creator-detail-card"
                      key={String(transaction?.id || `transaction-${index}`)}
                    >
                      <div className="creator-detail-head">
                        <div className="creator-detail-title">
                          <strong>{formatStateLabel(transaction?.status, "transaction")}</strong>
                          <span>
                            {String(transaction?.id || "").trim() || "transaction id unavailable"}
                          </span>
                        </div>
                        <span className="creator-badge">
                          {String(transaction?.amount || "0")}{" "}
                          {String(transaction?.currency || "").trim() || "—"}
                        </span>
                      </div>
                      <div className="creator-badge-row">
                        <span className="creator-badge">
                          {formatDateTime(transaction?.occurred_at)}
                        </span>
                        {transaction?.payment_session_id ? (
                          <span className="creator-badge">
                            session {String(transaction.payment_session_id)}
                          </span>
                        ) : null}
                        {transaction?.provider_ref ? (
                          <span className="creator-badge">
                            provider {String(transaction.provider_ref)}
                          </span>
                        ) : null}
                      </div>
                      <div className="creator-meta">
                        evidence {formatStateLabel(transaction?.evidence_ref, "—")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="creator-empty">
                  No transactions have been recorded yet for the recent purchase intent.
                </div>
              )}
            </div>
          ) : (
            <div className="creator-empty">
              No recent purchase intent is attached yet. Create a hosted payment session or use
              reference activation to populate this activity view.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
