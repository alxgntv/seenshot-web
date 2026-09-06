// ─── Ariadne's Thread [AT-0418] ─────────────────────
// What: Shared CORS, JSON errors, and route catch matching the Worker fetch wrapper
// Why:  App Router handlers must return the same status codes and messages as src/index.ts
// Date: 2026-09-03
// Related: [AT-0006] src/index.ts:fetch, [AT-0006] src/index.ts:jsonError
// ─────────────────────────────────────────────────────

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export function jsonError(code: string, status = 400): Response {
  const messages: Record<string, string> = {
    STORAGE_NEED_SIGN_IN: "Sign in to save to the cloud or share a link.",
    AUTH_REFRESH_FAILED: "Could not refresh your sign-in. Check your internet connection and try again.",
    AUTH_DISPOSABLE_EMAIL: "Please enter your permanent email address.",
    REDEEM_INVALID: "That redeem code is not valid.",
    REDEEM_USED: "That redeem code has already been used.",
    REDEEM_EXPIRED: "That redeem code has expired.",
    REDEEM_ALREADY_MEMBER: "This account is already Member.",
    UNKNOWN_ERROR: "Something went wrong. Try again.",
  };
  const message = messages[code] ?? messages.UNKNOWN_ERROR;
  console.log(`errors: code=${code} status=${status} message=${message}`);
  return Response.json({ code, message }, { status });
}

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

export function corsPreflight(): Response {
  return new Response(null, { headers: CORS });
}

export function originOf(request: Request): string {
  return new URL(request.url).origin;
}

export function handleRouteError(error: unknown): Response {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  console.error(`index: unhandled ${code}`, error);
  if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED") {
    return withCors(jsonError(code, 401));
  }
  if (code === "AUTH_DISPOSABLE_EMAIL") {
    return withCors(jsonError(code, 403));
  }
  return withCors(jsonError("UNKNOWN_ERROR", 500));
}

export function safeId(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}
