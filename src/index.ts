import { uidFromRequest } from "./auth";
import { ownerShotPage, sharePage } from "./html";

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
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
  if (shot.visibility === "public" && shot.public_id) {
    return `/s/${shot.public_id}`;
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
      if (url.pathname.startsWith("/api/public/") && request.method === "GET") {
        return publicPng(request, env);
      }
      if (url.pathname.startsWith("/s/")) {
        return serveShare(request, env);
      }
      if (url.pathname.startsWith("/shot/")) {
        return serveOwnerShot(request, env);
      }
      if (url.pathname === "/cabinet" || url.pathname === "/cabinet/") {
        console.log("index: serve cabinet.html");
        return env.ASSETS.fetch(new Request(new URL("/cabinet.html", url.origin), request));
      }
      if (url.pathname === "/signin" || url.pathname === "/signin/") {
        console.log("index: serve signin.html");
        return env.ASSETS.fetch(new Request(new URL("/signin.html", url.origin), request));
      }
      console.log(`index: pass to assets path=${url.pathname}`);
      return env.ASSETS.fetch(request);
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      console.error(`index: unhandled ${code}`, error);
      if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED") {
        return withCors(jsonError(code, 401));
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

async function publicPng(request: Request, env: Env): Promise<Response> {
  const file = new URL(request.url).pathname.slice("/api/public/".length);
  const id = file.replace(/\.png$/, "");
  if (!id || !safeId(id)) {
    console.warn(`index: publicPng empty id path=${request.url}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?").bind(id).first();
  const row = banned
    ? null
    : await env.DB.prepare("SELECT shot_id FROM shots WHERE public_id = ? AND visibility = 'public'")
        .bind(id)
        .first();
  console.log(`index: publicPng id=${id} banned=${Boolean(banned)} row=${Boolean(row)}`);
  if (!row) {
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain" } });
  }
  const object = await env.BUCKET.get(`public/${id}.png`);
  if (!object) {
    console.warn(`index: publicPng r2 missing id=${id}`);
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain" } });
  }
  return r2Png(object, "public, max-age=31536000, immutable");
}

async function serveShare(request: Request, env: Env): Promise<Response> {
  const origin = originOf(request);
  const raw = new URL(request.url).pathname.slice("/s/".length);
  const id = decodeURIComponent(raw).replace(/\.png$/, "");
  if (!id || !safeId(id)) {
    console.warn(`index: share bad id path=${request.url}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?").bind(id).first();
  const row = banned
    ? null
    : await env.DB.prepare("SELECT shot_id FROM shots WHERE public_id = ? AND visibility = 'public'")
        .bind(id)
        .first();
  const imageUrl = `${origin}/api/public/${id}.png`;
  const html = sharePage({
    publicId: id,
    imageUrl,
    pageUrl: `${origin}/s/${id}`,
    missing: !row,
    abuseUrl: `${env.API_BASE_URL}/v1/abuse?id=${encodeURIComponent(id)}`,
    abuseEmail: env.ABUSE_EMAIL,
  });
  console.log(`index: share ${id} missing=${!row} banned=${Boolean(banned)} imageUrl=${imageUrl}`);
  return new Response(html, {
    status: row ? 200 : 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" },
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
