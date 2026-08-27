import { uidFromRequest } from "./auth";
import { ownerShotPage, sharePage } from "./html";
import { handleAuthorizeGet, handleAuthorizePost, handleTokenPost } from "./oauth";

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  API_BASE_URL: string;
  R2_PUBLIC_BASE_URL: string;
  ABUSE_EMAIL: string;
}

type ShotRow = {
  shot_id: string;
  created_at: number;
  bytes: number;
  visibility: string;
  public_id: string | null;
  watermarked: number;
};

type ShotCard = ShotRow & { source: "d1" | "r2"; pagePath: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function jsonError(code: string, status = 400): Response {
  const messages: Record<string, string> = {
    STORAGE_NEED_SIGN_IN: "Sign in to save to the cloud or share a link.",
    AUTH_REFRESH_FAILED: "Could not refresh your sign-in. Check your internet connection and try again.",
    AUTH_DISPOSABLE_EMAIL: "Please enter your permanent email address.",
    UNKNOWN_ERROR: "Something went wrong. Try again.",
  };
  const message = messages[code] ?? messages.UNKNOWN_ERROR;
  console.log(`errors: code=${code} status=${status} message=${message}`);
  return Response.json({ code, message }, { status });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

function originOf(request: Request): string {
  return new URL(request.url).origin;
}

function pagePathFor(shot: { visibility: string; public_id: string | null; shot_id: string }): string {
  // ─── Ariadne's Thread [AT-0018] ─────────────────────
  // What: Public cabinet links use /screenshot/{fileId}
  // Why:  Same 12-hex as SeenShot-date-id.png from the Mac app
  // Date: 2026-08-27
  // Related: [AT-0184] app→AnnotateWindow.cpp:makeShotFileId, [AT-0185] backend→quota.ts:publicShareUrl
  // ─────────────────────────────────────────────────────
  if (shot.visibility === "public" && shot.public_id) {
    return `/screenshot/${shot.public_id}`;
  }
  return `/shot/${shot.shot_id}`;
}

// ─── Ariadne's Thread [AT-0006] ─────────────────────
// What: Site Worker: landing assets, Firebase cabinet, public share pages
// Why:  seenshot.app replaces GitHub Pages and hosts shareable shot URLs
// Date: 2026-08-26
// Related: [AT-0002] wrangler.toml, [AT-0003] auth.ts, [AT-0007] listShots
// ─────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    console.log(`index: ${request.method} ${url.pathname}`);
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS });
      }
      if (url.pathname === "/health") {
        return Response.json({ ok: true });
      }
      // ─── Ariadne's Thread [AT-0039] ─────────────────────
      // What: Route /oauth/authorize and /oauth/token on the site Worker
      // Why:  Cookie seenshot_id lives on seenshot.app; the API Worker cannot authorize
      // Date: 2026-08-27
      // Related: [AT-0040] src/oauth.ts, [AT-0038] wrangler.toml
      // ─────────────────────────────────────────────────────
      if (url.pathname === "/oauth/authorize" && request.method === "GET") {
        return handleAuthorizeGet(request, env);
      }
      if (url.pathname === "/oauth/authorize" && request.method === "POST") {
        return handleAuthorizePost(request, env);
      }
      if (url.pathname === "/oauth/token" && request.method === "POST") {
        return handleTokenPost(request, env);
      }
      if (url.pathname === "/api/config" && request.method === "GET") {
        return config(request, env);
      }
      if (url.pathname === "/api/me" && request.method === "GET") {
        return withCors(await me(request, env));
      }
      if (url.pathname === "/api/shots" && request.method === "GET") {
        return withCors(await shots(request, env));
      }
      if (url.pathname.startsWith("/api/shots/") && url.pathname.endsWith("/image") && request.method === "GET") {
        return withCors(await shotImage(request, env));
      }
      // ─── Ariadne's Thread [AT-0049] ─────────────────────
      // What: Serve public PNGs at /public/{id}.png (R2 key path) and keep /api/public/
      // Why:  Material URLs must be seenshot.app, not r2.dev; apex is already this Worker
      // Date: 2026-08-27
      // Related: [AT-0050] src/index.ts:publicPng, [AT-0167] backend→index.ts:serveShare
      // ─────────────────────────────────────────────────────
      if (
        (url.pathname.startsWith("/public/") || url.pathname.startsWith("/api/public/")) &&
        request.method === "GET"
      ) {
        return publicPng(request, env);
      }
      if (url.pathname.startsWith("/screenshot/")) {
        return serveShare(request, env, "/screenshot/");
      }
      if (url.pathname.startsWith("/s/")) {
        const id = url.pathname.slice("/s/".length);
        const target = `${originOf(request)}/screenshot/${id}`;
        console.log(`index: redirect /s/ to ${target}`);
        return Response.redirect(target, 301);
      }
      if (url.pathname.startsWith("/shot/")) {
        return serveOwnerShot(request, env);
      }
      console.log(`index: pass to assets path=${url.pathname}`);
      return env.ASSETS.fetch(request);
    } catch (error) {
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
  },
};

function config(request: Request, env: Env): Response {
  const origin = originOf(request);
  const payload = {
    firebaseApiKey: env.FIREBASE_API_KEY,
    firebaseProjectId: env.FIREBASE_PROJECT_ID,
    apiBaseUrl: env.API_BASE_URL,
    emailLinkContinueUrl: `${origin}/signin`,
    abuseEmail: env.ABUSE_EMAIL,
  };
  console.log(
    `index: config project=${payload.firebaseProjectId} apiBase=${payload.apiBaseUrl} continue=${payload.emailLinkContinueUrl}`,
  );
  return Response.json(payload);
}

async function me(request: Request, env: Env): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const row = await env.DB.prepare("SELECT uid, used_bytes, plan, grace_ends_at, created_at FROM users WHERE uid = ?")
    .bind(uid)
    .first<{ uid: string; used_bytes: number; plan: string; grace_ends_at: number | null; created_at: number }>();
  console.log(`index: me uid=${uid} found=${Boolean(row)} plan=${row?.plan ?? "none"} used=${row?.used_bytes ?? 0}`);
  return Response.json({
    uid,
    usedBytes: row?.used_bytes ?? 0,
    plan: row?.plan ?? "free",
    graceEndsAt: row?.grace_ends_at ?? null,
    createdAt: row?.created_at ?? null,
  });
}

// ─── Ariadne's Thread [AT-0007] ─────────────────────
// What: Merge D1 shot rows with objects under private/{uid}/ in R2
// Why:  Cabinet is the user's cloud folder; D1 is metadata, R2 is the files
// Date: 2026-08-26
// Related: [AT-0008] shotImage, infra→backend/src/quota.ts:confirm
// ─────────────────────────────────────────────────────
async function listShots(uid: string, env: Env): Promise<ShotCard[]> {
  const rows = await env.DB.prepare(
    "SELECT shot_id, created_at, bytes, visibility, public_id, watermarked FROM shots WHERE uid = ? ORDER BY created_at DESC",
  )
    .bind(uid)
    .all<ShotRow>();
  const byId = new Map<string, ShotCard>();
  for (const row of rows.results ?? []) {
    byId.set(row.shot_id, { ...row, source: "d1", pagePath: pagePathFor(row) });
  }
  console.log(`index: listShots d1 uid=${uid} rows=${byId.size}`);
  let cursor: string | undefined;
  let r2Count = 0;
  let r2Only = 0;
  do {
    const listed = await env.BUCKET.list({ prefix: `private/${uid}/`, cursor, limit: 1000 });
    r2Count += listed.objects.length;
    for (const obj of listed.objects) {
      const file = obj.key.split("/").pop() || "";
      if (!file.endsWith(".png")) {
        console.log(`index: listShots skip non-png key=${obj.key}`);
        continue;
      }
      const shotId = file.slice(0, -".png".length);
      if (!shotId) {
        continue;
      }
      if (byId.has(shotId)) {
        continue;
      }
      r2Only += 1;
      const created = obj.uploaded.getTime();
      const row: ShotRow = {
        shot_id: shotId,
        created_at: created,
        bytes: obj.size,
        visibility: "private",
        public_id: null,
        watermarked: 0,
      };
      byId.set(shotId, { ...row, source: "r2", pagePath: pagePathFor(row) });
      console.log(`index: listShots r2-only key=${obj.key} bytes=${obj.size}`);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
  const cards = Array.from(byId.values()).sort((a, b) => b.created_at - a.created_at);
  console.log(`index: listShots uid=${uid} total=${cards.length} r2Objects=${r2Count} r2Only=${r2Only}`);
  return cards;
}

async function shots(request: Request, env: Env): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const cards = await listShots(uid, env);
  return Response.json({ shots: cards });
}

function r2Png(object: R2ObjectBody, cacheControl: string): Response {
  console.log(`index: r2Png key=${object.key} size=${object.size} cache=${cacheControl}`);
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "image/png",
      "cache-control": cacheControl,
    },
  });
}

async function shotImage(request: Request, env: Env): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const parts = new URL(request.url).pathname.split("/");
  const shotId = decodeURIComponent(parts[3] || "");
  if (!shotId || !safeId(shotId)) {
    console.warn(`index: shotImage missing shotId path=${request.url}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const row = await env.DB.prepare(
    "SELECT shot_id, visibility, public_id FROM shots WHERE shot_id = ? AND uid = ?",
  )
    .bind(shotId, uid)
    .first<{ shot_id: string; visibility: string; public_id: string | null }>();
  console.log(
    `index: shotImage uid=${uid} shot=${shotId} d1=${Boolean(row)} visibility=${row?.visibility ?? "none"} publicId=${row?.public_id ?? "none"}`,
  );
  if (row?.visibility === "public" && row.public_id) {
    const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?")
      .bind(row.public_id)
      .first();
    if (banned) {
      console.warn(`index: shotImage takedown publicId=${row.public_id}`);
      return jsonError("UNKNOWN_ERROR", 404);
    }
    const object = await env.BUCKET.get(`public/${row.public_id}.png`);
    if (object) {
      return r2Png(object, "private, max-age=60");
    }
    console.warn(`index: shotImage public object missing publicId=${row.public_id}`);
  }
  const privateKey = `private/${uid}/${shotId}.png`;
  const privateObject = await env.BUCKET.get(privateKey);
  if (privateObject) {
    return r2Png(privateObject, "private, max-age=60");
  }
  console.warn(`index: shotImage not found uid=${uid} shot=${shotId}`);
  return jsonError("UNKNOWN_ERROR", 404);
}

// ─── Ariadne's Thread [AT-0050] ─────────────────────
// What: Resolve public PNG from /public/{id}.png or /api/public/{id}.png
// Why:  Same R2 key public/{id}.png; /api/public/ stays as the old path
// Date: 2026-08-27
// Related: [AT-0049] src/index.ts:fetch, [AT-0051] src/index.ts:serveShare
// ─────────────────────────────────────────────────────
async function publicPng(request: Request, env: Env): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const prefix = pathname.startsWith("/api/public/") ? "/api/public/" : "/public/";
  const file = pathname.slice(prefix.length);
  const id = file.replace(/\.png$/, "");
  console.log(`index: publicPng prefix=${prefix} file=${file} id=${id} url=${request.url}`);
  if (!id || !safeId(id)) {
    console.warn(`index: publicPng empty id path=${request.url} prefix=${prefix} file=${file}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?").bind(id).first();
  const row = banned
    ? null
    : await env.DB.prepare(
        "SELECT shot_id, public_id FROM shots WHERE visibility = 'public' AND (public_id = ? OR shot_id = ?)",
      )
        .bind(id, id)
        .first<{ shot_id: string; public_id: string | null }>();
  console.log(
    `index: publicPng id=${id} prefix=${prefix} banned=${Boolean(banned)} row=${Boolean(row)} publicId=${row?.public_id ?? "none"}`,
  );
  if (!row || !row.public_id) {
    // ─── Ariadne's Thread [AT-0054] ─────────────────────
    // What: Public PNG 404 is Cache-Control: no-store
    // Why:  Share wait polls this URL; a cached 404 would never become the image
    // Date: 2026-08-27
    // Related: [AT-0050] src/index.ts:publicPng, [AT-0053] public/js/screenshot-upload.js
    // ─────────────────────────────────────────────────────
    console.warn(`index: publicPng not found id=${id} banned=${Boolean(banned)} d1=${Boolean(row)}`);
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }
  const key = `public/${row.public_id}.png`;
  const object = await env.BUCKET.get(key);
  if (!object) {
    console.warn(`index: publicPng r2 missing id=${id} key=${key}`);
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }
  console.log(`index: publicPng hit id=${id} key=${key} size=${object.size} prefix=${prefix}`);
  return r2Png(object, "public, max-age=31536000, immutable");
}

async function serveShare(request: Request, env: Env, prefix: string): Promise<Response> {
  const origin = originOf(request);
  const requestUrl = new URL(request.url);
  const raw = requestUrl.pathname.slice(prefix.length);
  const id = decodeURIComponent(raw).replace(/\.png$/, "");
  if (!id || !safeId(id)) {
    console.warn(`index: share bad id path=${request.url} prefix=${prefix}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const uploading = requestUrl.searchParams.get("uploading") === "1";
  const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?").bind(id).first();
  const row = banned
    ? null
    : await env.DB.prepare(
        "SELECT shot_id, public_id FROM shots WHERE visibility = 'public' AND (public_id = ? OR shot_id = ?)",
      )
        .bind(id, id)
        .first<{ shot_id: string; public_id: string | null }>();
  const publicId = row?.public_id || id;
  // ─── Ariadne's Thread [AT-0051] ─────────────────────
  // What: Share <img> and og:image use /public/{id}.png on this origin
  // Why:  Material links stay on seenshot.app; R2_PUBLIC_BASE_URL is that host
  // Date: 2026-08-27
  // Related: [AT-0050] src/index.ts:publicPng, [AT-0208] backend→index.ts:serveShare
  // ─────────────────────────────────────────────────────
  // ─── Ariadne's Thread [AT-0052] ─────────────────────
  // What: ?uploading=1 with no D1 row returns 200 wait HTML instead of gone
  // Why:  Mac opens the share URL before confirm writes public/{id}.png
  // Date: 2026-08-27
  // Related: [AT-0004] src/html.ts:sharePage, [AT-0210] AnnotateWindow.cpp:share
  // ─────────────────────────────────────────────────────
  const imageUrl = `${origin}/public/${publicId}.png`;
  const waiting = !row && !banned && uploading;
  console.log(
    `index: share imageUrl=${imageUrl} origin=${origin} r2PublicBase=${env.R2_PUBLIC_BASE_URL} uploading=${uploading} waiting=${waiting} banned=${Boolean(banned)} missing=${!row}`,
  );
  const html = sharePage({
    publicId,
    imageUrl,
    pageUrl: `${origin}/screenshot/${publicId}`,
    missing: !row,
    uploading: waiting,
    abuseUrl: `${env.API_BASE_URL}/v1/abuse?id=${encodeURIComponent(publicId)}`,
    abuseEmail: env.ABUSE_EMAIL,
  });
  console.log(
    `index: share prefix=${prefix} id=${id} publicId=${publicId} missing=${!row} banned=${Boolean(banned)} waiting=${waiting} imageUrl=${imageUrl}`,
  );
  return new Response(html, {
    status: row || waiting ? 200 : 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": waiting ? "no-store" : "public, max-age=60",
    },
  });
}

function safeId(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}

async function serveOwnerShot(request: Request, env: Env): Promise<Response> {
  const shotId = decodeURIComponent(new URL(request.url).pathname.slice("/shot/".length));
  if (!shotId || !safeId(shotId)) {
    console.warn(`index: owner shot missing id path=${request.url}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  console.log(`index: owner shot page shotId=${shotId}`);
  return new Response(ownerShotPage(shotId), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
