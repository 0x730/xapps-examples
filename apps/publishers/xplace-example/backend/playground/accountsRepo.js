import { Pool } from "pg";
import { ulid } from "ulid";

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function mapAccount(row) {
  if (!row) return null;
  return {
    id: String(row.id || "").trim(),
    client_id: String(row.client_id || "").trim() || null,
    subject_id: String(row.subject_id || "").trim() || null,
    email: String(row.email || "").trim(),
    email_norm: String(row.email_norm || "").trim(),
    display_name: String(row.display_name || "").trim(),
    password_hash: String(row.password_hash || "").trim(),
    password_salt: String(row.password_salt || "").trim(),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createPlaygroundAccountsRepo({ databaseUrl }) {
  const pool = new Pool({
    connectionString: String(databaseUrl || "").trim(),
    max: 3,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS xplace_example_playground_accounts (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      subject_id TEXT,
      email TEXT NOT NULL,
      email_norm TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS xplace_example_playground_accounts_subject_idx
    ON xplace_example_playground_accounts(subject_id)
  `);

  async function findAccountByEmail(email) {
    const result = await pool.query(
      `
        SELECT *
        FROM xplace_example_playground_accounts
        WHERE email_norm = $1
        LIMIT 1
      `,
      [normalizeEmail(email)],
    );
    return mapAccount(result.rows[0]);
  }

  async function findAccountById(id) {
    const accountId = String(id || "").trim();
    if (!accountId) return null;
    const result = await pool.query(
      `
        SELECT *
        FROM xplace_example_playground_accounts
        WHERE id = $1
        LIMIT 1
      `,
      [accountId],
    );
    return mapAccount(result.rows[0]);
  }

  async function createAccount({
    clientId,
    subjectId,
    email,
    displayName,
    passwordHash,
    passwordSalt,
  }) {
    const now = new Date().toISOString();
    const result = await pool.query(
      `
        INSERT INTO xplace_example_playground_accounts (
          id,
          client_id,
          subject_id,
          email,
          email_norm,
          display_name,
          password_hash,
          password_salt,
          created_at,
          updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [
        ulid(),
        String(clientId || "").trim() || null,
        String(subjectId || "").trim() || null,
        String(email || "").trim(),
        normalizeEmail(email),
        String(displayName || "").trim(),
        String(passwordHash || "").trim(),
        String(passwordSalt || "").trim(),
        now,
        now,
      ],
    );
    return mapAccount(result.rows[0]);
  }

  return {
    findAccountById,
    findAccountByEmail,
    createAccount,
  };
}
