import { Pool } from "pg";
import { XPLACE_SCHEMA_STATEMENTS } from "./schema.js";

function parseJsonSafe(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function redactDatabaseUrl(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "<invalid-database-url>";
  }
}

function clampLimit(value, fallback = 100, min = 1, max = 500) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

export async function createXplaceDb({ databaseUrl, poolMax = 10 }) {
  if (!String(databaseUrl || "").trim()) {
    throw new Error("XPLACE_DATABASE_URL is required");
  }

  const redactedTarget = redactDatabaseUrl(databaseUrl);
  const pool = new Pool({
    connectionString: databaseUrl,
    max: clampLimit(poolMax, 10, 1, 50),
    connectionTimeoutMillis: clampLimit(
      process.env.XPLACE_DATABASE_CONNECT_TIMEOUT_MS,
      10_000,
      1_000,
      60_000,
    ),
  });

  try {
    await pool.query("SELECT 1");
    for (const statement of XPLACE_SCHEMA_STATEMENTS) {
      await pool.query(statement);
    }
  } catch (error) {
    await pool.end().catch(() => {});
    throw new Error(
      `Failed to connect/bootstrap xplace PostgreSQL (${redactedTarget}): ${error?.message || String(error)}`,
    );
  }

  async function countRequests() {
    const result = await pool.query("SELECT count(*)::int AS c FROM xplace_requests");
    return Number(result.rows[0]?.c || 0);
  }

  async function upsertRequest(input) {
    const values = [
      input.id,
      input.request_id,
      input.tool_name,
      input.mode ?? null,
      input.status,
      JSON.stringify(input.payload || {}),
      input.result ? JSON.stringify(input.result) : null,
      input.callback_token || null,
      input.gateway_request_id || input.request_id || null,
      input.subject_id || null,
      input.created_at,
      input.updated_at,
      input.completed_at || null,
    ];
    await pool.query(
      `
        INSERT INTO xplace_requests (
          id,
          request_id,
          tool_name,
          mode,
          status,
          payload_json,
          result_json,
          callback_token,
          gateway_request_id,
          subject_id,
          created_at,
          updated_at,
          completed_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (request_id)
        DO UPDATE SET
          tool_name = EXCLUDED.tool_name,
          mode = EXCLUDED.mode,
          status = EXCLUDED.status,
          payload_json = EXCLUDED.payload_json,
          result_json = COALESCE(EXCLUDED.result_json, xplace_requests.result_json),
          callback_token = COALESCE(EXCLUDED.callback_token, xplace_requests.callback_token),
          gateway_request_id = COALESCE(
            EXCLUDED.gateway_request_id,
            xplace_requests.gateway_request_id
          ),
          subject_id = COALESCE(EXCLUDED.subject_id, xplace_requests.subject_id),
          updated_at = EXCLUDED.updated_at,
          completed_at = COALESCE(EXCLUDED.completed_at, xplace_requests.completed_at)
      `,
      values,
    );
  }

  async function insertWebhook({ id, event_id, event_type, payload, received_at }) {
    await pool.query(
      `
        INSERT INTO xplace_webhooks (
          id,
          event_id,
          event_type,
          payload_json,
          received_at
        ) VALUES ($1, $2, $3, $4, $5)
      `,
      [id, event_id || null, event_type || null, JSON.stringify(payload || {}), received_at],
    );
  }

  async function listWebhooks({ limit = 50 } = {}) {
    const normalizedLimit = clampLimit(limit, 50);
    const result = await pool.query(
      `
        SELECT
          id,
          event_id,
          event_type,
          payload_json,
          received_at
        FROM xplace_webhooks
        ORDER BY received_at DESC
        LIMIT $1
      `,
      [normalizedLimit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      event_id: row.event_id || null,
      event_type: row.event_type || null,
      payload: parseJsonSafe(row.payload_json, {}),
      received_at: row.received_at,
    }));
  }

  async function listRequests({ status = "", limit = 100 } = {}) {
    const trimmed = String(status || "").trim();
    const normalizedLimit = clampLimit(limit, 100);
    const values = [];
    let whereClause = "";
    if (trimmed) {
      values.push(trimmed);
      whereClause = `WHERE status = $${values.length}`;
    }
    values.push(normalizedLimit);
    const result = await pool.query(
      `
        SELECT
          request_id,
          tool_name,
          mode,
          status,
          payload_json,
          result_json,
          callback_token,
          gateway_request_id,
          subject_id,
          created_at,
          updated_at,
          completed_at
        FROM xplace_requests
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${values.length}
      `,
      values,
    );
    return result.rows.map((row) => ({
      request_id: row.request_id,
      tool_name: row.tool_name,
      mode: row.mode || null,
      status: row.status,
      payload: parseJsonSafe(row.payload_json, {}),
      result: parseJsonSafe(row.result_json, null),
      callback_token: row.callback_token || null,
      gateway_request_id: row.gateway_request_id || null,
      subject_id: row.subject_id || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || null,
    }));
  }

  async function getRequestByRequestId(requestId) {
    const result = await pool.query(
      `
        SELECT
          id,
          request_id,
          tool_name,
          mode,
          status,
          payload_json,
          result_json,
          callback_token,
          gateway_request_id,
          subject_id,
          created_at,
          updated_at,
          completed_at
        FROM xplace_requests
        WHERE request_id = $1
        LIMIT 1
      `,
      [String(requestId)],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      request_id: row.request_id,
      tool_name: row.tool_name,
      mode: row.mode || null,
      status: row.status,
      payload_json: row.payload_json,
      result_json: row.result_json,
      callback_token: row.callback_token || null,
      gateway_request_id: row.gateway_request_id || null,
      subject_id: row.subject_id || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || null,
    };
  }

  async function updateManualResponse({ requestId, nextStatus, resultRecordJson, completedAt }) {
    await pool.query(
      `
        UPDATE xplace_requests
        SET
          status = $2,
          result_json = $3,
          updated_at = $4,
          completed_at = $4
        WHERE request_id = $1
      `,
      [String(requestId), nextStatus, JSON.stringify(resultRecordJson || {}), completedAt],
    );
  }

  async function insertCallbackAttempt({
    id,
    request_id,
    callback_kind,
    ok,
    status_code,
    error_message,
    response_json,
    attempted_at,
  }) {
    await pool.query(
      `
        INSERT INTO xplace_callback_attempts (
          id,
          request_id,
          callback_kind,
          ok,
          status_code,
          error_message,
          response_json,
          attempted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        String(request_id),
        String(callback_kind),
        Boolean(ok),
        Number.isFinite(Number(status_code)) ? Number(status_code) : null,
        error_message ? String(error_message) : null,
        response_json ? JSON.stringify(response_json) : null,
        String(attempted_at),
      ],
    );
  }

  return {
    dbKind: "postgres",
    dbTarget: redactedTarget,
    pool,
    countRequests,
    upsertRequest,
    insertWebhook,
    listWebhooks,
    listRequests,
    getRequestByRequestId,
    updateManualResponse,
    insertCallbackAttempt,
  };
}
