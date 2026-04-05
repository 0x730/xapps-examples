import React from "react";
import { createRoot } from "react-dom/client";
import { TechnicalLabPage } from "./components/TechnicalLabPage.jsx";
import { WorkspacePage } from "./components/WorkspacePage.jsx";
import { useCreatorClubPlayground } from "./hooks/useCreatorClubPlayground.js";

const API_BASE = __PLAYGROUND_API_BASE__;

const styles = `
  .creator-app {
    display: grid;
    gap: 18px;
    color: #241b10;
  }
  .creator-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  .creator-wide-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    align-items: start;
  }
  .creator-card {
    border: 1px solid rgba(58, 47, 28, 0.14);
    border-radius: 22px;
    background: rgba(255,255,255,0.82);
    padding: 20px;
    box-shadow: 0 16px 32px rgba(36,27,16,0.08);
  }
  .creator-card h2,
  .creator-card h3 {
    margin: 0 0 12px;
    font: 700 1.15rem/1.2 "IBM Plex Serif", Georgia, serif;
  }
  .creator-kicker {
    margin: 0 0 10px;
    color: #0f766e;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .creator-meta {
    color: #6c5d49;
    font-size: 14px;
  }
  .creator-stack {
    display: grid;
    gap: 12px;
  }
  .creator-shell {
    display: grid;
    gap: 18px;
  }
  .creator-shell-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }
  .creator-shell-tabs {
    display: inline-flex;
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(255,255,255,0.82);
    border: 1px solid rgba(58,47,28,0.12);
    box-shadow: 0 10px 24px rgba(36,27,16,0.06);
  }
  .creator-subnav {
    width: fit-content;
  }
  .creator-shell-tab {
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #6c5d49;
    font-weight: 700;
    padding: 10px 14px;
    cursor: pointer;
  }
  .creator-shell-tab.active {
    background: linear-gradient(135deg, #0f766e, #155e75);
    color: #f5fffd;
  }
  .creator-shell-note {
    color: #6c5d49;
    font-size: 14px;
  }
  .creator-zone {
    display: grid;
    gap: 16px;
  }
  .creator-zone-head {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .creator-zone-head h2 {
    margin: 0;
    font: 700 1.3rem/1.15 "IBM Plex Serif", Georgia, serif;
  }
  .creator-zone-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr);
  }
  .creator-plan-highlight {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 18px;
    border-radius: 20px;
    border: 1px solid rgba(15,118,110,0.14);
    background: linear-gradient(180deg, rgba(240,253,250,0.92), rgba(255,255,255,0.92));
  }
  .creator-plan-highlight-main {
    display: grid;
    gap: 6px;
    max-width: 480px;
  }
  .creator-plan-highlight-main strong {
    font: 700 1.4rem/1.1 "IBM Plex Serif", Georgia, serif;
    color: #16382f;
  }
  .creator-plan-highlight-main span {
    color: #416158;
  }
  .creator-plan-highlight-label {
    color: #0f766e !important;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .creator-hero {
    border: 1px solid rgba(58,47,28,0.14);
    border-radius: 28px;
    background:
      radial-gradient(circle at top right, rgba(15,118,110,0.14), transparent 35%),
      linear-gradient(180deg, rgba(255,255,255,0.94), rgba(246,243,236,0.96));
    padding: 26px;
    box-shadow: 0 18px 40px rgba(36,27,16,0.08);
  }
  .creator-hero-copy {
    display: grid;
    gap: 12px;
    max-width: 760px;
  }
  .creator-hero-title {
    margin: 0;
    font: 700 2rem/1.05 "IBM Plex Serif", Georgia, serif;
  }
  .creator-section-head {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .creator-section-head h2 {
    margin: 0;
    font: 700 1.2rem/1.15 "IBM Plex Serif", Georgia, serif;
  }
  .creator-tool-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .creator-tool-card {
    display: grid;
    gap: 12px;
    border: 1px solid rgba(58,47,28,0.12);
    border-radius: 18px;
    padding: 16px;
    background: rgba(255,255,255,0.82);
  }
  .creator-field {
    display: grid;
    gap: 8px;
  }
  .creator-field label {
    font-size: 13px;
    font-weight: 700;
    color: #3a2f1c;
  }
  .creator-field input,
  .creator-field select,
  .creator-field button,
  .creator-field textarea {
    font: inherit;
  }
  .creator-field input,
  .creator-field select,
  .creator-field textarea {
    width: 100%;
    border: 1px solid rgba(58, 47, 28, 0.18);
    border-radius: 14px;
    background: rgba(255,255,255,0.94);
    padding: 12px 13px;
    color: #241b10;
  }
  .creator-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .creator-actions a.creator-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  .creator-button {
    border: 0;
    border-radius: 999px;
    padding: 12px 16px;
    font-weight: 700;
    cursor: pointer;
  }
  .creator-button.primary {
    background: linear-gradient(135deg, #0f766e, #155e75);
    color: #f5fffd;
  }
  .creator-button.secondary {
    background: rgba(255,255,255,0.94);
    color: #241b10;
    border: 1px solid rgba(58, 47, 28, 0.14);
  }
  .creator-button.warn {
    background: linear-gradient(135deg, #a16207, #ca8a04);
    color: #fffdf5;
  }
  .creator-button[disabled] {
    cursor: wait;
    opacity: 0.72;
  }
  .creator-badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .creator-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(15,118,110,0.08);
    color: #155e75;
    font-size: 12px;
    font-weight: 700;
  }
  .creator-package {
    border: 1px solid rgba(58,47,28,0.14);
    border-radius: 18px;
    padding: 16px;
    display: grid;
    gap: 10px;
    background: rgba(255,255,255,0.8);
  }
  .creator-package.active {
    border-color: rgba(15,118,110,0.34);
    background: rgba(240,253,250,0.94);
  }
  .creator-package-title {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }
  .creator-package h4 {
    margin: 0;
    font-size: 1rem;
  }
  .creator-package p {
    margin: 0;
    color: #6c5d49;
    font-size: 14px;
  }
  .creator-status {
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid rgba(58, 47, 28, 0.14);
    background: rgba(255,255,255,0.8);
    color: #6c5d49;
  }
  .creator-status.ok {
    border-color: rgba(15,118,110,0.24);
    background: rgba(240,253,250,0.96);
    color: #155e75;
  }
  .creator-status.w6arn {
    border-color: rgba(161,98,7,0.24);
    background: rgba(255,251,235,0.96);
    color: #a16207;
  }
  .creator-status.danger {
    border-color: rgba(185,28,28,0.24);
    background: rgba(254,242,242,0.96);
    color: #b91c1c;
  }
  .creator-list {
    display: grid;
    gap: 10px;
  }
  .creator-feature {
    display: grid;
    gap: 10px;
    border: 1px solid rgba(58,47,28,0.12);
    border-radius: 16px;
    padding: 14px;
    background: rgba(255,255,255,0.78);
  }
  .creator-feature-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: start;
  }
  .creator-feature-head strong {
    display: block;
    margin-bottom: 4px;
  }
  .creator-inline-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .creator-inline-links a {
    color: #155e75;
    font-weight: 700;
    text-decoration: none;
  }
  .creator-code {
    padding: 12px 13px;
    border-radius: 14px;
    background: #22170d;
    color: #eefcf9;
    font: 13px/1.4 "IBM Plex Mono", "SFMono-Regular", monospace;
    overflow: auto;
  }
  .creator-paywall {
    display: grid;
    gap: 14px;
    border: 1px solid rgba(15,118,110,0.18);
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(240,253,250,0.92), rgba(255,255,255,0.9));
    padding: 18px;
  }
  .creator-paywall-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
  }
  .creator-paywall-options {
    display: grid;
    gap: 10px;
  }
  .creator-paywall-option {
    width: 100%;
    display: grid;
    gap: 8px;
    text-align: left;
    border: 1px solid rgba(15,118,110,0.14);
    border-radius: 16px;
    background: rgba(255,255,255,0.92);
    padding: 14px;
    cursor: pointer;
  }
  .creator-paywall-option.active {
    border-color: rgba(15,118,110,0.38);
    box-shadow: 0 12px 24px rgba(15,118,110,0.08);
  }
  .creator-paywall-option strong {
    display: block;
    margin-bottom: 4px;
  }
  .creator-paywall-reasons {
    display: grid;
    gap: 6px;
    color: #155e75;
    font-size: 13px;
  }
  .creator-summary-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  .creator-state-board {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    align-items: start;
  }
  .creator-state-block {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(58,47,28,0.12);
    background: rgba(255,255,255,0.72);
  }
  .creator-state-block h3 {
    margin: 0;
    font-size: 1rem;
  }
  .creator-summary-item {
    display: grid;
    gap: 4px;
    padding: 14px;
    border-radius: 16px;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(58,47,28,0.12);
  }
  .creator-summary-item label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6c5d49;
  }
  .creator-summary-item strong {
    font-size: 1rem;
    color: #241b10;
  }
  .creator-summary-item span {
    color: #6c5d49;
    font-size: 13px;
  }
  .creator-empty {
    padding: 16px;
    border-radius: 16px;
    border: 1px dashed rgba(58,47,28,0.18);
    color: #6c5d49;
    background: rgba(255,255,255,0.65);
  }
  .creator-mix-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  .creator-detail-list {
    display: grid;
    gap: 12px;
  }
  .creator-detail-card {
    display: grid;
    gap: 10px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(58,47,28,0.12);
    background: rgba(255,255,255,0.92);
  }
  .creator-detail-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: start;
  }
  .creator-detail-title {
    display: grid;
    gap: 4px;
  }
  .creator-detail-title strong {
    color: #241b10;
  }
  .creator-detail-title span {
    color: #6c5d49;
    font-size: 13px;
  }
  @media (max-width: 768px) {
    .creator-shell-nav {
      align-items: flex-start;
    }
    .creator-shell-tabs {
      width: 100%;
      justify-content: stretch;
    }
    .creator-shell-tab {
      flex: 1 1 0;
      text-align: center;
    }
    .creator-hero-title {
      font-size: 1.55rem;
    }
  }
`;

function App() {
  const {
    session,
    links,
    linkStatus,
    authLinks,
    linkBusy,
    catalogBusy,
    scopeKind,
    setScopeKind,
    subjectScopeAvailable,
    installationScopeAvailable,
    realmRef,
    setRealmRef,
    statePayload,
    stateBusy,
    packages,
    catalogPaywalls,
    workspacePaywall,
    selected,
    setSelected,
    paymentPresets,
    selectedPaymentPreset,
    setPaymentPresetKey,
    selectedXmsMode,
    busyAction,
    lastStateRefreshAt,
    lastIntentId,
    lastPaymentPageUrl,
    lastPaymentRuntime,
    activity,
    features,
    lastFeatureResult,
    activePaywallFeature,
    featurePaywall,
    featureCopy,
    linkedHint,
    setPaywallFeatureKey,
    closePaywall,
    refreshState,
    refreshWorkspaceSnapshot,
    handleReferenceActivate,
    handleAppReferenceActivate,
    handleCreatePaymentSession,
    handleAppCreatePaymentSession,
    handleReconcile,
    handleAppReconcile,
    handleRunFeature,
    handleAppRunFeature,
    openPaywall,
  } = useCreatorClubPlayground({ apiBase: API_BASE });

  function parseHash() {
    const raw = String(window.location.hash || "").trim();
    if (raw === "#technical-lab") {
      return { page: "technical", workspace: "dashboard" };
    }
    if (raw.startsWith("#workspace:")) {
      const section = raw.slice("#workspace:".length).trim();
      if (section === "plans" || section === "tools" || section === "dashboard") {
        return { page: "home", workspace: section };
      }
    }
    return { page: "home", workspace: "dashboard" };
  }

  const initialHash = parseHash();
  const [activePage, setActivePage] = React.useState(initialHash.page);
  const [workspaceSection, setWorkspaceSection] = React.useState(initialHash.workspace);

  React.useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setActivePage(next.page);
      setWorkspaceSection(next.workspace);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  React.useEffect(() => {
    const nextHash =
      activePage === "technical" ? "#technical-lab" : `#workspace:${workspaceSection}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(window.history.state, "", nextHash);
    }
  }, [activePage, workspaceSection]);

  React.useEffect(() => {
    if (activePage === "technical") {
      void refreshWorkspaceSnapshot();
    }
  }, [activePage]);

  function openUpgradeOptions(feature) {
    setActivePage("home");
    setWorkspaceSection("plans");
  }

  return (
    <div className="creator-app creator-shell">
      <style>{styles}</style>
      <div className="creator-shell-nav">
        <div className="creator-shell-tabs" role="tablist" aria-label="Creator Club pages">
          <button
            className={`creator-shell-tab ${activePage === "home" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("home")}
          >
            Workspace
          </button>
          <button
            className={`creator-shell-tab ${activePage === "technical" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("technical")}
          >
            Technical Lab
          </button>
        </div>
      </div>

      {activePage === "home" ? (
        <WorkspacePage
          activeSection={workspaceSection}
          setActiveSection={setWorkspaceSection}
          session={session}
          links={links}
          linkStatus={linkStatus}
          linkBusy={linkBusy}
          linkedHint={linkedHint}
          authLinks={authLinks}
          statePayload={statePayload}
          lastStateRefreshAt={lastStateRefreshAt}
          packages={packages}
          workspacePaywall={workspacePaywall}
          selected={selected}
          setSelected={setSelected}
          selectedPaymentPreset={selectedPaymentPreset}
          features={features}
          lastFeatureResult={lastFeatureResult}
          busyAction={busyAction}
          handleAppReferenceActivate={handleAppReferenceActivate}
          handleAppCreatePaymentSession={handleAppCreatePaymentSession}
          handleAppReconcile={handleAppReconcile}
          handleAppRunFeature={handleAppRunFeature}
          lastIntentId={lastIntentId}
          lastPaymentPageUrl={lastPaymentPageUrl}
          openUpgradeOptions={openUpgradeOptions}
        />
      ) : (
        <TechnicalLabPage
          session={session}
          links={links}
          linkStatus={linkStatus}
          linkBusy={linkBusy}
          linkedHint={linkedHint}
          activity={activity}
          scopeKind={scopeKind}
          setScopeKind={setScopeKind}
          subjectScopeAvailable={subjectScopeAvailable}
          installationScopeAvailable={installationScopeAvailable}
          realmRef={realmRef}
          setRealmRef={setRealmRef}
          refreshState={refreshState}
          stateBusy={stateBusy}
          catalogBusy={catalogBusy}
          packages={packages}
          catalogPaywalls={catalogPaywalls}
          workspacePaywall={workspacePaywall}
          selected={selected}
          setSelected={setSelected}
          paymentPresets={paymentPresets}
          selectedPaymentPreset={selectedPaymentPreset}
          setPaymentPresetKey={setPaymentPresetKey}
          selectedXmsMode={selectedXmsMode}
          busyAction={busyAction}
          handleReferenceActivate={handleReferenceActivate}
          handleCreatePaymentSession={handleCreatePaymentSession}
          handleReconcile={handleReconcile}
          lastIntentId={lastIntentId}
          lastPaymentPageUrl={lastPaymentPageUrl}
          lastPaymentRuntime={lastPaymentRuntime}
          statePayload={statePayload}
          features={features}
          lastFeatureResult={lastFeatureResult}
          activePaywallFeature={activePaywallFeature}
          featurePaywall={featurePaywall}
          featureCopy={featureCopy}
          closePaywall={closePaywall}
          handleRunFeature={handleRunFeature}
          openPaywall={openPaywall}
        />
      )}
    </div>
  );
}

const rootNode = document.getElementById("root");
if (rootNode) {
  createRoot(rootNode).render(<App />);
}
