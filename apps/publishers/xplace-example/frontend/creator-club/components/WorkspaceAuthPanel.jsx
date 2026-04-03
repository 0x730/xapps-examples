import React from "react";
import { StatusBox } from "./StatusBox.jsx";

export function WorkspaceAuthPanel({ session, authLinks, linkStatus, linkBusy, linkedHint }) {
  if (session?.account) return null;

  return (
    <section className="creator-card creator-stack">
      <div className="creator-section-head">
        <div>
          <p className="creator-kicker">Account</p>
          <h2>Login or register.</h2>
        </div>
        <div className="creator-meta">Contained member flow.</div>
      </div>

      {linkBusy ? (
        <StatusBox>Recovering the linked session…</StatusBox>
      ) : linkStatus?.linked ? (
        <StatusBox tone="warn">
          {linkedHint ? `Link is active for ${linkedHint}.` : "Link is active."} Continue with a
          Creator Club account to use plans and tools cleanly.
        </StatusBox>
      ) : (
        <StatusBox tone="warn">No Creator Club account is linked to this session yet.</StatusBox>
      )}

      <div className="creator-actions">
        {authLinks?.login_url ? (
          <a className="creator-button primary" href={authLinks.login_url}>
            Login and link
          </a>
        ) : null}
        {authLinks?.register_url ? (
          <a className="creator-button secondary" href={authLinks.register_url}>
            Register and link
          </a>
        ) : null}
      </div>
    </section>
  );
}
