export const XPLACE_SCHEMA_STATEMENTS = Object.freeze([
  `
    CREATE TABLE IF NOT EXISTS xplace_requests (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL UNIQUE,
      tool_name TEXT NOT NULL,
      mode TEXT,
      status TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      result_json TEXT,
      callback_token TEXT,
      gateway_request_id TEXT,
      subject_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `,
  `CREATE INDEX IF NOT EXISTS xplace_requests_status_idx ON xplace_requests(status)`,
  `CREATE INDEX IF NOT EXISTS xplace_requests_tool_idx ON xplace_requests(tool_name)`,
  `CREATE INDEX IF NOT EXISTS xplace_requests_created_idx ON xplace_requests(created_at)`,
  `CREATE INDEX IF NOT EXISTS xplace_requests_mode_idx ON xplace_requests(mode)`,
  `
    CREATE TABLE IF NOT EXISTS xplace_webhooks (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      event_type TEXT,
      payload_json TEXT NOT NULL,
      received_at TEXT NOT NULL
    )
  `,
  `CREATE INDEX IF NOT EXISTS xplace_webhooks_event_id_idx ON xplace_webhooks(event_id)`,
  `CREATE INDEX IF NOT EXISTS xplace_webhooks_event_type_idx ON xplace_webhooks(event_type)`,
  `CREATE INDEX IF NOT EXISTS xplace_webhooks_received_idx ON xplace_webhooks(received_at)`,
  `
    CREATE TABLE IF NOT EXISTS xplace_callback_attempts (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      callback_kind TEXT NOT NULL,
      ok BOOLEAN NOT NULL,
      status_code INTEGER,
      error_message TEXT,
      response_json TEXT,
      attempted_at TEXT NOT NULL
    )
  `,
  `CREATE INDEX IF NOT EXISTS xplace_callback_attempts_request_idx ON xplace_callback_attempts(request_id)`,
  `CREATE INDEX IF NOT EXISTS xplace_callback_attempts_kind_idx ON xplace_callback_attempts(callback_kind)`,
  `CREATE INDEX IF NOT EXISTS xplace_callback_attempts_attempted_idx ON xplace_callback_attempts(attempted_at)`,
]);
