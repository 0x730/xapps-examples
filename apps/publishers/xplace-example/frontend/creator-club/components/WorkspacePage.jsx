import React from "react";
import { MemberActivityPanel } from "./MemberActivityPanel.jsx";
import { MemberOverviewPanel } from "./MemberOverviewPanel.jsx";
import { MemberToolsPanel } from "./MemberToolsPanel.jsx";
import { WorkspaceAuthPanel } from "./WorkspaceAuthPanel.jsx";
import { WorkspacePlansPanel } from "./WorkspacePlansPanel.jsx";

function WorkspaceNav({ activeSection, setActiveSection }) {
  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "plans", label: "Plans" },
    { key: "tools", label: "Tools" },
  ];
  return (
    <div className="creator-shell-tabs creator-subnav" role="tablist" aria-label="Workspace pages">
      {items.map((item) => (
        <button
          key={item.key}
          className={`creator-shell-tab ${activeSection === item.key ? "active" : ""}`}
          type="button"
          onClick={() => setActiveSection(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function WorkspacePage({
  activeSection,
  setActiveSection,
  session,
  links,
  linkStatus,
  linkBusy,
  linkedHint,
  authLinks,
  statePayload,
  lastStateRefreshAt,
  packages,
  selected,
  setSelected,
  selectedPaymentPreset,
  features,
  lastFeatureResult,
  busyAction,
  handleAppReferenceActivate,
  handleAppCreatePaymentSession,
  handleAppReconcile,
  handleAppRunFeature,
  lastIntentId,
  lastPaymentPageUrl,
  openUpgradeOptions,
}) {
  return (
    <div className="creator-stack">
      <section className="creator-zone">
        <div className="creator-zone-head">
          <div>
            <h2>Creator Club</h2>
          </div>
        </div>
        <WorkspaceNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </section>

      <WorkspaceAuthPanel
        session={session}
        authLinks={authLinks}
        linkStatus={linkStatus}
        linkBusy={linkBusy}
        linkedHint={linkedHint}
      />

      {activeSection === "dashboard" ? (
        <div className="creator-stack">
          <section className="creator-zone">
            <div className="creator-zone-head">
              <div>
                <p className="creator-kicker">Membership</p>
                <h2>Plan and account overview.</h2>
              </div>
              <div className="creator-meta">Current member state.</div>
            </div>
            <MemberOverviewPanel
              session={session}
              links={links}
              linkStatus={linkStatus}
              linkBusy={linkBusy}
              linkedHint={linkedHint}
              statePayload={statePayload}
              lastStateRefreshAt={lastStateRefreshAt}
            />
          </section>

          <section className="creator-zone">
            <div className="creator-zone-head">
              <div>
                <p className="creator-kicker">Usage</p>
                <h2>Recent activity.</h2>
              </div>
              <div className="creator-meta">Current scope.</div>
            </div>
            <MemberActivityPanel statePayload={statePayload} />
          </section>
        </div>
      ) : null}

      {activeSection === "plans" ? (
        <WorkspacePlansPanel
          statePayload={statePayload}
          packages={packages}
          selected={selected}
          setSelected={setSelected}
          selectedPaymentPreset={selectedPaymentPreset}
          busyAction={busyAction}
          lastIntentId={lastIntentId}
          lastPaymentPageUrl={lastPaymentPageUrl}
          handleAppReferenceActivate={handleAppReferenceActivate}
          handleAppCreatePaymentSession={handleAppCreatePaymentSession}
          handleAppReconcile={handleAppReconcile}
        />
      ) : null}

      {activeSection === "tools" ? (
        <section className="creator-zone">
          <div className="creator-zone-head">
            <div>
              <p className="creator-kicker">Tools</p>
              <h2>Run member tools.</h2>
            </div>
          </div>
          <MemberToolsPanel
            features={features}
            statePayload={statePayload}
            lastFeatureResult={lastFeatureResult}
            busyAction={busyAction}
            handleRunFeature={handleAppRunFeature}
            openUpgradeOptions={openUpgradeOptions}
          />
        </section>
      ) : null}
    </div>
  );
}
