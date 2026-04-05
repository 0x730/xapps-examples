import { useEffect, useMemo, useState } from "react";
import {
  buildFeaturePaywall,
  flattenXappMonetizationPaywallPackages,
  flattenXappMonetizationCatalog,
  getDefaultXappMonetizationScopeKind,
  hasInstallationMonetizationContext,
  hasSubjectMonetizationContext,
  listXappMonetizationPaywalls,
  resolveXmsModeForPackage,
  selectXappMonetizationPaywall,
} from "../../../../../../node_modules/@xapps-platform/browser-host/dist/index.js";
import { buildFeatureCopyModel } from "../lib/featureCopy.js";
import {
  apiRequest,
  normalizeLinkStatus,
  openHostedPaymentPage,
  PLAYGROUND_BOOTSTRAP,
} from "../lib/playgroundRuntime.js";

function buildStateQuery({ scopeKind, realmRef, intentId }) {
  return new URLSearchParams({
    scopeKind,
    ...(scopeKind === "realm" && String(realmRef || "").trim()
      ? { realmRef: String(realmRef || "").trim() }
      : {}),
    ...(String(intentId || "").trim() ? { intentId: String(intentId).trim() } : {}),
  }).toString();
}

export function useCreatorClubPlayground({ apiBase }) {
  const bootstrap = PLAYGROUND_BOOTSTRAP;
  const sessionToken = String(bootstrap?.session_token || "").trim();
  const [session, setSession] = useState(bootstrap?.session || null);
  const [links, setLinks] = useState(bootstrap?.links || null);
  const [linkStatus, setLinkStatus] = useState({ linked: false });
  const [authLinks, setAuthLinks] = useState(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [paymentPresets, setPaymentPresets] = useState([]);
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [catalogBusy, setCatalogBusy] = useState(true);
  const [scopeKind, setScopeKind] = useState(() =>
    getDefaultXappMonetizationScopeKind(bootstrap?.session || null),
  );
  const [realmRef, setRealmRef] = useState("");
  const [statePayload, setStatePayload] = useState(null);
  const [stateBusy, setStateBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [paymentPresetKey, setPaymentPresetKey] = useState("");
  const [paywallFeatureKey, setPaywallFeatureKey] = useState("");
  const [paywallPreviewOpen, setPaywallPreviewOpen] = useState(false);
  const [lastIntentId, setLastIntentId] = useState("");
  const [lastPaymentPageUrl, setLastPaymentPageUrl] = useState("");
  const [lastPaymentRuntime, setLastPaymentRuntime] = useState(null);
  const [lastFeatureResult, setLastFeatureResult] = useState(null);
  const [activity, setActivity] = useState({
    tone: "neutral",
    message:
      "Use the workspace for the contained member flow. Keep the technical lab for paywalls, lanes, and raw XMS inspection.",
  });
  const [busyAction, setBusyAction] = useState("");
  const [lastStateRefreshAt, setLastStateRefreshAt] = useState("");

  const packages = useMemo(() => flattenXappMonetizationCatalog(catalog), [catalog]);
  const catalogPaywalls = useMemo(
    () => listXappMonetizationPaywalls(statePayload?.paywalls),
    [statePayload],
  );
  const workspacePaywall = useMemo(
    () =>
      selectXappMonetizationPaywall({
        paywalls: catalogPaywalls,
        placement: "default_paywall",
      }),
    [catalogPaywalls],
  );
  const featurePaywallPackages = useMemo(() => {
    if (!workspacePaywall) return packages;
    const items = flattenXappMonetizationPaywallPackages(workspacePaywall);
    return items.length ? items : packages;
  }, [packages, workspacePaywall]);
  const subjectScopeAvailable = hasSubjectMonetizationContext(session);
  const installationScopeAvailable = hasInstallationMonetizationContext(session);
  const selectedPaymentPreset =
    paymentPresets.find((item) => item.key === paymentPresetKey) || paymentPresets[0] || null;
  const selectedXmsMode = useMemo(() => resolveXmsModeForPackage(selected), [selected]);

  useEffect(() => {
    if (!selected && packages.length > 0) {
      setSelected(packages[0]);
    }
  }, [packages, selected]);

  useEffect(() => {
    if (!paymentPresetKey && paymentPresets.length > 0) {
      setPaymentPresetKey(paymentPresets[0].key);
    }
  }, [paymentPresetKey, paymentPresets]);

  useEffect(() => {
    setScopeKind((current) => {
      if (current === "subject" && !subjectScopeAvailable) {
        return installationScopeAvailable ? "installation" : "realm";
      }
      if (current === "installation" && !installationScopeAvailable) {
        return subjectScopeAvailable ? "subject" : "realm";
      }
      return current;
    });
  }, [installationScopeAvailable, subjectScopeAvailable]);

  async function request(path, options = {}) {
    return apiRequest(apiBase, sessionToken, path, options);
  }

  function applyWorkspaceSnapshot(result) {
    setSession(result?.session || null);
    setLinks(result?.links || null);
    setLinkStatus(normalizeLinkStatus(result?.link_status));
    setAuthLinks(result?.auth && typeof result.auth === "object" ? result.auth : null);
    setCatalog(Array.isArray(result?.items) ? result.items : []);
    setPaymentPresets(Array.isArray(result?.payment_presets) ? result.payment_presets : []);
    setFeatureDefinitions(
      Array.isArray(result?.feature_definitions) ? result.feature_definitions : [],
    );
    setStatePayload(result);
    setLastStateRefreshAt(new Date().toISOString());
  }

  async function refreshWorkspaceSnapshot(
    nextScopeKind = scopeKind,
    nextRealmRef = realmRef,
    nextIntentId = lastIntentId,
    options = {},
  ) {
    if (!options.silent) {
      setCatalogBusy(true);
      setLinkBusy(true);
      setStateBusy(true);
    }
    try {
      const suffix = buildStateQuery({
        scopeKind: nextScopeKind,
        realmRef: nextRealmRef,
        intentId: nextIntentId,
      });
      const result = await request(`/app/workspace?${suffix}`);
      applyWorkspaceSnapshot(result);
      return result;
    } finally {
      if (!options.silent) {
        setCatalogBusy(false);
        setLinkBusy(false);
        setStateBusy(false);
      }
    }
  }

  async function refreshState(
    nextScopeKind = scopeKind,
    nextRealmRef = realmRef,
    nextIntentId = lastIntentId,
    options = {},
  ) {
    return refreshWorkspaceSnapshot(nextScopeKind, nextRealmRef, nextIntentId, options);
  }

  useEffect(() => {
    if (!sessionToken) return;
    refreshWorkspaceSnapshot().catch((error) => {
      setCatalogBusy(false);
      setLinkBusy(false);
      setStateBusy(false);
      setActivity({ tone: "danger", message: error.message });
    });
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) return;

    let disposed = false;

    const runPassiveRefresh = async () => {
      if (disposed) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        await refreshWorkspaceSnapshot(scopeKind, realmRef, lastIntentId, { silent: true });
      } catch {
        // Passive refresh should not take over the primary status area.
      }
    };

    const onFocus = () => {
      void runPassiveRefresh();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runPassiveRefresh();
      }
    };

    const timerId = window.setInterval(() => {
      void runPassiveRefresh();
    }, 15000);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(timerId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [lastIntentId, realmRef, scopeKind, sessionToken]);

  async function runReferenceActivateRequest(path, packageItem, successMessage) {
    if (!packageItem) return;
    setBusyAction("reference");
    try {
      const result = await request(path, {
        method: "POST",
        body: {
          scopeKind,
          realmRef,
          offeringId: packageItem.offeringId,
          packageId: packageItem.packageId,
          priceId: packageItem.priceId,
        },
      });
      const activationIntentId = String(
        result?.activation?.prepared_intent?.purchase_intent_id || "",
      ).trim();
      setStatePayload(result);
      setLastIntentId(activationIntentId);
      setLastPaymentPageUrl("");
      setLastPaymentRuntime(null);
      setActivity({
        tone: "ok",
        message: successMessage || `Access activated for ${packageItem.packageTitle}.`,
      });
    } catch (error) {
      setActivity({ tone: "danger", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  async function handleReferenceActivate(packageItem = selected) {
    return runReferenceActivateRequest(
      "/reference-activate",
      packageItem,
      `Reference activation issued access for ${packageItem?.packageTitle || "the selected package"}.`,
    );
  }

  async function handleAppReferenceActivate(packageItem = selected) {
    return runReferenceActivateRequest(
      "/app/plans/reference-activate",
      packageItem,
      `${packageItem?.packageTitle || "Selected plan"} is now active on the current scope.`,
    );
  }

  async function runPaymentSessionRequest(path, packageItem, successBuilder) {
    if (!packageItem) return;
    if (!selectedPaymentPreset?.paymentGuardRef) {
      setActivity({
        tone: "warn",
        message: "No payment lane is currently available for checkout.",
      });
      return;
    }
    setBusyAction("payment");
    try {
      const result = await request(path, {
        method: "POST",
        body: {
          scopeKind,
          realmRef,
          offeringId: packageItem.offeringId,
          packageId: packageItem.packageId,
          priceId: packageItem.priceId,
          paymentGuardRef: selectedPaymentPreset.paymentGuardRef,
        },
      });
      const nextIntentId = String(result?.prepared_intent?.purchase_intent_id || "").trim();
      const paymentPageUrl = String(result?.payment_page_url || "").trim();
      setLastIntentId(nextIntentId);
      setLastPaymentPageUrl(paymentPageUrl);
      setLastPaymentRuntime(
        result?.payment_runtime && typeof result.payment_runtime === "object"
          ? result.payment_runtime
          : null,
      );
      await refreshWorkspaceSnapshot(scopeKind, realmRef, nextIntentId);
      const opened = openHostedPaymentPage(paymentPageUrl);
      setActivity({
        tone: opened ? "ok" : "warn",
        message: successBuilder({
          opened,
          packageTitle: packageItem.packageTitle,
          paymentLabel: selectedPaymentPreset.label,
        }),
      });
    } catch (error) {
      setActivity({ tone: "danger", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  async function handleCreatePaymentSession(packageItem = selected) {
    return runPaymentSessionRequest(
      "/payment-session",
      packageItem,
      ({ opened, packageTitle, paymentLabel }) =>
        opened
          ? `Hosted payment session created for ${packageTitle} on ${paymentLabel}. Complete payment in the opened page, then the playground can finalize it here.`
          : `Hosted payment session created for ${packageTitle} on ${paymentLabel}, but the browser blocked the automatic open. Use the hosted payment link below, then finalize it here if needed.`,
    );
  }

  async function handleAppCreatePaymentSession(packageItem = selected) {
    return runPaymentSessionRequest(
      "/app/plans/payment-session",
      packageItem,
      ({ opened, packageTitle }) =>
        opened
          ? `Checkout opened for ${packageTitle}. Return here when payment completes and the workspace will refresh automatically.`
          : `Checkout is ready for ${packageTitle}. Open the hosted payment link. The workspace will refresh automatically after payment, and the fallback check stays here if needed.`,
    );
  }

  async function runReconcileRequest(path, toneMessage) {
    if (!lastIntentId) {
      setActivity({
        tone: "warn",
        message: "Start a checkout first so there is a payment session to refresh.",
      });
      return;
    }
    setBusyAction("reconcile");
    try {
      const result = await request(path, {
        method: "POST",
        body: {
          intentId: lastIntentId,
          scopeKind,
          realmRef,
        },
      });
      setStatePayload(result);
      setActivity({
        tone: "ok",
        message: toneMessage,
      });
    } catch (error) {
      setActivity({ tone: "danger", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  async function handleReconcile() {
    return runReconcileRequest(
      "/payment-session/reconcile",
      "Payment session reconcile finished and the playground state was refreshed.",
    );
  }

  async function handleAppReconcile() {
    return runReconcileRequest(
      "/app/plans/payment-session/reconcile",
      "Payment status checked for the latest plan checkout.",
    );
  }

  async function runFeatureRequest(path, featureKey, blockedMessagePrefix) {
    setBusyAction(featureKey);
    try {
      const result = await request(path, {
        method: "POST",
        body: {
          featureKey,
          scopeKind,
          realmRef,
          intentId: lastIntentId,
        },
      });
      setStatePayload(result);
      setLastFeatureResult({
        ok: Boolean(result?.ok),
        message: String(result?.message || "").trim() || "Feature execution finished.",
        feature: result?.feature || null,
        execution: result?.execution || null,
      });
      setActivity({
        tone: result.ok ? "ok" : "warn",
        message: result.message || blockedMessagePrefix || "Tool execution finished.",
      });
    } catch (error) {
      setLastFeatureResult({
        ok: false,
        message: error.message,
        feature: null,
        execution: null,
      });
      setActivity({ tone: "danger", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  async function handleRunFeature(featureKey) {
    return runFeatureRequest("/run-feature", featureKey, "Tool execution finished.");
  }

  async function handleAppRunFeature(featureKey) {
    return runFeatureRequest("/app/tools/run", featureKey, "Tool execution finished.");
  }

  const features =
    Array.isArray(statePayload?.features) && statePayload.features.length
      ? statePayload.features
      : featureDefinitions.map((feature) => ({
          ...feature,
          available: false,
          reasons: [],
        }));
  const activePaywallFeature =
    features.find((feature) => feature.key === String(paywallFeatureKey || "").trim()) || null;
  const featurePaywall = useMemo(
    () =>
      activePaywallFeature
        ? buildFeaturePaywall({
            feature: activePaywallFeature,
            packages: featurePaywallPackages,
            selectedPackage: selected,
          })
        : null,
    [activePaywallFeature, featurePaywallPackages, selected],
  );
  const linkedHint = String(
    linkStatus?.publisherUserEmail || linkStatus?.publisherUserId || "",
  ).trim();
  const featureCopy = useMemo(
    () =>
      activePaywallFeature
        ? buildFeatureCopyModel({
            feature: activePaywallFeature,
            statePayload,
            featurePaywall,
          })
        : null,
    [activePaywallFeature, featurePaywall, statePayload],
  );

  useEffect(() => {
    if (activePaywallFeature?.available && !paywallPreviewOpen) {
      setPaywallFeatureKey("");
    }
  }, [activePaywallFeature, paywallPreviewOpen]);

  function closePaywall() {
    setPaywallPreviewOpen(false);
    setPaywallFeatureKey("");
  }

  function openPaywall(feature) {
    const featureKey = String(feature?.key || "").trim();
    const nextFeatureCopy = buildFeatureCopyModel({
      feature,
      statePayload,
      featurePaywall: null,
    });
    setPaywallPreviewOpen(true);
    setPaywallFeatureKey(featureKey);
    setActivity({
      tone: "warn",
      message:
        nextFeatureCopy.summary ||
        `${feature?.title || "Feature"} is currently blocked. Use the in-app paywall below to unlock it through the current XMS/XPO flow.`,
    });
  }

  return {
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
  };
}
