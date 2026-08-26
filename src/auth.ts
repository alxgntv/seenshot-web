import { createRemoteJWKSet, jwtVerify } from "jose";

// ─── Ariadne's Thread [AT-0003] ─────────────────────
// What: Verify Firebase ID tokens from Bearer or seenshot_id cookie
// Why:  Cabinet JSON uses Authorization; <img> cannot send Bearer so cookie is required
// Date: 2026-08-26
// Related: [AT-0004] src/index.ts:uidFrom, infra→backend/src/auth.ts
// ─────────────────────────────────────────────────────

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function verifyFirebaseToken(token: string, projectId: string): Promise<string> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  const uid = typeof payload.user_id === "string" ? payload.user_id : payload.sub;
  if (!uid || typeof uid !== "string") {
    console.warn("auth: token has no uid");
    throw new Error("STORAGE_NEED_SIGN_IN");
  }
  console.log(`auth: verified uid=${uid} exp=${payload.exp ?? "none"}`);
  return uid;
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
  return verifyFirebaseToken(token, projectId);
}
