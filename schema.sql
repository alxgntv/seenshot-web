-- ─── Ariadne's Thread [AT-0037] ─────────────────────
-- What: One-time PKCE authorization codes for the Mac app
-- Why:  Same D1 as seenshot-api; Worker authorize/token persist the grant here
-- Date: 2026-08-27
-- Related: [AT-0190] infra→backend/schema.sql, [AT-0040] src/oauth.ts
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  code TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  uid TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE INDEX IF NOT EXISTS oauth_codes_expires ON oauth_authorization_codes (expires_at);
