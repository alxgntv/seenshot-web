import { env } from "cloudflare:workers";

// ─── Ariadne's Thread [AT-0417] ─────────────────────
// What: Type SeenShot Worker bindings from wrangler.jsonc plus the Firebase secret
// Why:  vinext server code must use cloudflare:workers env, same D1/R2/rate limits as the old Worker
// Date: 2026-09-03
// Related: [AT-0416] wrangler.jsonc, [AT-0002] wrangler.toml.bak, https://www.npmjs.com/package/vinext
// ─────────────────────────────────────────────────────

export type SeenShotEnv = Cloudflare.Env & {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
};

export function getEnv(): SeenShotEnv {
  const bindings = env as SeenShotEnv;
  console.log(
    "env: getEnv project=" + bindings.FIREBASE_PROJECT_ID +
      " apiBase=" + bindings.API_BASE_URL +
      " r2PublicBase=" + bindings.R2_PUBLIC_BASE_URL +
      " abuse=" + bindings.ABUSE_EMAIL +
      " hasServiceAccount=" + Boolean(bindings.FIREBASE_SERVICE_ACCOUNT_JSON),
  );
  return bindings;
}
