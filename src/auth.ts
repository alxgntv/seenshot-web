import { createRemoteJWKSet, jwtVerify } from "jose";
import { isDisposableEmail } from "./disposableEmail";

// ─── Ariadne's Thread [AT-0003] ─────────────────────
// What: Verify Firebase ID tokens from Bearer or seenshot_id cookie
// Why:  Cabinet JSON uses Authorization; <img> cannot send Bearer so cookie is required
// Date: 2026-08-26
// Related: [AT-0004] src/index.ts:uidFrom, infra→backend/src/auth.ts
// ─────────────────────────────────────────────────────

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type FirebaseUser = {
  uid: string;
  email: string;
};

export async function verifyFirebaseUser(token: string, projectId: string): Promise<FirebaseUser> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  const uid = typeof payload.user_id === "string" ? payload.user_id : payload.sub;
  if (!uid || typeof uid !== "string") {
    console.warn("auth: token has no uid");
    throw new Error("STORAGE_NEED_SIGN_IN");
  }
  const email = typeof payload.email === "string" ? payload.email : "";
  console.log(`auth: verified uid=${uid} exp=${payload.exp ?? "none"} emailChars=${email.length}`);
  // ─── Ariadne's Thread [AT-0030] ─────────────────────
  // What: Reject ID tokens whose email domain is on the official blocklist
  // Why:  /api/me and /api/shots must not serve throwaway-mail accounts
  // Date: 2026-08-27
  // Related: [AT-0029] src/disposableEmail.ts:isDisposableEmail, [AT-0003] src/auth.ts:verifyFirebaseToken
  // ─────────────────────────────────────────────────────
  if (email && isDisposableEmail(email)) {
    console.warn(`auth: disposable email uid=${uid} emailChars=${email.length}`);
    throw new Error("AUTH_DISPOSABLE_EMAIL");
  }
  return { uid, email };
}

export async function verifyFirebaseToken(token: string, projectId: string): Promise<string> {
  const user = await verifyFirebaseUser(token, projectId);
  return user.uid;
}

function cookieToken(request: Request): string | null {
  const header = request.headers.get("Cookie") || "";
  const parts = header.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("seenshot_id=")) {
      const raw = trimmed.slice("seenshot_id=".length);
      try {
        return decodeURIComponent(raw);
      } catch (error) {
        console.warn("auth: cookie decode failed", error);
        return raw;
      }
    }
  }
  return null;
}

export async function uidFromRequest(request: Request, projectId: string): Promise<string> {
  const user = await userFromRequest(request, projectId);
  return user.uid;
}

// ─── Ariadne's Thread [AT-0041] ─────────────────────
// What: Return uid and email from Bearer or seenshot_id cookie
// Why:  OAuth consent and authorize POST need the signed-in email
// Date: 2026-08-27
// Related: [AT-0003] src/auth.ts:verifyFirebaseToken, [AT-0040] src/oauth.ts:handleAuthorizePost
// ─────────────────────────────────────────────────────
export async function userFromRequest(request: Request, projectId: string): Promise<FirebaseUser> {
  const header = request.headers.get("Authorization");
  let token: string | null = null;
  if (header && header.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length).trim();
    console.log(`auth: bearer present chars=${token.length}`);
  } else {
    token = cookieToken(request);
    console.log(`auth: cookie token present=${Boolean(token)} chars=${token ? token.length : 0}`);
  }
  if (!token) {
    console.warn("auth: missing bearer and cookie");
    throw new Error("STORAGE_NEED_SIGN_IN");
  }
  return verifyFirebaseUser(token, projectId);
}
