export const PLAYGROUND_BOOTSTRAP =
  window.__XPLACE_CREATOR_CLUB_BOOTSTRAP__ &&
  typeof window.__XPLACE_CREATOR_CLUB_BOOTSTRAP__ === "object"
    ? window.__XPLACE_CREATOR_CLUB_BOOTSTRAP__
    : null;

export function normalizeLinkStatus(input) {
  if (!input || typeof input !== "object") {
    return { linked: false };
  }
  return {
    linked: Boolean(input.linked),
    reason: String(input.reason || "").trim() || null,
    publisherUserId: String(input.publisherUserId || "").trim() || null,
    publisherUserEmail: String(input.publisherUserEmail || "").trim() || null,
    linkId: String(input.link_id || "").trim() || null,
  };
}

export async function apiRequest(apiBase, sessionToken, path, options = {}) {
  const response = await fetch(`${String(apiBase || "").trim()}${path}`, {
    method: options.method || "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-xplace-playground-session": sessionToken,
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      String(json?.error?.message || json?.message || "Playground API request failed"),
    );
  }
  return json;
}

export function openHostedPaymentPage(url) {
  const nextUrl = String(url || "").trim();
  if (!nextUrl || typeof window === "undefined") return false;
  const opened = window.open(nextUrl, "_blank", "noopener,noreferrer");
  return Boolean(opened);
}
