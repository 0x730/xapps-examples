<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XconectC Host Dashboard</title>
    <link rel="stylesheet" href="/host/starter.css" />
    <style>
      .dashboard-shell {
        display: grid;
        gap: 24px;
      }

      .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .dashboard-header h1 {
        margin: 0;
      }

      .dashboard-badge {
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: #fff;
        color: var(--muted);
        font-size: 13px;
      }

      .resource-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        margin-top: 18px;
      }

      .resource-card {
        display: grid;
        gap: 8px;
        padding: 16px 18px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: var(--card);
        text-decoration: none;
        color: inherit;
      }

      .resource-card strong {
        color: var(--text);
      }

      .resource-card span {
        color: var(--muted);
        font-size: 14px;
      }

      .dashboard-copy {
        margin: 0;
        color: var(--muted);
      }

      .dashboard-json {
        margin-top: 18px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #f8fbff;
        color: var(--muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="panel dashboard-shell">
        <div class="dashboard-header">
          <h1>XconectC Host</h1>
          <div class="dashboard-badge">Minimal Example</div>
        </div>

        <div class="eyebrow">Hosted Integrator Surface</div>
        <p class="dashboard-copy">
          This Laravel host keeps the operator shell local while the actual xapps lifecycle
          runs through the shared browser-host and backend-kit contract over `xconectc`.
        </p>
        <p class="dashboard-copy">
          This dashboard is intentionally minimal. Real integrators can mount the same host
          surface inside a fuller authenticated app and keep their own login, navigation,
          tenant context, and operator workflows.
        </p>

        <div class="resource-grid">
          <a class="resource-card" href="/">
            <strong>Launcher</strong>
            <span>Resolve one subject and start the hosted workspace.</span>
          </a>
          <a class="resource-card" href="/marketplace.html">
            <strong>Marketplace</strong>
            <span>Open the catalog-driven browser-host surface directly.</span>
          </a>
          <a class="resource-card" href="/single-xapp.html">
            <strong>Single Xapp</strong>
            <span>Launch one xapp while keeping the same host contract.</span>
          </a>
          <a class="resource-card" href="/health" target="_blank" rel="noreferrer">
            <strong>Health</strong>
            <span>Check the local host shell service endpoint.</span>
          </a>
        </div>

        <div class="dashboard-json">
          { "client": "{{ $clientId }}", "mode": "minimal-example-host" }
        </div>
      </section>
    </main>
  </body>
</html>
