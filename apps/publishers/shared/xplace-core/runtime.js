import { randomUUID } from "node:crypto";
import { XPLACE_CALLBACK_KINDS } from "./constants.js";

export function nowIso() {
  return new Date().toISOString();
}

export function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function readString(...values) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}

export function insertOrUpdateRequestRecord(repo, input) {
  const createdAt = input.created_at || nowIso();
  return repo.upsertRequest({
    ...input,
    id: input.id || randomUUID(),
    created_at: createdAt,
    updated_at: input.updated_at || createdAt,
  });
}

export async function sendGatewayProgress({
  gatewayBaseUrl,
  repo,
  requestId,
  callbackToken,
  eventBody,
  requestLog,
}) {
  if (!callbackToken) return;
  try {
    const res = await fetch(`${gatewayBaseUrl}/v1/requests/${encodeURIComponent(requestId)}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${callbackToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    });
    const responseJson = await res.json().catch(() => null);
    await repo.insertCallbackAttempt({
      id: randomUUID(),
      request_id: requestId,
      callback_kind: XPLACE_CALLBACK_KINDS.EVENTS,
      ok: res.ok,
      status_code: res.status,
      response_json: responseJson,
      attempted_at: nowIso(),
    });
  } catch (err) {
    await repo.insertCallbackAttempt({
      id: randomUUID(),
      request_id: requestId,
      callback_kind: XPLACE_CALLBACK_KINDS.EVENTS,
      ok: false,
      error_message: err?.message || String(err),
      attempted_at: nowIso(),
    });
    requestLog?.warn(
      { err: err?.message || String(err), requestId },
      "Failed to push xplace progress event",
    );
  }
}

export async function sendGatewayComplete({ gatewayBaseUrl, repo, requestId, callbackToken, body }) {
  const res = await fetch(
    `${gatewayBaseUrl}/v1/requests/${encodeURIComponent(requestId)}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${callbackToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const gatewayBody = await res.json().catch(() => null);
  await repo.insertCallbackAttempt({
    id: randomUUID(),
    request_id: requestId,
    callback_kind: XPLACE_CALLBACK_KINDS.COMPLETE,
    ok: res.ok,
    status_code: res.status,
    response_json: gatewayBody,
    attempted_at: nowIso(),
  });
  return { status: res.status, body: gatewayBody, ok: res.ok };
}
