<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XconectC · Catalog Workspace</title>
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg: #f4efe4;
        --bg-soft: #fbf8f1;
        --panel: rgba(255, 255, 255, 0.9);
        --panel-strong: rgba(255, 255, 255, 0.96);
        --stroke: rgba(103, 79, 45, 0.12);
        --ink: #1f2937;
        --muted: #6b7280;
        --accent: #c7562e;
        --accent-deep: #8f3418;
        --accent-soft: #f5d8c8;
        --leaf: #48634d;
        --success-bg: #effaf3;
        --success-stroke: rgba(72, 99, 77, 0.18);
        --success-text: #355540;
        --danger-bg: #fff1ed;
        --danger-stroke: rgba(199, 86, 46, 0.2);
        --danger-text: #8f3418;
        --shadow: 0 22px 60px rgba(72, 53, 29, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "IBM Plex Sans", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(199, 86, 46, 0.16), transparent 28%),
          radial-gradient(circle at 85% 15%, rgba(72, 99, 77, 0.13), transparent 24%),
          linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
      }

      .page-shell {
        max-width: 1220px;
        margin: 0 auto;
        padding: 28px 20px 42px;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #d4673f 0%, #9e3f20 100%);
        color: #fff9f4;
        font-family: "Space Grotesk", sans-serif;
        font-weight: 700;
        letter-spacing: 0.04em;
        box-shadow: 0 12px 24px rgba(159, 66, 34, 0.22);
      }

      .brand-copy h1 {
        margin: 0;
        font-family: "Space Grotesk", sans-serif;
        font-size: clamp(1.4rem, 2vw, 2rem);
        line-height: 1;
      }

      .brand-copy p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 0.95rem;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .nav-links a {
        color: var(--muted);
        text-decoration: none;
        font-size: 0.92rem;
        font-weight: 600;
      }

      .nav-links a:hover {
        color: var(--ink);
      }

      .nav-links .danger {
        color: var(--accent-deep);
      }

      .hero {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.85fr);
        gap: 20px;
        padding: 26px;
        border-radius: 28px;
        background:
          linear-gradient(140deg, rgba(255, 248, 242, 0.97) 0%, rgba(251, 246, 237, 0.92) 100%);
        border: 1px solid rgba(154, 111, 59, 0.12);
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto -60px -110px auto;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(199, 86, 46, 0.18), transparent 68%);
        pointer-events: none;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-deep);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .hero h2 {
        margin: 0;
        max-width: 14ch;
        font-family: "Space Grotesk", sans-serif;
        font-size: clamp(2.05rem, 4vw, 3.3rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .hero p {
        margin: 16px 0 0;
        max-width: 58ch;
        color: #4b5563;
      }

      .hero-meta {
        display: grid;
        gap: 14px;
        align-content: start;
      }

      .meta-card,
      .surface-panel,
      .launch-panel,
      .status-card {
        background: var(--panel-strong);
        border: 1px solid var(--stroke);
        border-radius: 22px;
        box-shadow: 0 10px 24px rgba(77, 59, 32, 0.07);
      }

      .meta-card {
        padding: 18px;
      }

      .meta-card span {
        display: block;
        color: var(--muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }

      .meta-card strong {
        display: block;
        margin-top: 8px;
        font-size: 1.05rem;
      }

      .workspace {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(72, 99, 77, 0.1);
        color: var(--leaf);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .surface-panel,
      .launch-panel,
      .status-card {
        margin-top: 20px;
        padding: 20px;
      }

      .section-title {
        margin: 0 0 14px;
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.2rem;
      }

      .section-copy {
        margin: 0 0 18px;
        color: var(--muted);
      }

      .surface-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .surface-option {
        position: relative;
        display: block;
      }

      .surface-option input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .surface-card {
        display: grid;
        gap: 10px;
        min-height: 170px;
        padding: 18px;
        border-radius: 18px;
        border: 1px solid rgba(103, 79, 45, 0.12);
        background: linear-gradient(180deg, rgba(255, 252, 247, 0.95), rgba(249, 243, 233, 0.9));
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }

      .surface-card:hover {
        transform: translateY(-1px);
        border-color: rgba(199, 86, 46, 0.3);
        box-shadow: 0 12px 28px rgba(83, 61, 29, 0.1);
      }

      .surface-option input:checked + .surface-card {
        border-color: rgba(199, 86, 46, 0.52);
        box-shadow: 0 14px 30px rgba(199, 86, 46, 0.14);
      }

      .surface-card strong {
        font-size: 1rem;
      }

      .surface-card p {
        margin: 0;
        color: #596273;
        font-size: 0.92rem;
      }

      .surface-tag {
        justify-self: start;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(199, 86, 46, 0.11);
        color: var(--accent-deep);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .launch-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .field {
        display: grid;
        gap: 8px;
      }

      .field span {
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      input {
        width: 100%;
        min-width: 0;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1px solid rgba(103, 79, 45, 0.16);
        background: rgba(255, 255, 255, 0.86);
        color: var(--ink);
        font: inherit;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      input:focus {
        outline: 2px solid rgba(199, 86, 46, 0.16);
        border-color: rgba(199, 86, 46, 0.38);
      }

      .launch-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
        flex-wrap: wrap;
      }

      button {
        min-height: 48px;
        padding: 0 18px;
        border: none;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent) 0%, #dc7148 100%);
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(199, 86, 46, 0.22);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      button:hover {
        transform: translateY(-1px);
      }

      button:disabled {
        opacity: 0.62;
        cursor: not-allowed;
        transform: none;
      }

      .launch-hint {
        color: var(--muted);
        font-size: 0.92rem;
      }

      .status-card {
        display: grid;
        gap: 12px;
      }

      .status-text {
        color: var(--muted);
        font-size: 0.92rem;
      }

      .identity-card {
        display: none;
        padding: 14px;
        border-radius: 16px;
        background: #fffdf8;
        border: 1px solid #eadfce;
      }

      .identity-card strong {
        display: block;
        margin-bottom: 8px;
      }

      .success,
      .error {
        padding: 12px 14px;
        border-radius: 16px;
        font-size: 0.92rem;
        white-space: pre-wrap;
      }

      .success {
        color: var(--success-text);
        background: var(--success-bg);
        border: 1px solid var(--success-stroke);
      }

      .error {
        color: var(--danger-text);
        background: var(--danger-bg);
        border: 1px solid var(--danger-stroke);
      }

      .inline-code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.82rem;
      }

      @media (max-width: 920px) {
        .hero,
        .surface-grid,
        .launch-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .page-shell {
          padding: 18px 14px 32px;
        }

        .topbar {
          flex-direction: column;
          align-items: stretch;
        }

        .hero,
        .surface-panel,
        .launch-panel,
        .status-card {
          border-radius: 22px;
        }

        .launch-actions {
          align-items: stretch;
        }

        button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">XC</div>
          <div class="brand-copy">
            <h1>XconectC Catalog</h1>
            <p>Choose the embedded surface that best fits the tenant workflow.</p>
          </div>
        </div>

        <nav class="nav-links">
          <a href="/dashboard">Back to dashboard</a>
          @if($user)
            <a href="/auth/logout" class="danger">Logout</a>
          @else
            <a href="/auth/login">Login</a>
          @endif
        </nav>
      </header>

      <section class="hero">
        <div>
          <div class="eyebrow">Catalog Workspace</div>
          <h2>Launch single, split, or single-xapp surfaces from one tenant home.</h2>
          <p>
            XconectC now exposes the same host-ready modes inside the lighter tenant shell.
            Resolve the subject once, then move between the catalog layouts or jump straight into
            one deployed xapp.
          </p>
        </div>

        <aside class="hero-meta">
          <div class="meta-card">
            <span>Signed In As</span>
            <strong>{{ $userEmail ? $userEmail : '(anonymous)' }}</strong>
            <div class="workspace">Workspace: xconectc</div>
          </div>
          <div class="meta-card">
            <span>Page Origin</span>
            <strong id="origin-chip">{{ $appUrl ?? 'http://localhost:8001' }}</strong>
            <div class="workspace">Tenant UI + backend on one origin</div>
          </div>
        </aside>
      </section>

      <section class="surface-panel">
        <h2 class="section-title">Choose a surface</h2>
        <p class="section-copy">
          All three modes use the same tenant identity and host contract. Only the shell changes.
        </p>

        <div class="surface-grid">
          <label class="surface-option">
            <input type="radio" name="mode" value="single-panel" checked />
            <span class="surface-card">
              <span class="surface-tag">Single</span>
              <strong>Single-panel marketplace</strong>
              <p>One compact catalog surface for the cleanest tenant embed flow.</p>
            </span>
          </label>

          <label class="surface-option">
            <input type="radio" name="mode" value="split-panel" />
            <span class="surface-card">
              <span class="surface-tag">Multi</span>
              <strong>Split-panel workspace</strong>
              <p>Keep the catalog and widget shell separated while staying in the same tenant lane.</p>
            </span>
          </label>

          <label class="surface-option">
            <input type="radio" name="mode" value="single-xapp" />
            <span class="surface-card">
              <span class="surface-tag">Direct</span>
              <strong>Single-xapp open</strong>
              <p>Resolve the subject once, then land directly on one deployed xapp.</p>
            </span>
          </label>
        </div>
      </section>

      <section class="launch-panel">
        <h2 class="section-title">Resolve and launch</h2>
        <p class="section-copy">
          The workspace stores a short-lived bootstrap token locally, then hands off to the
          selected surface.
        </p>

        <form id="launch-form">
          <div class="launch-grid">
            <label class="field">
              <span>Full Name</span>
              <input
                id="name"
                name="name"
                type="text"
                value="{{ $userName ?: 'Daniel Paul' }}"
                autocomplete="name"
              />
            </label>

            <label class="field">
              <span>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                value="{{ $userEmail ?: 'daniel.vladescu@gmail.com' }}"
                autocomplete="email"
              />
            </label>

            <label class="field">
              <span>Current Origin</span>
              <input id="origin" name="origin" type="text" readonly />
            </label>

            <label class="field">
              <span>Single Xapp Id</span>
              <input
                id="xappId"
                name="xappId"
                type="text"
                value="01KKYA9CQKNTG3N9PWM0Z31Z09"
                placeholder="Required only for single-xapp mode"
              />
            </label>
          </div>

          <div class="launch-actions">
            <button id="launch-btn" type="submit">Launch Surface</button>
            <div class="launch-hint">
              Current storage key:
              <span class="inline-code">xconectc-proof-identity</span>
            </div>
          </div>
        </form>
      </section>

      <section class="status-card">
        <div id="status" class="status-text">Ready to launch a tenant-scoped surface.</div>
        <div id="feedback"></div>
        <div id="identity" class="identity-card">
          <strong>Last resolved identity</strong>
          <div id="identity-copy"></div>
        </div>
      </section>
    </div>

    <div id="xapps-host-toast-root" style="display: none"></div>
    <div id="xapps-host-modal" style="display: none" aria-hidden="true">
      <div>
        <h3 id="xapps-host-modal-title">Notice</h3>
        <div id="xapps-host-modal-message"></div>
      </div>
    </div>

    <script>
      (() => {
        const storageKey = "xconectc-proof-identity";
        const bootstrapUrl = "/catalog/api/host-bootstrap";
        const launchForm = document.getElementById("launch-form");
        const launchBtn = document.getElementById("launch-btn");
        const statusEl = document.getElementById("status");
        const feedbackEl = document.getElementById("feedback");
        const identityCard = document.getElementById("identity");
        const identityCopy = document.getElementById("identity-copy");
        const originInput = document.getElementById("origin");
        const originChip = document.getElementById("origin-chip");
        const xappIdInput = document.getElementById("xappId");
        const csrfToken =
          document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

        const currentOrigin = window.location.origin;
        originInput.value = currentOrigin;
        originChip.textContent = currentOrigin;

        function renderFeedback(message, variant) {
          feedbackEl.textContent = "";
          if (!message) {
            return;
          }
          const node = document.createElement("div");
          node.className = variant === "error" ? "error" : "success";
          node.textContent = String(message);
          feedbackEl.appendChild(node);
        }

        function readStoredIdentity() {
          try {
            const raw = window.localStorage.getItem(storageKey) || "";
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        }

        function renderStoredIdentity() {
          const identity = readStoredIdentity();
          if (!identity || !identity.subjectId || !identity.email) {
            identityCard.style.display = "none";
            identityCopy.textContent = "";
            return;
          }

          identityCard.style.display = "block";
          identityCopy.innerHTML = "";

          const summary = document.createElement("div");
          summary.textContent = `${String(identity.name || identity.email)} · ${String(identity.email)}`;
          const meta = document.createElement("div");
          meta.style.marginTop = "6px";
          meta.style.color = "#6b7280";
          meta.innerHTML =
            `subject <span class="inline-code">${String(identity.subjectId)}</span>` +
            ` · mode <span class="inline-code">${String(identity.mode || "single-panel")}</span>`;

          identityCopy.append(summary, meta);
        }

        function renderEntryErrorFromQuery() {
          const url = new URL(window.location.href);
          const errorKey = String(url.searchParams.get("hostError") || "").trim();
          if (errorKey !== "missing_identity") {
            return;
          }
          statusEl.textContent = "The previous host session expired. Resolve the subject again.";
          renderFeedback(
            "The host could not continue because the bootstrap session expired or the browser identity was missing.",
            "error",
          );
        }

        async function bootstrapSubject(email, name, origin) {
          const response = await fetch(bootstrapUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
            },
            body: JSON.stringify({ email, name, origin }),
          });
          const raw = await response.text();
          const data = (() => {
            try {
              return raw ? JSON.parse(raw) : {};
            } catch {
              return {};
            }
          })();
          if (!response.ok) {
            throw new Error(String(data?.message || "host bootstrap failed"));
          }
          const subjectId = String(data?.subjectId || data?.subject_id || "").trim();
          const bootstrapToken = String(data?.bootstrapToken || data?.bootstrap_token || "").trim();
          const expiresIn = Number(data?.expiresIn || data?.expires_in || 300) || 300;
          if (!subjectId) {
            throw new Error("host bootstrap response missing subjectId");
          }
          if (!bootstrapToken) {
            throw new Error("host bootstrap response missing bootstrapToken");
          }
          return { subjectId, bootstrapToken, expiresIn };
        }

        launchForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          const name = String(document.getElementById("name").value || "").trim();
          const email = String(document.getElementById("email").value || "").trim().toLowerCase();
          const modeInput = document.querySelector('input[name="mode"]:checked');
          const mode = modeInput ? String(modeInput.value || "single-panel") : "single-panel";
          const xappId = String(xappIdInput.value || "").trim();

          if (!name || !email) {
            renderFeedback("Name and email are required to bootstrap the tenant host.", "error");
            return;
          }

          if (mode === "single-xapp" && !xappId) {
            renderFeedback("An xapp id is required for single-xapp mode.", "error");
            return;
          }

          launchBtn.disabled = true;
          statusEl.textContent = `Resolving subject for ${currentOrigin} ...`;
          renderFeedback("", "");

          try {
            const resolved = await bootstrapSubject(email, name, currentOrigin);
            window.localStorage.setItem(
              storageKey,
              JSON.stringify({
                name,
                email,
                mode,
                xappId,
                subjectId: resolved.subjectId,
                bootstrapToken: resolved.bootstrapToken,
                bootstrapExpiresAt: new Date(Date.now() + resolved.expiresIn * 1000).toISOString(),
                resolvedAt: new Date().toISOString(),
              }),
            );
            renderStoredIdentity();
            renderFeedback("Bootstrap complete. Launching the selected surface ...", "success");
            statusEl.textContent = `subjectId=${resolved.subjectId}`;

            if (mode === "single-xapp") {
              window.location.href = `/single-xapp.html?xappId=${encodeURIComponent(xappId)}`;
              return;
            }

            window.location.href = `/marketplace.html?mode=${encodeURIComponent(mode)}`;
          } catch (error) {
            statusEl.textContent = "Bootstrap failed.";
            renderFeedback(String(error?.message || "Unknown bootstrap failure"), "error");
            launchBtn.disabled = false;
          }
        });

        renderStoredIdentity();
        renderEntryErrorFromQuery();
      })();
    </script>
    <script type="module">
      import {
        createHostApiClient,
        createHostPaymentResumeState,
        createBridgeV2ApiHandlers,
        createHostUiBridge,
        createHostConfirmDialog,
      } from "/embed/sdk/xapps-embed-sdk.esm.js";

      function showToast(message, variant = "info") {
        const root = document.getElementById("xapps-host-toast-root");
        if (!root) return;
        root.style.display = "block";
        root.dataset.variant = variant;
        root.textContent = String(message || "");
      }

      function openModal(title, message) {
        const modal = document.getElementById("xapps-host-modal");
        const titleEl = document.getElementById("xapps-host-modal-title");
        const messageEl = document.getElementById("xapps-host-modal-message");
        if (!modal || !titleEl || !messageEl) return;
        titleEl.textContent = String(title || "Notice");
        messageEl.textContent = String(message || "");
        modal.style.display = "block";
        modal.setAttribute("aria-hidden", "false");
      }

      function closeModal() {
        const modal = document.getElementById("xapps-host-modal");
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
      }

      const hostApiClient = createHostApiClient();
      const paymentResumeState = createHostPaymentResumeState(window.location.href, {
        autoCleanUrl: true,
      });
      const confirmDialog = createHostConfirmDialog({
        open: ({ title, message }) => {
          openModal(title, message);
          return Promise.resolve(true);
        },
        close: () => closeModal(),
      });

      const hostUiBridge = createHostUiBridge({
        showNotification: (message, variant) => showToast(message, variant),
        showAlert: (message) => openModal("Notice", message),
        openModal: ({ title, message }) => openModal(title, message),
        closeModal: () => closeModal(),
        updateState: () => {},
        getContext: () => ({
          source: "xconectc-launcher",
          paymentResumeState,
        }),
        confirmDialog: confirmDialog,
      });

      const bridgeV2 = createBridgeV2ApiHandlers({
        hostApiClient,
        createCatalogSessionUrl: "/api/create-catalog-session",
        createWidgetSessionUrl: "/api/create-widget-session",
        installationsUrl: "/api/installations",
        tokenRefresh: "/api/bridge/token-refresh",
        sign: "/api/bridge/sign",
        vendorAssertion: "/api/bridge/vendor-assertion",
      });

      void bridgeV2;

      window.addEventListener("beforeunload", () => {
        hostUiBridge.detach();
      });
    </script>
  </body>
</html>
