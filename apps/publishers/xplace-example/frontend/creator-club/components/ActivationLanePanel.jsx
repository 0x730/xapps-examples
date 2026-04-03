import React from "react";
import { buildPaymentLaneCopy } from "../lib/paymentLaneCopy.js";

export function ActivationLanePanel({
  selected,
  selectedXmsMode,
  paymentPresets,
  selectedPaymentPreset,
  setPaymentPresetKey,
  busyAction,
  handleReferenceActivate,
  handleCreatePaymentSession,
  handleReconcile,
  lastIntentId,
  lastPaymentPageUrl,
  lastPaymentRuntime,
  scopeKind,
  realmRef,
}) {
  const copy = buildPaymentLaneCopy({
    selectedPackage: selected,
    selectedXmsMode,
    selectedPaymentPreset,
  });

  return (
    <section className="creator-card creator-stack">
      <p className="creator-kicker">Activation lane</p>
      <div className="creator-meta">
        Selected package: <strong>{copy.packageLabel}</strong>
      </div>
      {selected ? (
        <div className="creator-meta">
          XMS mode: <strong>{copy.modeLabel}</strong>
          {" • "}
          {copy.modeDescription}
        </div>
      ) : null}
      <div className="creator-field">
        <label>Payment lane / definition</label>
        <select
          value={selectedPaymentPreset?.key || ""}
          onChange={(event) => setPaymentPresetKey(event.target.value)}
        >
          {paymentPresets.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      {selectedPaymentPreset ? <div className="creator-meta">{copy.laneDescription}</div> : null}
      <div className="creator-summary-grid">
        <div className="creator-summary-item">
          <label>Direct activation</label>
          <strong>{copy.referenceActivateLabel}</strong>
          <span>{copy.referenceActivateHelp}</span>
        </div>
        <div className="creator-summary-item">
          <label>Hosted checkout</label>
          <strong>{copy.hostedCheckoutLabel}</strong>
          <span>{copy.hostedCheckoutHelp}</span>
        </div>
        <div className="creator-summary-item">
          <label>Reconcile</label>
          <strong>{copy.reconcileLabel}</strong>
          <span>{copy.reconcileHelp}</span>
        </div>
      </div>
      <div className="creator-actions">
        <button
          className="creator-button primary"
          type="button"
          onClick={() => handleReferenceActivate()}
          disabled={!selected || busyAction === "reference"}
        >
          {busyAction === "reference" ? "Applying..." : copy.referenceActivateLabel}
        </button>
        <button
          className="creator-button secondary"
          type="button"
          onClick={() => handleCreatePaymentSession()}
          disabled={!selected || busyAction === "payment"}
        >
          {busyAction === "payment" ? "Preparing..." : copy.hostedCheckoutLabel}
        </button>
        <button
          className="creator-button warn"
          type="button"
          onClick={handleReconcile}
          disabled={!lastIntentId || busyAction === "reconcile"}
        >
          {busyAction === "reconcile" ? "Refreshing..." : copy.reconcileLabel}
        </button>
      </div>
      {lastIntentId ? <div className="creator-meta">Latest intent: {lastIntentId}</div> : null}
      {lastPaymentRuntime ? (
        <div className="creator-meta">
          Session creator: <strong>{lastPaymentRuntime.session_creator}</strong>
          {" • "}
          XMS entry: <strong>{lastPaymentRuntime.orchestration_entry}</strong>
          {" • "}
          Lane: <strong>{lastPaymentRuntime.issuer_mode}</strong>
        </div>
      ) : null}
      {lastPaymentPageUrl ? (
        <div className="creator-inline-links">
          <a href={lastPaymentPageUrl} target="_blank" rel="noreferrer">
            Open hosted payment page
          </a>
        </div>
      ) : null}
      <div className="creator-code">
        {JSON.stringify(
          {
            selectedPackage: selected?.packageSlug || null,
            xmsMode: selectedXmsMode?.key || null,
            paymentGuardRef: selectedPaymentPreset?.paymentGuardRef || null,
            acceptedPaymentSchemes: selectedPaymentPreset?.acceptedSchemes || [],
            paymentIssuerMode: selectedPaymentPreset?.issuerMode || null,
            scopeKind,
            realmRef: realmRef || null,
            paymentRuntime: lastPaymentRuntime
              ? {
                  sessionCreator: lastPaymentRuntime.session_creator || null,
                  orchestrationEntry: lastPaymentRuntime.orchestration_entry || null,
                  definitionSource: lastPaymentRuntime.definition_source || null,
                }
              : null,
          },
          null,
          2,
        )}
      </div>
    </section>
  );
}
