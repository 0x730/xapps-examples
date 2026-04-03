import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import { buildPackageCopy } from "../lib/packageCopy.js";

export function PackageCatalogPanel({
  scopeKind,
  setScopeKind,
  subjectScopeAvailable,
  installationScopeAvailable,
  realmRef,
  setRealmRef,
  refreshState,
  stateBusy,
  catalogBusy,
  packages,
  selected,
  setSelected,
}) {
  return (
    <section className="creator-card creator-stack">
      <p className="creator-kicker">Scope and package</p>
      <div className="creator-field">
        <label>Scope kind</label>
        <select value={scopeKind} onChange={(event) => setScopeKind(event.target.value)}>
          <option value="subject" disabled={!subjectScopeAvailable}>
            subject{subjectScopeAvailable ? "" : " (not available in this context)"}
          </option>
          <option value="installation" disabled={!installationScopeAvailable}>
            installation{installationScopeAvailable ? "" : " (not available in this context)"}
          </option>
          <option value="realm">realm</option>
        </select>
      </div>
      {scopeKind === "realm" ? (
        <div className="creator-field">
          <label>Realm / workspace ref</label>
          <input
            value={realmRef}
            onChange={(event) => setRealmRef(event.target.value)}
            placeholder="team-workspace-alpha"
          />
        </div>
      ) : null}
      <div className="creator-actions">
        <button
          className="creator-button secondary"
          type="button"
          onClick={() => refreshState()}
          disabled={stateBusy}
        >
          {stateBusy ? "Refreshing..." : "Refresh state"}
        </button>
      </div>
      <div className="creator-list">
        {catalogBusy ? (
          <StatusBox>Loading monetization catalog...</StatusBox>
        ) : (
          packages.map((item) => {
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
          })
        )}
      </div>
    </section>
  );
}
