<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $mode === 'register' ? 'Register' : 'Sign In' }} · XconectC</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg: #f4efe4;
        --panel: rgba(255, 255, 255, 0.92);
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
        --shadow: 0 24px 64px rgba(72, 53, 29, 0.14);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "IBM Plex Sans", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(199, 86, 46, 0.16), transparent 28%),
          radial-gradient(circle at 85% 15%, rgba(72, 99, 77, 0.13), transparent 24%),
          linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
        display: grid;
        place-items: center;
        padding: 18px;
      }

      .shell {
        width: min(1040px, 100%);
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
        border-radius: 30px;
        overflow: hidden;
        background: rgba(255, 251, 245, 0.7);
        border: 1px solid rgba(154, 111, 59, 0.12);
        box-shadow: var(--shadow);
      }

      .intro,
      .form-panel {
        padding: 36px 34px;
      }

      .intro {
        position: relative;
        background:
          linear-gradient(150deg, rgba(255, 245, 238, 0.96) 0%, rgba(248, 242, 232, 0.92) 100%);
      }

      .intro::after {
        content: "";
        position: absolute;
        right: -70px;
        bottom: -90px;
        width: 250px;
        height: 250px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(199, 86, 46, 0.18), transparent 68%);
        pointer-events: none;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 26px;
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
      }

      .brand-copy strong {
        display: block;
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.1rem;
      }

      .brand-copy span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 0.9rem;
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

      .intro h1 {
        margin: 0;
        max-width: 12ch;
        font-family: "Space Grotesk", sans-serif;
        font-size: clamp(2rem, 4vw, 3.4rem);
        line-height: 0.96;
        letter-spacing: -0.04em;
      }

      .intro p {
        margin: 16px 0 0;
        max-width: 44ch;
        color: #4b5563;
      }

      .intro-points {
        display: grid;
        gap: 12px;
        margin-top: 28px;
      }

      .intro-point {
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--stroke);
      }

      .intro-point strong {
        display: block;
        font-size: 0.98rem;
      }

      .intro-point span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .form-panel {
        background: var(--panel);
      }

      .form-panel h2 {
        margin: 0;
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.8rem;
      }

      .form-panel > p {
        margin: 10px 0 0;
        color: var(--muted);
      }

      .banner {
        margin-top: 22px;
        padding: 12px 14px;
        border-radius: 16px;
        font-size: 0.92rem;
      }

      .banner.success {
        color: var(--success-text);
        background: var(--success-bg);
        border: 1px solid var(--success-stroke);
      }

      .banner.error {
        color: var(--danger-text);
        background: var(--danger-bg);
        border: 1px solid var(--danger-stroke);
      }

      form {
        display: grid;
        gap: 16px;
        margin-top: 24px;
      }

      .field {
        display: grid;
        gap: 8px;
      }

      label {
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      input {
        min-height: 50px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1px solid rgba(103, 79, 45, 0.16);
        background: rgba(255, 255, 255, 0.92);
        color: var(--ink);
        font: inherit;
      }

      input:focus {
        outline: 2px solid rgba(199, 86, 46, 0.16);
        border-color: rgba(199, 86, 46, 0.38);
      }

      button {
        min-height: 50px;
        border: none;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent) 0%, #dc7148 100%);
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(199, 86, 46, 0.22);
      }

      .alt-link {
        margin-top: 18px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .alt-link a,
      .utility-links a {
        color: var(--accent-deep);
        text-decoration: none;
        font-weight: 600;
      }

      .utility-links {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 22px;
        font-size: 0.9rem;
      }

      @media (max-width: 900px) {
        .shell {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .intro,
        .form-panel {
          padding: 24px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="intro">
        <div class="brand">
          <div class="brand-mark">XC</div>
          <div class="brand-copy">
            <strong>XconectC</strong>
            <span>Laravel OIDC sample tenant</span>
          </div>
        </div>

        <div class="eyebrow">{{ $mode === 'register' ? 'Create Account' : 'Sign In' }}</div>
        <h1>{{ $title }}</h1>
        <p>{{ $subtitle }}</p>

        <div class="intro-points">
          <div class="intro-point">
            <strong>Tenant workspace</strong>
            <span>Dashboard, APIs, and browser-host launcher stay in the same lane.</span>
          </div>
          <div class="intro-point">
            <strong>Local OIDC flow</strong>
            <span>Use this mock identity surface to continue the full sample flow locally.</span>
          </div>
          <div class="intro-point">
            <strong>Cleaner sample UX</strong>
            <span>Aligned visual language across dashboard, launcher, and auth entry points.</span>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <h2>{{ $mode === 'register' ? 'Join the workspace' : 'Welcome back' }}</h2>
        <p>{{ $mode === 'register' ? 'Create a local account for the sample tenant.' : 'Use the seeded account or your own registered one.' }}</p>

        @if(!empty($messageText))
          <div class="banner {{ $messageType === 'success' ? 'success' : 'error' }}">
            {{ $messageText }}
          </div>
        @endif

        <form method="POST" action="{{ $mode === 'register' ? '/auth/register' : '/auth/login' }}">
          <input type="hidden" name="redirect_uri" value="{{ $redirectUri }}" />
          <input type="hidden" name="state" value="{{ $state }}" />
          <input type="hidden" name="client_id" value="{{ $clientId }}" />

          @if($mode === 'register')
            <div class="field">
              <label for="name">Name</label>
              <input id="name" type="text" name="name" placeholder="Daniel Paul" required />
            </div>
          @endif

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value="{{ $emailDefault ?? '' }}"
              placeholder="email@example.com"
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value="{{ $passwordDefault ?? '' }}"
              placeholder="Your password"
              required
            />
          </div>

          <button type="submit">{{ $mode === 'register' ? 'Create Account' : 'Sign In' }}</button>
        </form>

        <div class="alt-link">
          @if($mode === 'register')
            Already have an account?
            <a href="/auth/login?redirect_uri={{ urlencode($redirectUri ?? '') }}&state={{ urlencode($state ?? '') }}&client_id={{ urlencode($clientId ?? '') }}">Sign in</a>
          @else
            Need an account?
            <a href="/auth/register?redirect_uri={{ urlencode($redirectUri ?? '') }}&state={{ urlencode($state ?? '') }}&client_id={{ urlencode($clientId ?? '') }}">Register</a>
          @endif
        </div>

        <div class="utility-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/catalog">Catalog</a>
        </div>
      </section>
    </div>
  </body>
</html>
