<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XconectC Dashboard</title>
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
        --panel: rgba(255, 255, 255, 0.8);
        --panel-strong: rgba(255, 255, 255, 0.92);
        --stroke: rgba(103, 79, 45, 0.12);
        --ink: #1f2937;
        --muted: #6b7280;
        --accent: #c7562e;
        --accent-deep: #8f3418;
        --accent-soft: #f5d8c8;
        --leaf: #48634d;
        --shadow: 0 20px 60px rgba(72, 53, 29, 0.12);
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
          radial-gradient(circle at 85% 15%, rgba(72, 99, 77, 0.14), transparent 24%),
          linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
      }

      .page-shell {
        max-width: 1160px;
        margin: 0 auto;
        padding: 28px 20px 48px;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 24px;
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

      .account-pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--stroke);
        backdrop-filter: blur(12px);
      }

      .account-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .account-meta strong {
        font-size: 0.95rem;
      }

      .account-meta span {
        font-size: 0.8rem;
        color: var(--muted);
      }

      .logout-btn {
        color: var(--accent-deep);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 600;
      }

      .hero {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
        gap: 22px;
        padding: 28px;
        border-radius: 28px;
        background:
          linear-gradient(140deg, rgba(255, 248, 242, 0.96) 0%, rgba(251, 246, 237, 0.9) 100%);
        border: 1px solid rgba(154, 111, 59, 0.12);
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto -80px -90px auto;
        width: 280px;
        height: 280px;
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
        max-width: 13ch;
        font-family: "Space Grotesk", sans-serif;
        font-size: clamp(2rem, 4vw, 3.6rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .hero p {
        margin: 16px 0 0;
        max-width: 58ch;
        color: #4b5563;
        font-size: 1rem;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 600;
        transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--accent) 0%, #dc7148 100%);
        color: #fff;
        box-shadow: 0 12px 24px rgba(199, 86, 46, 0.22);
      }

      .btn-secondary {
        color: var(--ink);
        background: rgba(255, 255, 255, 0.76);
        border: 1px solid var(--stroke);
      }

      .hero-aside {
        position: relative;
        z-index: 1;
        display: grid;
        gap: 14px;
        align-content: start;
      }

      .signal-card,
      .session-card,
      .panel {
        background: var(--panel-strong);
        border: 1px solid var(--stroke);
        border-radius: 22px;
        box-shadow: 0 10px 24px rgba(77, 59, 32, 0.07);
      }

      .signal-card {
        padding: 18px;
      }

      .signal-label {
        margin: 0 0 8px;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .signal-value {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }

      .signal-value strong {
        font-size: 2.2rem;
        line-height: 1;
        font-family: "Space Grotesk", sans-serif;
      }

      .signal-value span {
        color: var(--muted);
        font-size: 0.92rem;
      }

      .signal-footnote {
        margin-top: 8px;
        color: var(--leaf);
        font-size: 0.88rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
        gap: 20px;
        margin-top: 22px;
      }

      .panel {
        padding: 24px;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }

      .panel-title {
        margin: 0;
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.2rem;
      }

      .panel-subtitle {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .stat-card {
        padding: 18px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(250, 245, 236, 0.92), rgba(255, 255, 255, 0.88));
        border: 1px solid rgba(111, 90, 55, 0.12);
      }

      .stat-card span {
        display: block;
        color: var(--muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }

      .stat-card strong {
        display: block;
        margin-top: 8px;
        font-size: 2rem;
        line-height: 1;
        font-family: "Space Grotesk", sans-serif;
      }

      .link-list {
        display: grid;
        gap: 12px;
      }

      .link-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px 18px;
        border-radius: 18px;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid var(--stroke);
      }

      .link-card:hover {
        background: #fffdf9;
      }

      .link-copy strong {
        display: block;
        font-size: 0.98rem;
      }

      .link-copy span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 0.86rem;
      }

      .link-arrow {
        color: var(--accent);
        font-size: 1.1rem;
        font-weight: 700;
      }

      .session-card {
        padding: 18px;
      }

      .session-card pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        color: #334155;
        font-size: 0.88rem;
        line-height: 1.7;
        font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
      }

      .auth-card {
        max-width: 640px;
        margin: 56px auto 0;
        padding: 34px;
        text-align: center;
      }

      .auth-card h2 {
        margin: 0;
        font-family: "Space Grotesk", sans-serif;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
      }

      .auth-card p {
        margin: 14px auto 0;
        max-width: 38ch;
        color: var(--muted);
      }

      .auth-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      @media (max-width: 900px) {
        .hero,
        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .page-shell {
          padding: 18px 14px 36px;
        }

        .topbar {
          flex-direction: column;
          align-items: stretch;
        }

        .account-pill {
          justify-content: space-between;
        }

        .hero,
        .panel,
        .auth-card {
          padding: 20px;
          border-radius: 22px;
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
            <h1>XconectC</h1>
            <p>Tenant workspace, catalog surfaces, and OIDC-backed sample dashboard.</p>
          </div>
        </div>

        @if($user)
          <div class="account-pill">
            <div class="account-meta">
              <strong>{{ $user->name }}</strong>
              <span>{{ $userEmail }}</span>
            </div>
            <a href="/auth/logout" class="logout-btn">Logout</a>
          </div>
        @endif
      </header>

      @if($user)
        <section class="hero">
          <div>
            <div class="eyebrow">Workspace Snapshot</div>
            <h2>Keep the tenant view clean, fast, and directly usable.</h2>
            <p>
              This sample tenant now acts like a real client lane: the dashboard highlights
              workload signals, API surfaces, and the catalog workspace without the old heavy
              dark-shell treatment.
            </p>
            <div class="hero-actions">
              <a href="/catalog" class="btn btn-primary">Open Catalog Workspace</a>
              <a href="/api/.well-known/openid-configuration" target="_blank" class="btn btn-secondary">Inspect OIDC Metadata</a>
            </div>
          </div>

          <aside class="hero-aside">
            <div class="signal-card">
              <p class="signal-label">Workspace Load</p>
              <div class="signal-value">
                <strong>{{ $projectsCount + $issuesCount + $inventoryCount }}</strong>
                <span>tracked records</span>
              </div>
              <div class="signal-footnote">Projects, issues, and inventory are live from the tenant dataset.</div>
            </div>

            <div class="session-card">
              <p class="signal-label">Session Context</p>
              <pre>{ "client": "{{ $clientId }}", "email": "{{ $userEmail }}" }</pre>
            </div>
          </aside>
        </section>

        <section class="dashboard-grid">
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Operational Overview</h3>
                <p class="panel-subtitle">A lighter summary of the tenant’s current surface area.</p>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <span>Projects</span>
                <strong>{{ $projectsCount }}</strong>
              </div>
              <div class="stat-card">
                <span>Issues</span>
                <strong>{{ $issuesCount }}</strong>
              </div>
              <div class="stat-card">
                <span>Inventory</span>
                <strong>{{ $inventoryCount }}</strong>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Quick Surfaces</h3>
                <p class="panel-subtitle">Direct links to the useful tenant endpoints.</p>
              </div>
            </div>

            <div class="link-list">
              <a href="/catalog" class="link-card">
                <div class="link-copy">
                  <strong>Catalog Workspace</strong>
                  <span>Tenant-scoped marketplace view for installed and published xapps.</span>
                </div>
                <div class="link-arrow">→</div>
              </a>

              <a href="/api/profile" target="_blank" class="link-card">
                <div class="link-copy">
                  <strong>Profile API</strong>
                  <span>Inspect the signed-in subject profile returned by the sample backend.</span>
                </div>
                <div class="link-arrow">→</div>
              </a>

              <a href="/api/inventory" target="_blank" class="link-card">
                <div class="link-copy">
                  <strong>Inventory API</strong>
                  <span>Raw inventory items served by the tenant lane.</span>
                </div>
                <div class="link-arrow">→</div>
              </a>

              <a href="/api/.well-known/openid-configuration" target="_blank" class="link-card">
                <div class="link-copy">
                  <strong>OIDC Configuration</strong>
                  <span>Discovery metadata for the Laravel OIDC sample issuer.</span>
                </div>
                <div class="link-arrow">→</div>
              </a>
            </div>
          </div>
        </section>
      @else
        <section class="panel auth-card">
          <div class="eyebrow">Welcome</div>
          <h2>Sign in to enter the XconectC tenant workspace.</h2>
          <p>
            Use the local OIDC flow to reach the dashboard, tenant APIs, and the embedded
            catalog surfaces from the same lighter workspace shell.
          </p>
          <div class="auth-actions">
            <a href="/auth/login" class="btn btn-primary">Sign In</a>
            <a href="/auth/register" class="btn btn-secondary">Register</a>
            <a href="/catalog" class="btn btn-secondary">Browse Catalog Workspace</a>
          </div>
        </section>
      @endif
    </div>
  </body>
</html>
