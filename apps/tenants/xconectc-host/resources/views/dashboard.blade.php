<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XconectC Host Dashboard</title>
    <style>
      :root { --bg: #0f172a; --card-bg: #1e293b; --text: #f1f5f9; --text-muted: #94a3b8; --primary: #3b82f6; --danger: #ef4444; }
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.5; }
      .container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
      h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .user-info { display: flex; align-items: center; gap: 12px; font-size: 14px; }
      .logout-btn { color: var(--danger); text-decoration: none; font-weight: 500; }
      .logout-btn:hover { text-decoration: underline; }
      .card { background: var(--card-bg); border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px; }
      .stat { background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center; }
      .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      .stat-value { font-size: 28px; font-weight: 700; margin-top: 4px; }
      .section-title { font-size: 14px; font-weight: 600; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; }
      .nav-links { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
      .nav-links a { background: rgba(255, 255, 255, 0.05); color: var(--text); padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; transition: background 0.2s; }
      .nav-links a:hover { background: rgba(255, 255, 255, 0.1); }
      .footer-info { font-size: 13px; color: var(--text-muted); background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 8px; font-family: monospace; }
      .auth-prompt { text-align: center; padding: 40px; }
      .btn-primary { background: var(--primary); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>XconectC Host</h1>
        @if($user)
          <div class="user-info">
            <span>{{ $user->name }}</span>
            <a href="/auth/logout" class="logout-btn">Logout</a>
          </div>
        @endif
      </div>

      <div class="card">
        @if($user)
          <div class="section-title">Overview</div>
          <div class="grid">
            <div class="stat"><div class="stat-label">Projects</div><div class="stat-value">{{ $projectsCount }}</div></div>
            <div class="stat"><div class="stat-label">Issues</div><div class="stat-value">{{ $issuesCount }}</div></div>
            <div class="stat"><div class="stat-label">Inventory</div><div class="stat-value">{{ $inventoryCount }}</div></div>
          </div>

          <div class="section-title">Resources</div>
          <div class="nav-links">
            <a href="/api/projects" target="_blank">Projects API</a>
            <a href="/api/issues" target="_blank">Issues API</a>
            <a href="/api/inventory" target="_blank">Inventory API</a>
            <a href="/api/profile" target="_blank">Profile API</a>
            <a href="/api/.well-known/openid-configuration" target="_blank">OIDC Config</a>
            <a href="/catalog">Embedded Catalog</a>
          </div>

          <div class="section-title">Session Data</div>
          <div class="footer-info">
            { "client": "{{ $clientId }}", "email": "{{ $userEmail }}" }
          </div>
        @else
          <div class="auth-prompt">
            <p style="margin-bottom: 24px; color: var(--text-muted);">Please sign in to access your dashboard.</p>
            <div style="display: flex; justify-content: center; gap: 16px;">
              <a href="/auth/login" class="btn-primary">Sign In</a>
              <a href="/auth/register" style="color: var(--text); padding: 10px 20px; text-decoration: none;">Register</a>
            </div>

            <div style="margin-top: 18px;">
              <a href="/catalog" class="btn-primary" style="background: rgba(255,255,255,0.08);">Browse Public Catalog</a>
            </div>
          </div>
        @endif
      </div>
    </div>
  </body>
</html>
