import { randomBytes } from "node:crypto";

function nowMs() {
  return Date.now();
}

function toIso(input) {
  return new Date(input).toISOString();
}

export function createPlaygroundSessionStore({ sessionTtlSeconds = 4 * 60 * 60 } = {}) {
  const sessions = new Map();
  const ttlMs = Math.max(60, Number(sessionTtlSeconds || 0)) * 1000;

  function cleanupExpired() {
    const cutoff = nowMs();
    for (const [token, session] of sessions.entries()) {
      if (Number(session.expires_at_ms || 0) <= cutoff) {
        sessions.delete(token);
      }
    }
  }

  function createSession({ context, account = null }) {
    cleanupExpired();
    const issuedAtMs = nowMs();
    const token = randomBytes(24).toString("base64url");
    const next = {
      token,
      context: {
        installation_id: String(context?.installation_id || "").trim() || null,
        client_id: String(context?.client_id || "").trim() || null,
        xapp_id: String(context?.xapp_id || "").trim() || null,
        subject_id: String(context?.subject_id || "").trim() || null,
        host_origin: String(context?.host_origin || "").trim() || null,
        latest_request_id: String(context?.latest_request_id || "").trim() || null,
      },
      widget_token: String(context?.widget_token || "").trim() || null,
      account: account
        ? {
            id: String(account.id || "").trim(),
            email: String(account.email || "").trim(),
            display_name: String(account.display_name || "").trim(),
          }
        : null,
      issued_at: toIso(issuedAtMs),
      expires_at: toIso(issuedAtMs + ttlMs),
      expires_at_ms: issuedAtMs + ttlMs,
    };
    sessions.set(token, next);
    return next;
  }

  function readSession(token) {
    cleanupExpired();
    const key = String(token || "").trim();
    if (!key) return null;
    const current = sessions.get(key);
    if (!current) return null;
    if (Number(current.expires_at_ms || 0) <= nowMs()) {
      sessions.delete(key);
      return null;
    }
    return current;
  }

  function bindAccount(token, account) {
    const current = readSession(token);
    if (!current) return null;
    const next = {
      ...current,
      account: {
        id: String(account.id || "").trim(),
        email: String(account.email || "").trim(),
        display_name: String(account.display_name || "").trim(),
      },
    };
    sessions.set(String(token || "").trim(), next);
    return next;
  }

  function updateSession(token, input = {}) {
    const current = readSession(token);
    if (!current) return null;
    const nextContextInput =
      input.context && typeof input.context === "object" ? input.context : null;
    const next = {
      ...current,
      context: nextContextInput
        ? {
            ...current.context,
            installation_id: Object.prototype.hasOwnProperty.call(
              nextContextInput,
              "installation_id",
            )
              ? String(nextContextInput.installation_id || "").trim() || null
              : current.context.installation_id,
            client_id: Object.prototype.hasOwnProperty.call(nextContextInput, "client_id")
              ? String(nextContextInput.client_id || "").trim() || null
              : current.context.client_id,
            xapp_id: Object.prototype.hasOwnProperty.call(nextContextInput, "xapp_id")
              ? String(nextContextInput.xapp_id || "").trim() || null
              : current.context.xapp_id,
            subject_id: Object.prototype.hasOwnProperty.call(nextContextInput, "subject_id")
              ? String(nextContextInput.subject_id || "").trim() || null
              : current.context.subject_id,
            host_origin: Object.prototype.hasOwnProperty.call(nextContextInput, "host_origin")
              ? String(nextContextInput.host_origin || "").trim() || null
              : current.context.host_origin,
            latest_request_id: Object.prototype.hasOwnProperty.call(
              nextContextInput,
              "latest_request_id",
            )
              ? String(nextContextInput.latest_request_id || "").trim() || null
              : current.context.latest_request_id,
          }
        : current.context,
      widget_token:
        input.widgetToken === null || input.widgetToken === undefined
          ? current.widget_token
          : String(input.widgetToken || "").trim() || null,
    };
    sessions.set(String(token || "").trim(), next);
    return next;
  }

  function clearAccount(token) {
    const current = readSession(token);
    if (!current) return null;
    const next = { ...current, account: null };
    sessions.set(String(token || "").trim(), next);
    return next;
  }

  return {
    createSession,
    readSession,
    bindAccount,
    updateSession,
    clearAccount,
  };
}
