<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XconectC Host · Embedded Catalog</title>
    <style>
      :root { --bg: #0f172a; --card-bg: #1e293b; --text: #f1f5f9; --text-muted: #94a3b8; --primary: #ff2d20; --danger: #ef4444; }
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.5; }
      .container { max-width: 1100px; margin: 32px auto; padding: 0 20px; display: grid; gap: 16px; }
      .header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      h1 { margin: 0; font-size: 20px; font-weight: 700; }
      .card { background: var(--card-bg); border-radius: 12px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      input { padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.15); color: var(--text); min-width: 340px; }
      button { background: var(--primary); color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 700; }
      button:disabled { opacity: 0.6; cursor: not-allowed; }
      a { color: var(--text); text-decoration: none; }
      a:hover { text-decoration: underline; }
      .muted { color: var(--text-muted); font-size: 13px; }
      #mount { border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.10); }
      .error { color: #fecaca; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); padding: 10px 12px; border-radius: 10px; font-size: 13px; white-space: pre-wrap; }
      .success { color: #bbf7d0; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); padding: 10px 12px; border-radius: 10px; font-size: 13px; white-space: pre-wrap; }
      .toasts { position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; z-index: 50; }
      .toast { padding: 10px 12px; border-radius: 12px; background: #fff; border: 1px solid #e5e7eb; color: #0f172a; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
      .toast.success { border-color: #86efac; background: #f0fdf4; }
      .toast.warning { border-color: #fde68a; background: #fffbeb; }
      .toast.error { border-color: #fecaca; background: #fef2f2; }
      .modal-backdrop { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.5); display: none; align-items: center; justify-content: center; z-index: 40; }
      .modal { background: #fff; color: #0f172a; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; width: min(560px, 92vw); box-shadow: 0 18px 45px rgba(15, 23, 42, 0.22); }
      .modal h3 { margin: 0 0 6px; }
      .modal .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div style="display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap;">
          <h1>XconectC Host · Embedded Catalog</h1>
          <div class="muted">Legacy embedded-catalog view kept only during the transition</div>
        </div>
        <div class="row">
          <a href="/dashboard" class="muted">Back to dashboard</a>
          @if($user)
            <a href="/auth/logout" class="muted" style="color: var(--danger);">Logout</a>
          @else
            <a href="/auth/login" class="muted">Login</a>
          @endif
        </div>
      </div>

      <div class="card" style="display: grid; gap: 12px;">
        <div class="row">
          <label class="muted" style="min-width: 130px;">Origin</label>
          <input id="origin" />
          <button id="btn" type="button">Load catalog</button>
        </div>
        <div class="muted">
          Logged in as: <strong>{{ $userEmail ? $userEmail : '(anonymous)' }}</strong>
        </div>
        <div id="status" class="muted"></div>
        <div id="msg"></div>
      </div>

      <div id="mount"></div>
    </div>

    <div id="xapps-host-toast-root" class="toasts" aria-live="polite"></div>
    <div id="xapps-host-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="modal">
        <h3 id="xapps-host-modal-title">Modal</h3>
        <div id="xapps-host-modal-message" style="color: #475569"></div>
        <div class="actions">
          <button onclick="document.getElementById('xapps-host-modal').style.display = 'none'">Close</button>
        </div>
      </div>
    </div>

    <script type="module">
      const gatewayUrl = {!! json_encode($gatewayUrl) !!};
      const sdkUrl = String(gatewayUrl || "")
        .replace(/\/+$/, "")
        .concat("/embed/sdk/xapps-embed-sdk.esm.js");

      const {
        createHost,
        createHostApiClient,
        createBridgeV2ApiHandlers,
        createHostConfirmDialog,
        createHostPaymentResumeState,
        createHostUiBridge,
        createMarketplaceMutationEventHandler,
        resolveGatewayBaseUrl,
      } = await import(sdkUrl);

      const mountEl = document.getElementById("mount");
      const originInput = document.getElementById("origin");
      const btn = document.getElementById("btn");
      const statusEl = document.getElementById("status");
      const msgEl = document.getElementById("msg");
      const toasts = document.getElementById("xapps-host-toast-root");
      const modalBackdrop = document.getElementById("xapps-host-modal");
      const modalTitleEl = document.getElementById("xapps-host-modal-title");
      const modalMsgEl = document.getElementById("xapps-host-modal-message");

      const resolvedGatewayBaseUrl = resolveGatewayBaseUrl({
        override: gatewayUrl,
        defaultPort: "3000",
      });
      const hostApiClient = createHostApiClient({ timeoutMs: 15000 });
      const hostConfirmDialog = createHostConfirmDialog();
      const paymentResumeState = createHostPaymentResumeState(window.location.href, {
        autoCleanUrl: true,
      });

      let currentHost = null;
      let currentSubjectId = null;
      let currentWidgetCtx = { installationId: null, widgetId: null };
      let resumeHandled = false;

      function setMsg(kind, text) {
        msgEl.className = kind;
        msgEl.textContent = text || "";
      }

      function showToast(message, variant = "info") {
        if (!toasts) return;
        const div = document.createElement("div");
        div.className = `toast ${variant}`;
        div.textContent = String(message || "");
        toasts.appendChild(div);
        setTimeout(() => {
          div.style.opacity = "0";
          div.style.transform = "translateY(6px)";
          setTimeout(() => div.remove(), 300);
        }, 3500);
      }

      function openModal(title = "Modal", message = "") {
        if (modalTitleEl) modalTitleEl.textContent = String(title || "Modal");
        if (modalMsgEl) modalMsgEl.textContent = String(message || "");
        if (modalBackdrop) modalBackdrop.style.display = "flex";
      }

      function closeModal() {
        if (modalBackdrop) modalBackdrop.style.display = "none";
      }

      function buildHostReturnUrl(paymentParamsOverride = null) {
        return paymentResumeState.buildHostReturnUrl({
          baseUrl: window.location.href,
          paymentParams:
            paymentParamsOverride instanceof URLSearchParams
              ? paymentParamsOverride
              : paymentResumeState.getPendingPaymentParams(),
        });
      }

      function maybeOpenWidgetFromResume() {
        if (resumeHandled || !currentHost) return;
        const resume = paymentResumeState.getResume();
        if (!resume) return;
        const installationId = String(resume.installationId || "").trim();
        const widgetId = String(resume.widgetId || "").trim();
        if (!installationId || !widgetId) return;

        resumeHandled = true;
        paymentResumeState.consumeResume();
        paymentResumeState.consumePaymentParams();

        setTimeout(() => {
          try {
            currentHost.emitToCatalog({
              type: "XAPPS_OPEN_WIDGET",
              data: { installationId, widgetId },
            });
          } catch {}
        }, 250);
      }

      originInput.value = window.location.origin;

      async function resolveSubjectIdIfLoggedIn() {
        const email = {!! json_encode($userEmail ? $userEmail : "") !!};
        if (!email) return null;
        const data = await hostApiClient(
          "/api/resolve-subject",
          { email },
          { method: "POST" },
        );
        return data?.subject?.id || data?.subjectId || null;
      }

      async function callHostApi(path, payload) {
        return hostApiClient(path, payload, { method: "POST" });
      }

      const hostUiBridge = createHostUiBridge({
        showNotification: (message, variant) => showToast(message, variant || "info"),
        showAlert: (message, title) => window.alert(`${title || "Alert"}\n\n${String(message || "")}`),
        openModal: (title, message) => openModal(title, message),
        closeModal: () => closeModal(),
        navigate: (path) => {
          if (!path) return;
          if (String(path).startsWith("http")) window.location.href = String(path);
          else window.location.hash = String(path);
        },
        refresh: () => window.location.reload(),
        updateState: (patch) => console.log("[LaravelHost] UI state update:", patch),
        getContext: () => ({
          installationId: currentWidgetCtx.installationId || "",
          widgetId: currentWidgetCtx.widgetId || "",
          devMode: false,
        }),
        confirmDialog: ({ title, message, confirmLabel, cancelLabel }) =>
          hostConfirmDialog({ title, message, confirmLabel, cancelLabel }),
      });

      function bridgeV2Handlers() {
        return createBridgeV2ApiHandlers({
          callApi: callHostApi,
          getWidgetContext: () => ({
            installationId: currentWidgetCtx.installationId || "",
            widgetId: currentWidgetCtx.widgetId || "",
          }),
          getSubjectId: () => currentSubjectId || undefined,
          getPortalToken: () => window.localStorage.getItem("tenant_a_token") || "",
          getHostOrigin: () => window.location.origin,
          getHostReturnUrl: () => buildHostReturnUrl(),
          clearSession: () => {
            window.localStorage.removeItem("integration_host_bridge_session_token");
          },
          endpoints: {
            tokenRefresh: "/api/bridge/token-refresh",
            sign: "/api/bridge/sign",
            vendorAssertion: "/api/bridge/vendor-assertion",
          },
        });
      }

      async function run() {
        setMsg("", "");
        statusEl.textContent = "";
        mountEl.innerHTML = "";

        btn.disabled = true;
        try {
          const origin = originInput.value.trim();
          if (origin && origin !== window.location.origin) {
            throw new Error(
              `Origin must match window.location.origin in a browser. Expected ${window.location.origin}`,
            );
          }

          statusEl.textContent = "Resolving subject (if logged in)…";
          const subjectId = await resolveSubjectIdIfLoggedIn();
          currentSubjectId = subjectId || null;

          statusEl.textContent = "Mounting embedded catalog…";
          if (currentHost) {
            try {
              currentHost.destroy();
            } catch {}
          }

          const pendingResume = paymentResumeState.getResume();
          const resumeInstallationId = pendingResume
            ? String(pendingResume.installationId || "").trim()
            : "";
          const resumeWidgetId = pendingResume ? String(pendingResume.widgetId || "").trim() : "";

          const catalogPath =
            resumeInstallationId && resumeWidgetId
              ? `/embed/catalog/widget/${encodeURIComponent(resumeInstallationId)}/${encodeURIComponent(resumeWidgetId)}`
              : "/embed/catalog";
          const paymentParams = pendingResume
            ? paymentResumeState.getPendingPaymentParams()
            : new URLSearchParams();

          const catalogParams = new URLSearchParams();
          catalogParams.set("embedMode", "true");

          const marketplaceMutations = createMarketplaceMutationEventHandler({
            getHost: () => currentHost,
            getSubjectId: () => currentSubjectId || undefined,
            callApi: callHostApi,
            endpoints: {
              install: "/api/install",
              update: "/api/update",
              uninstall: "/api/uninstall",
            },
            onInstallFailure: ({ error }) => {
              showToast("Install failed: " + (error.message || String(error)), "error");
            },
            onUpdateFailure: ({ error }) => {
              showToast("Update failed: " + (error.message || String(error)), "error");
            },
            onUninstallFailure: ({ error }) => {
              showToast("Uninstall failed: " + (error.message || String(error)), "error");
            },
          });

          currentHost = createHost({
            container: mountEl,
            baseUrl: resolvedGatewayBaseUrl,
            catalogUrl: `${resolvedGatewayBaseUrl}${catalogPath}?${catalogParams.toString()}`,
            subjectId: subjectId || undefined,
            theme: {
              primary: "#ff2d20",
              radius: "12px",
            },
            hostApi: {
              createCatalogSessionUrl: "/api/create-catalog-session",
              createWidgetSessionUrl: "/api/create-widget-session",
              installationsUrl: "/api/installations",
            },
            embedContext: {
              getHostReturnUrl: () => buildHostReturnUrl(paymentParams),
              getPaymentParams: () => paymentParams,
            },
            bridgeV2: bridgeV2Handlers(),
            confirmDialog: ({ title, message, confirmLabel, cancelLabel }) =>
              hostConfirmDialog({ title, message, confirmLabel, cancelLabel }),
            onEvent: async (evt) => {
              if (!evt || typeof evt.type !== "string") return;
              if (await marketplaceMutations(evt)) return;
              if (evt.type === "XAPPS_OPEN_WIDGET") {
                currentWidgetCtx = {
                  installationId: evt.data.installationId,
                  widgetId: evt.data.widgetId,
                };
              }
            },
          });

          await currentHost.mountCatalog();
          maybeOpenWidgetFromResume();

          setMsg("success", `Catalog loaded. subjectId=${subjectId || "(none)"}`);
          statusEl.textContent = "";
        } catch (e) {
          console.error(e);
          setMsg("error", String(e?.message || e || "Failed"));
          statusEl.textContent = "";
        } finally {
          btn.disabled = false;
        }
      }

      btn.addEventListener("click", () => void run());
      void run();

      window.addEventListener("beforeunload", () => {
        try {
          hostUiBridge.detach();
        } catch {}
      });
    </script>
  </body>
</html>
