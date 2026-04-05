import React from "react";
import { StatusBox } from "./StatusBox.jsx";
import { PackageCatalogPanel } from "./PackageCatalogPanel.jsx";
import { ActivationLanePanel } from "./ActivationLanePanel.jsx";
import { FeaturePaywallPanel } from "./FeaturePaywallPanel.jsx";
import { MonetizationStatePanel } from "./MonetizationStatePanel.jsx";
import { FeaturePlaygroundPanel } from "./FeaturePlaygroundPanel.jsx";
import { PaywallGalleryPanel } from "./PaywallGalleryPanel.jsx";

export function TechnicalLabPage(props) {
  const {
    session,
    links,
    linkStatus,
    linkBusy,
    linkedHint,
    activity,
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
    catalogPaywalls,
    selected,
    setSelected,
    paymentPresets,
    selectedPaymentPreset,
    setPaymentPresetKey,
    selectedXmsMode,
    busyAction,
    handleReferenceActivate,
    handleCreatePaymentSession,
    handleReconcile,
    lastIntentId,
    lastPaymentPageUrl,
    lastPaymentRuntime,
    statePayload,
    features,
    lastFeatureResult,
    activePaywallFeature,
    featurePaywall,
    featureCopy,
    closePaywall,
    handleRunFeature,
    openPaywall,
  } = props;

  return (
    <div className="creator-stack">
      <div className="creator-wide-grid">
        <section className="creator-card creator-stack">
          <p className="creator-kicker">Technical context</p>
          <div className="creator-badge-row">
            <span className="creator-badge">subject {session?.context?.subject_id || "n/a"}</span>
            <span className="creator-badge">
              installation {session?.context?.installation_id || "n/a"}
            </span>
            <span className="creator-badge">xapp {session?.context?.xapp_id || "n/a"}</span>
          </div>
          <div className="creator-meta">
            This page keeps package catalog selection, payment lanes, paywall previews, and XMS
            snapshot inspection isolated from the main app surface.
          </div>
          <div className="creator-inline-links">
            {links?.portal_marketplace_xapp ? (
              <a href={links.portal_marketplace_xapp} target="_blank" rel="noreferrer">
                Open in portal marketplace
              </a>
            ) : null}
            {links?.publisher_xapp_detail ? (
              <a href={links.publisher_xapp_detail} target="_blank" rel="noreferrer">
                Open publisher xapp detail
              </a>
            ) : null}
            {links?.publisher_monetization_studio ? (
              <a href={links.publisher_monetization_studio} target="_blank" rel="noreferrer">
                Open monetization studio
              </a>
            ) : null}
          </div>
        </section>

        <section className="creator-card creator-stack">
          <p className="creator-kicker">Publisher session</p>
          {!subjectScopeAvailable ? (
            <StatusBox tone="warn">
              This widget still has no platform subject context, so publisher linking cannot run.
            </StatusBox>
          ) : linkBusy ? (
            <StatusBox>Recovering linked publisher session...</StatusBox>
          ) : session?.account ? (
            <StatusBox tone="ok">
              Linked publisher session active for <strong>{session.account.display_name}</strong> (
              {session.account.email}).
            </StatusBox>
          ) : linkStatus.linked ? (
            <StatusBox tone="warn">
              Platform link is active{linkedHint ? ` for ${linkedHint}` : ""}, but the local
              publisher session has not been recovered yet. Refresh the widget once if needed.
            </StatusBox>
          ) : (
            <StatusBox tone="warn">
              This widget should arrive through the platform linking flow and recover the publisher
              session in the top widget chrome.
            </StatusBox>
          )}
          <div className="creator-meta">
            Linking and disconnect stay in the shared top widget chrome. This lab focuses on XMS,
            XPO, paywall variants, and state inspection.
          </div>
        </section>
      </div>

      <StatusBox tone={activity.tone}>{activity.message}</StatusBox>

      <div className="creator-grid">
        <PackageCatalogPanel
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
          selected={selected}
          setSelected={setSelected}
        />

        <ActivationLanePanel
          selected={selected}
          selectedXmsMode={selectedXmsMode}
          paymentPresets={paymentPresets}
          selectedPaymentPreset={selectedPaymentPreset}
          setPaymentPresetKey={setPaymentPresetKey}
          busyAction={busyAction}
          handleReferenceActivate={handleReferenceActivate}
          handleCreatePaymentSession={handleCreatePaymentSession}
          handleReconcile={handleReconcile}
          lastIntentId={lastIntentId}
          lastPaymentPageUrl={lastPaymentPageUrl}
          lastPaymentRuntime={lastPaymentRuntime}
          scopeKind={scopeKind}
          realmRef={realmRef}
        />
      </div>

      <PaywallGalleryPanel
        features={features}
        statePayload={statePayload}
        openPaywall={openPaywall}
        paywalls={catalogPaywalls}
        workspacePaywallSlug={String(props.workspacePaywall?.slug || "").trim()}
      />

      <FeaturePaywallPanel
        activePaywallFeature={activePaywallFeature}
        featurePaywall={featurePaywall}
        featureCopy={featureCopy}
        closePaywall={closePaywall}
        setSelected={setSelected}
        busyAction={busyAction}
        handleReferenceActivate={handleReferenceActivate}
        handleCreatePaymentSession={handleCreatePaymentSession}
        handleReconcile={handleReconcile}
        lastIntentId={lastIntentId}
        lastPaymentPageUrl={lastPaymentPageUrl}
      />

      <MonetizationStatePanel statePayload={statePayload} />

      <FeaturePlaygroundPanel
        features={features}
        statePayload={statePayload}
        lastFeatureResult={lastFeatureResult}
        busyAction={busyAction}
        handleRunFeature={handleRunFeature}
        openPaywall={openPaywall}
      />
    </div>
  );
}
