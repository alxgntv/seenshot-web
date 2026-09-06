import { importPKCS8, SignJWT } from "jose";
import { userFromRequest } from "./auth";
import type { SeenShotEnv } from "./env";

// ─── Ariadne's Thread [AT-0040] ─────────────────────
// What: OAuth 2.0 Authorization Code + PKCE S256 for the Mac public client
// Why:  seenshot.app is the AS; Mac exchanges code for a Firebase custom token
// Date: 2026-08-27
// Related: [AT-0037] schema.sql, [AT-0039] src/index.ts, app→AuthSession.cpp:startWebsiteSignIn
// ─────────────────────────────────────────────────────

export type OAuthEnv = Pick<
  SeenShotEnv,
  "DB" | "FIREBASE_PROJECT_ID" | "FIREBASE_SERVICE_ACCOUNT_JSON"
>;

export const OAUTH_CLIENT_ID = "com.seenshot.app";
export const OAUTH_REDIRECT_URI = "seenshot://oauth";
const CODE_TTL_MS = 120_000;
const CHALLENGE_RE = /^[A-Za-z0-9\-._~]{43,128}$/;
const STATE_RE = /^[A-Za-z0-9\-._~]{1,256}$/;
const CUSTOM_TOKEN_AUD =
  "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";

export type AuthorizeQuery = {
  responseType: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  state: string;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

type StoredCode = {
  uid: string;
  email: string;
  code_challenge: string;
  client_id: string;
  redirect_uri: string;
};

export function oauthError(error: string, status: number, description: string): Response {
  console.warn(`oauth: error=${error} status=${status} description=${description}`);
  return Response.json({ error, error_description: description }, { status });
}

function readAuthorizeParams(source: URLSearchParams): AuthorizeQuery {
  return {
    responseType: source.get("response_type") || "",
    clientId: source.get("client_id") || "",
    redirectUri: source.get("redirect_uri") || "",
    codeChallenge: source.get("code_challenge") || "",
    codeChallengeMethod: source.get("code_challenge_method") || "",
    state: source.get("state") || "",
  };
}

export function validateAuthorizeQuery(query: AuthorizeQuery): string | null {
  if (query.responseType !== "code") {
    return "response_type must be code";
  }
  if (query.clientId !== OAUTH_CLIENT_ID) {
    return "unauthorized client_id";
  }
  if (query.redirectUri !== OAUTH_REDIRECT_URI) {
    return "redirect_uri is not registered";
  }
  if (query.codeChallengeMethod !== "S256") {
    return "code_challenge_method must be S256";
  }
  if (!CHALLENGE_RE.test(query.codeChallenge)) {
    return "code_challenge is invalid";
  }
  if (!STATE_RE.test(query.state)) {
    return "state is invalid";
  }
  return null;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of raw) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function s256Challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

function parseServiceAccount(raw: string | undefined, projectId: string): ServiceAccount {
  if (!raw) {
    console.error("oauth: FIREBASE_SERVICE_ACCOUNT_JSON missing");
    throw new Error("server_error");
  }
  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(raw) as ServiceAccount;
  } catch (error) {
    console.error("oauth: service account JSON parse failed", error);
    throw new Error("server_error");
  }
  if (!parsed.client_email || !parsed.private_key) {
    console.error("oauth: service account missing client_email or private_key");
    throw new Error("server_error");
  }
  if (parsed.project_id && parsed.project_id !== projectId) {
    console.warn(
      `oauth: service account project_id=${parsed.project_id} env project=${projectId}`,
    );
  }
  console.log(`oauth: service account emailChars=${parsed.client_email.length}`);
  return parsed;
}

async function mintCustomToken(env: OAuthEnv, uid: string): Promise<string> {
  const account = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON, env.FIREBASE_PROJECT_ID);
  const pem = account.private_key.replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "RS256");
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(account.client_email)
    .setSubject(account.client_email)
    .setAudience(CUSTOM_TOKEN_AUD)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  console.log(`oauth: minted custom token uid=${uid} chars=${token.length}`);
  return token;
}

// ─── Ariadne's Thread [AT-0045] ─────────────────────
// What: GET /oauth/authorize always serves consent HTML after query validation
// Why:  Worker cookie vs localStorage refreshToken 302'd /signin↔/authorize forever
// Date: 2026-08-27
// Related: [AT-0043] public/js/oauth-authorize.js:paintEmail, [AT-0046] public/js/signin.js
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0419] ─────────────────────
// What: Validate GET /oauth/authorize query and leave HTML to the App Router handler
// Why:  Next.js cannot serve page.tsx and POST route.ts on the same segment; consent UI is React
// Date: 2026-09-03
// Related: [AT-0045] src/oauth.ts:handleAuthorizeGet, [AT-0047] src/oauth.ts:handleAuthorizeGet
// ─────────────────────────────────────────────────────
export function authorizeGetInvalidResponse(request: Request): Response | null {
  const url = new URL(request.url);
  const query = readAuthorizeParams(url.searchParams);
  const invalid = validateAuthorizeQuery(query);
  if (invalid) {
    console.warn(`oauth: GET authorize invalid reason=${invalid} client_id=${query.clientId}`);
    return new Response("Invalid authorization request.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  console.log(
    `oauth: GET authorize serve consent page challengeChars=${query.codeChallenge.length} stateChars=${query.state.length}`,
  );
  return null;
}

export async function handleAuthorizePost(request: Request, env: OAuthEnv): Promise<Response> {
  const user = await userFromRequest(request, env.FIREBASE_PROJECT_ID);
  const contentType = request.headers.get("content-type") || "";
  let params: URLSearchParams;
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        params.set(key, value);
      }
    }
  } else {
    params = new URLSearchParams(await request.text());
  }
  const query = readAuthorizeParams(params);
  const invalid = validateAuthorizeQuery(query);
  if (invalid) {
    console.warn(`oauth: POST authorize invalid reason=${invalid} uid=${user.uid}`);
    return oauthError("invalid_request", 400, invalid);
  }
  const now = Date.now();
  const codeBytes = new Uint8Array(32);
  crypto.getRandomValues(codeBytes);
  const code = bytesToHex(codeBytes);
  await env.DB.prepare(
    `INSERT INTO oauth_authorization_codes
      (code, client_id, redirect_uri, code_challenge, uid, email, created_at, expires_at, consumed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
  )
    .bind(
      code,
      query.clientId,
      query.redirectUri,
      query.codeChallenge,
      user.uid,
      user.email,
      now,
      now + CODE_TTL_MS,
    )
    .run();
  const redirect = `${OAUTH_REDIRECT_URI}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(query.state)}`;
  console.log(
    `oauth: issued code uid=${user.uid} emailChars=${user.email.length} ttlMs=${CODE_TTL_MS} client_id=${query.clientId}`,
  );
  return Response.json({ redirect });
}

export async function handleTokenPost(request: Request, env: OAuthEnv): Promise<Response> {
  const contentType = request.headers.get("content-type") || "";
  if (
    contentType &&
    !contentType.includes("application/x-www-form-urlencoded") &&
    !contentType.includes("application/json")
  ) {
    return oauthError("invalid_request", 400, "unsupported content type");
  }
  let grantType = "";
  let code = "";
  let redirectUri = "";
  let clientId = "";
  let verifier = "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    grantType = typeof body.grant_type === "string" ? body.grant_type : "";
    code = typeof body.code === "string" ? body.code : "";
    redirectUri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
    clientId = typeof body.client_id === "string" ? body.client_id : "";
    verifier = typeof body.code_verifier === "string" ? body.code_verifier : "";
  } else {
    const form = new URLSearchParams(await request.text());
    grantType = form.get("grant_type") || "";
    code = form.get("code") || "";
    redirectUri = form.get("redirect_uri") || "";
    clientId = form.get("client_id") || "";
    verifier = form.get("code_verifier") || "";
  }
  console.log(
    `oauth: token grant_type=${grantType} client_id=${clientId} codeChars=${code.length} verifierChars=${verifier.length}`,
  );
  if (grantType !== "authorization_code") {
    return oauthError("unsupported_grant_type", 400, "grant_type must be authorization_code");
  }
  if (clientId !== OAUTH_CLIENT_ID) {
    return oauthError("unauthorized_client", 401, "unknown client_id");
  }
  if (redirectUri !== OAUTH_REDIRECT_URI) {
    return oauthError("invalid_request", 400, "redirect_uri mismatch");
  }
  if (!/^[A-Fa-f0-9]{64}$/.test(code)) {
    return oauthError("invalid_grant", 400, "code is invalid");
  }
  if (!CHALLENGE_RE.test(verifier)) {
    return oauthError("invalid_request", 400, "code_verifier is invalid");
  }
  const now = Date.now();
  const row = await env.DB.prepare(
    `UPDATE oauth_authorization_codes
     SET consumed_at = ?
     WHERE code = ? AND consumed_at IS NULL AND expires_at > ?
     RETURNING uid, email, code_challenge, client_id, redirect_uri`,
  )
    .bind(now, code, now)
    .first<StoredCode>();
  if (!row) {
    console.warn("oauth: token consume missed expired-or-used");
    return oauthError("invalid_grant", 400, "code is expired or already used");
  }
  if (row.client_id !== clientId || row.redirect_uri !== redirectUri) {
    console.warn(`oauth: token client mismatch uid=${row.uid}`);
    return oauthError("invalid_grant", 400, "code was issued to another client");
  }
  const expected = await s256Challenge(verifier);
  if (!timingSafeEqual(expected, row.code_challenge)) {
    console.warn(`oauth: pkce mismatch uid=${row.uid}`);
    return oauthError("invalid_grant", 400, "PKCE verification failed");
  }
  console.log(`oauth: token consume ok uid=${row.uid} emailChars=${row.email.length}`);
  try {
    const customToken = await mintCustomToken(env, row.uid);
    return Response.json({ custom_token: customToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    console.error(`oauth: mint custom token failed uid=${row.uid} message=${message}`, error);
    return oauthError("server_error", 500, "could not mint token");
  }
}
