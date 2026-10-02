import { uidFromRequest } from "./auth";
import type { SeenShotEnv } from "./env";
import { jsonError, originOf, safeId } from "./http";

// ─── Ariadne's Thread [AT-0420] ─────────────────────
// What: Port Worker site handlers to lib for Next.js Route Handlers
// Why:  Same D1 SQL, R2 keys, Polar proxy, Sparkle appcast, and share URLs as src/index.ts
// Date: 2026-09-03
// Related: [AT-0006] src/index.ts:fetch, [AT-0417] lib/env.ts:getEnv
// ─────────────────────────────────────────────────────

type ShotRow = {
  shot_id: string;
  created_at: number;
  bytes: number;
  visibility: string;
  public_id: string | null;
  watermarked: number;
};

export type ShotCard = ShotRow & { source: "d1" | "r2"; pagePath: string };

export type SharePageOpts = {
  publicId: string;
  imageUrl: string;
  pageUrl: string;
  missing: boolean;
  unavailable: boolean;
  uploading: boolean;
  abuseUrl: string;
  abuseEmail: string;
  live: boolean;
  etag: string;
  status: number;
  cacheControl: string;
};

// ─── Ariadne's Thread [AT-0082] ─────────────────────
// What: Report opens GitHub issues/new on alxgntv/seenshot with shot title and URL
// Why:  Public share Report must file an issue in the public repo, not /v1/abuse
// Date: 2026-08-27
// Related: [AT-0075] src/html.ts:shareFootHtml, https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue
// ─────────────────────────────────────────────────────
export function reportIssueUrl(publicId: string, pageUrl: string): string {
  const params = new URLSearchParams();
  params.set("title", `Report screenshot ${publicId}`);
  params.set("body", `Screenshot: ${pageUrl}\n`);
  const url = `https://github.com/alxgntv/seenshot/issues/new?${params.toString()}`;
  console.log(`index: reportIssueUrl publicId=${publicId} pageUrl=${pageUrl} url=${url}`);
  return url;
}

// ─── Ariadne's Thread [AT-0065] ─────────────────────
// What: Workers Rate Limiting on /screenshot/*, /s/*, /public/*, /api/public/*
// Why:  Official pathname + flood keys; Cloudflare docs forbid IP keys (NAT/shared)
// Date: 2026-08-27
// Related: [AT-0064] wrangler.toml:[[ratelimits]], https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
// ─────────────────────────────────────────────────────
export async function allowScreenshotTraffic(request: Request, env: SeenShotEnv): Promise<Response | null> {
  const pathname = new URL(request.url).pathname;
  const pathLimit = await env.SCREENSHOT_RATE.limit({ key: pathname });
  const floodLimit = await env.SCREENSHOT_FLOOD.limit({ key: "screenshot" });
  console.log(
    `index: screenshot rate pathname=${pathname} pathOk=${pathLimit.success} floodOk=${floodLimit.success}`,
  );
  if (pathLimit.success && floodLimit.success) {
    return null;
  }
  console.warn(
    `index: screenshot rate exceeded pathname=${pathname} pathOk=${pathLimit.success} floodOk=${floodLimit.success}`,
  );
  return new Response("Too many requests", {
    status: 429,
    headers: {
      "retry-after": "60",
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

const SPARKLE_APPCAST_ARM64_ORIGIN = "https://alxgntv.github.io/seenshot/appcast.xml";
const SPARKLE_APPCAST_X86_64_ORIGIN = "https://alxgntv.github.io/seenshot/appcast-x86_64.xml";

function appcastLooksLikeXml(body: string): boolean {
  const start = body.trimStart();
  return start.startsWith("<?xml") || start.startsWith("<rss");
}

function appcastClientHeaders(byteLength: number): Headers {
  return new Headers({
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, max-age=300",
    "content-length": String(byteLength),
  });
}

function appcastResponse(body: string, method: string): Response {
  const bytes = new TextEncoder().encode(body);
  const headers = appcastClientHeaders(bytes.byteLength);
  if (method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(body, { status: 200, headers });
}

// ─── Ariadne's Thread [AT-0421] ─────────────────────
// What: Proxy arm64 and x86_64 Sparkle feeds from GitHub Pages on seenshot.app
// Why:  Intel and Apple Silicon use independent SUFeedURL channels
// Date: 2026-09-04
// Related: [AT-0421] docs/appcast-x86_64.xml, [AT-0421] app→Info.plist:SUFeedURL
// ─────────────────────────────────────────────────────
async function proxySparkleAppcastFromOrigin(request: Request, originUrl: string, label: string): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(originUrl, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    const body = await cached.text();
    const bytes = new TextEncoder().encode(body).byteLength;
    console.log(
      "index: appcast host=" + url.hostname +
        " path=" + url.pathname +
        " feed=" + label +
        " method=" + method +
        " originStatus=" + cached.status +
        " bytes=" + bytes +
        " cache=hit",
    );
    if (!appcastLooksLikeXml(body)) {
      console.error(
        "index: appcast cache hit is not xml feed=" + label +
          " bytes=" + bytes +
          " prefix=" + body.slice(0, 48),
      );
      return new Response("Bad gateway", {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return appcastResponse(body, method);
  }
  console.log(
    "index: appcast cache miss host=" + url.hostname +
      " path=" + url.pathname +
      " feed=" + label +
      " method=" + method +
      " origin=" + originUrl,
  );
  const originRes = await fetch(originUrl);
  const body = await originRes.text();
  const bytes = new TextEncoder().encode(body).byteLength;
  console.log(
    "index: appcast origin host=" + url.hostname +
      " path=" + url.pathname +
      " feed=" + label +
      " method=" + method +
      " originStatus=" + originRes.status +
      " bytes=" + bytes +
      " cache=miss",
  );
  if (originRes.status !== 200 || !appcastLooksLikeXml(body)) {
    console.error(
      "index: appcast origin rejected feed=" + label +
        " status=" + originRes.status +
        " bytes=" + bytes +
        " prefix=" + body.slice(0, 48),
    );
    return new Response("Bad gateway", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const cachedResponse = appcastResponse(body, "GET");
  try {
    await cache.put(cacheKey, cachedResponse.clone());
    console.log("index: appcast cache put feed=" + label + " bytes=" + bytes);
  } catch (error) {
    console.warn("index: appcast cache put failed feed=" + label, error);
  }
  return appcastResponse(body, method);
}

export async function proxySparkleAppcast(request: Request): Promise<Response> {
  return proxySparkleAppcastFromOrigin(request, SPARKLE_APPCAST_ARM64_ORIGIN, "arm64");
}

export async function proxySparkleAppcastX86_64(request: Request): Promise<Response> {
  return proxySparkleAppcastFromOrigin(request, SPARKLE_APPCAST_X86_64_ORIGIN, "x86_64");
}

function macDownloadArchFromPath(pathname: string): "arm64" | "x86_64" | null {
  let path = pathname;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path === "/download" || path === "/download/arm64") {
    return "arm64";
  }
  if (path === "/download/x86_64") {
    return "x86_64";
  }
  console.warn("index: download unknown path=" + pathname);
  return null;
}

function firstSparkleEnclosureUrl(xml: string): string {
  const match = xml.match(/<enclosure\b[^>]*\burl="([^"]+)"/i);
  const location = match && match[1] ? match[1] : "";
  console.log("index: download enclosure chars=" + location.length + " prefix=" + location.slice(0, 96));
  return location;
}

async function sparkleAppcastXml(originUrl: string, label: string): Promise<string | null> {
  const req = new Request(originUrl, { method: "GET" });
  const res = await proxySparkleAppcastFromOrigin(req, originUrl, label);
  console.log("index: download appcast feed=" + label + " status=" + res.status);
  if (res.status !== 200) {
    console.error("index: download appcast rejected feed=" + label + " status=" + res.status);
    return null;
  }
  return res.text();
}

function latestReleaseKey(arch: "arm64" | "x86_64"): string {
  return "releases/latest-" + arch + ".dmg";
}

type ReleaseLatestJson = {
  version?: string;
  arm64?: { key?: string; name?: string };
  x86_64?: { key?: string; name?: string };
};

async function readLatestReleaseJson(env: SeenShotEnv): Promise<ReleaseLatestJson | null> {
  const object = await env.BUCKET.get("releases/latest.json");
  if (!object) {
    console.warn("index: download r2 latest.json miss");
    return null;
  }
  const text = await object.text();
  try {
    const parsed = JSON.parse(text) as ReleaseLatestJson;
    console.log(
      "index: download r2 latest.json version=" + (parsed.version || "") +
        " arm64=" + ((parsed.arm64 && parsed.arm64.key) || "") +
        " x86_64=" + ((parsed.x86_64 && parsed.x86_64.key) || ""),
    );
    return parsed;
  } catch (error) {
    console.error("index: download r2 latest.json parse failed chars=" + text.length, error);
    return null;
  }
}

function r2Dmg(object: R2Object | R2ObjectBody, method: string, filename: string): Response {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", object.httpMetadata?.contentType || "application/octet-stream");
  const disposition =
    object.httpMetadata?.contentDisposition || ('attachment; filename="' + filename + '"');
  headers.set("content-disposition", disposition);
  headers.set("etag", object.httpEtag);
  headers.set("content-length", String(object.size));
  // ─── Ariadne's Thread [AT-0679] ─────────────────────
  // What: Stop public CDN caching of the latest DMG
  // Why:  Unsigned clients must not receive a cached 200 after /download became session-gated
  // Date: 2026-10-02
  // Related: [AT-0679] lib/site.ts:serveLatestMacDmg, [AT-0522] lib/site.ts:r2Dmg
  // ─────────────────────────────────────────────────────
  headers.set("cache-control", "private, no-store")
  headers.set("x-robots-tag", "noindex, nofollow");
  const hasBody = "body" in object && Boolean((object as R2ObjectBody).body);
  if (method === "HEAD" || !hasBody) {
    const status = method === "GET" && !hasBody ? 304 : 200;
    console.log(
      "index: r2Dmg status=" + status +
        " method=" + method +
        " key=" + object.key +
        " size=" + object.size +
        " etag=" + object.httpEtag +
        " hasBody=" + String(hasBody),
    );
    return new Response(null, { status, headers });
  }
  console.log(
    "index: r2Dmg status=200 method=" + method +
      " key=" + object.key +
      " size=" + object.size +
      " etag=" + object.httpEtag +
      " filename=" + filename,
  );
  return new Response((object as R2ObjectBody).body, { status: 200, headers });
}

async function fallbackGithubMacDmg(request: Request, arch: "arm64" | "x86_64"): Promise<Response> {
  const originUrl = arch === "x86_64" ? SPARKLE_APPCAST_X86_64_ORIGIN : SPARKLE_APPCAST_ARM64_ORIGIN;
  const xml = await sparkleAppcastXml(originUrl, arch);
  if (!xml) {
    console.error("index: download github fallback appcast missing arch=" + arch);
    return new Response("Bad gateway", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const location = firstSparkleEnclosureUrl(xml);
  const lower = location.toLowerCase();
  const archOk = arch === "x86_64"
    ? lower.indexOf("x86_64") !== -1 || lower.indexOf("x86") !== -1
    : lower.indexOf("arm64") !== -1 || lower.indexOf("aarch64") !== -1;
  if (
    !location ||
    location.indexOf("https://github.com/") !== 0 ||
    lower.indexOf(".dmg") === -1 ||
    !archOk
  ) {
    console.error(
      "index: download github fallback bad enclosure arch=" + arch +
        " location=" + location +
        " archOk=" + String(archOk),
    );
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  console.log(
    "index: download github fallback redirect arch=" + arch +
      " location=" + location +
      " xmlChars=" + xml.length,
  );
  return new Response(null, {
    status: 302,
    headers: {
      location: location,
      "cache-control": "no-store",
    },
  });
}

// ─── Ariadne's Thread [AT-0522] ─────────────────────
// What: Stream /download/arm64 and /download/x86_64 from R2 releases/; GitHub enclosure is fallback
// Why:  GitHub release-assets is slow; project R2 is the same CF network as seenshot.app
// Date: 2026-09-05
// Related: [AT-0521] packaging/macos/upload_r2_release.sh, [AT-0515] lib/site.ts:redirectLatestMacDmg, https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
// ─────────────────────────────────────────────────────
export async function serveLatestMacDmg(request: Request, env: SeenShotEnv): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const arch = macDownloadArchFromPath(url.pathname);
  console.log(
    "index: download host=" + url.hostname +
      " path=" + url.pathname +
      " method=" + method +
      " arch=" + (arch || "none"),
  );
  if (!arch) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  // ─── Ariadne's Thread [AT-0679] ─────────────────────
  // What: Require a Firebase session before streaming the latest Mac DMG
  // Why:  App download is only from the signed-in cabinet. Unsigned /download must go to Create account
  // Date: 2026-10-02
  // Related: [AT-0681] frontend→lib/client/signup-modal.ts:startSignupModal, [AT-0003] lib/auth.ts:uidFromRequest
  // ─────────────────────────────────────────────────────
  let uid = ""
  try {
    uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID)
    console.log(
      "index: download authorized uid=" + uid +
        " arch=" + arch +
        " method=" + method
    )
  } catch (error) {
    const signup = new URL("/signup", url.origin)
    signup.searchParams.set("next", "/space/")
    const code = error instanceof Error ? error.message : "STORAGE_NEED_SIGN_IN"
    console.warn(
      "index: download unsigned code=" + code +
        " redirect=" + signup.pathname + signup.search +
        " arch=" + arch +
        " method=" + method
    )
    return new Response(null, {
      status: 302,
      headers: {
        location: signup.pathname + signup.search,
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    })
  }
  // ─── Ariadne's Thread [AT-0688] ─────────────────────
  // What: Require plan=pro or active grace before streaming the Mac DMG
  // Why:  Cabinet download is only after a paid Member. Free sign-up must not fetch the app
  // Date: 2026-10-02
  // Related: [AT-0687] frontend→lib/client/paid-ui.ts:planIsPaid, [AT-0071] lib/site.ts:me
  // ─────────────────────────────────────────────────────
  try {
    const row = await env.DB.prepare("SELECT plan, grace_ends_at FROM users WHERE uid = ?")
      .bind(uid)
      .first<{ plan: string, grace_ends_at: number | null }>()
    const plan = row && typeof row.plan === "string" ? row.plan : "free"
    const graceEndsAt = row && typeof row.grace_ends_at === "number" ? row.grace_ends_at : null
    const graceActive = plan === "grace" && typeof graceEndsAt === "number" && graceEndsAt > Date.now()
    const paid = plan === "pro" || graceActive
    console.log(
      "index: download plan uid=" + uid +
        " found=" + Boolean(row) +
        " plan=" + plan +
        " graceActive=" + String(graceActive) +
        " paid=" + String(paid) +
        " arch=" + arch
    )
    if (!paid) {
      console.warn(
        "index: download unpaid uid=" + uid +
          " plan=" + plan +
          " redirect=/space/"
      )
      return new Response(null, {
        status: 302,
        headers: {
          location: "/space/",
          "cache-control": "no-store",
          "x-robots-tag": "noindex, nofollow",
        },
      })
    }
    console.log(
      "index: download paid continue uid=" + uid +
        " plan=" + plan +
        " arch=" + arch +
        " method=" + method
    )
  } catch (error) {
    console.error(
      "index: download plan lookup failed uid=" + uid +
        " arch=" + arch +
        " redirect=/space/",
      error
    )
    return new Response(null, {
      status: 302,
      headers: {
        location: "/space/",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    })
  }
  const key = latestReleaseKey(arch);
  let filename = "SeenShot-" + arch + ".dmg";
  try {
    const latest = await readLatestReleaseJson(env);
    const meta = latest ? latest[arch] : null;
    if (meta && typeof meta.name === "string" && meta.name.indexOf(".dmg") !== -1) {
      filename = meta.name;
      console.log("index: download r2 filename=" + filename + " version=" + (latest && latest.version ? latest.version : ""));
    }
    if (method === "HEAD") {
      const head = await env.BUCKET.head(key);
      if (head) {
        console.log("index: download r2 head hit key=" + key + " size=" + head.size);
        return r2Dmg(head, method, filename);
      }
      console.warn("index: download r2 head miss key=" + key);
    } else {
      const object = await env.BUCKET.get(key, { onlyIf: request.headers });
      if (object) {
        console.log(
          "index: download r2 get hit key=" + key +
            " size=" + object.size +
            " hasBody=" + String("body" in object),
        );
        return r2Dmg(object, method, filename);
      }
      console.warn("index: download r2 get miss key=" + key);
    }
  } catch (error) {
    console.error("index: download r2 failed key=" + key, error);
  }
  return fallbackGithubMacDmg(request, arch);
}

export async function redirectLatestMacDmg(request: Request, env?: SeenShotEnv): Promise<Response> {
  if (env) {
    return serveLatestMacDmg(request, env);
  }
  console.warn("index: download missing R2 env, github fallback path=" + new URL(request.url).pathname);
  const arch = macDownloadArchFromPath(new URL(request.url).pathname);
  if (!arch) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return fallbackGithubMacDmg(request, arch);
}

export function pagePathFor(shot: { visibility: string; public_id: string | null; shot_id: string }): string {
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

export function config(request: Request, env: SeenShotEnv): Response {
  const origin = originOf(request);
  const payload = {
    firebaseApiKey: env.FIREBASE_API_KEY,
    firebaseProjectId: env.FIREBASE_PROJECT_ID,
    apiBaseUrl: env.API_BASE_URL,
    emailLinkContinueUrl: `${origin}/signin`,
    abuseEmail: env.ABUSE_EMAIL,
    firebaseAuthDomain: `${env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  };
  // ─── Ariadne's Thread [AT-0376] ─────────────────────
  // What: Expose firebaseAuthDomain on GET /api/config for Google signInWithPopup
  // Why:  Firebase Auth popup uses the project authDomain, not a GIS web client id
  // Date: 2026-08-29
  // Related: [AT-0376] public/js/auth.js:ensureGoogleAuth, app→Config.cpp:firebaseAuthDomain
  // ─────────────────────────────────────────────────────
  console.log(
    `index: config project=${payload.firebaseProjectId} apiBase=${payload.apiBaseUrl} continue=${payload.emailLinkContinueUrl}` +
      ` authDomain=${payload.firebaseAuthDomain} abuse=${payload.abuseEmail}`,
  );
  return Response.json(payload);
}

export async function me(request: Request, env: SeenShotEnv): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const row = await env.DB.prepare("SELECT uid, used_bytes, plan, grace_ends_at, created_at FROM users WHERE uid = ?")
    .bind(uid)
    .first<{ uid: string; used_bytes: number; plan: string; grace_ends_at: number | null; created_at: number }>();
  const plan = row?.plan ?? "free";
  const usedBytes = row?.used_bytes ?? 0;
  const graceEndsAt = row?.grace_ends_at ?? null;
  // ─── Ariadne's Thread [AT-0071] ─────────────────────
  // What: Return limitBytes and remainingBytes on GET /api/me
  // Why:  Top nav must show leftover screenshot storage; Free=10MB, Pro=1GB
  // Date: 2026-08-27
  // Related: [AT-0072] public/js/nav.js:paint, infra→backend/src/quota.ts:QUOTA_BYTES
  // ─────────────────────────────────────────────────────
  const freeLimitBytes = 10 * 1024 * 1024;
  const proLimitBytes = 1024 * 1024 * 1024;
  const graceActive = plan === "grace" && typeof graceEndsAt === "number" && graceEndsAt > Date.now();
  const limitBytes = plan === "pro" || graceActive ? proLimitBytes : freeLimitBytes;
  const remainingBytes = Math.max(0, limitBytes - usedBytes);
  console.log(
    `index: me uid=${uid} found=${Boolean(row)} plan=${plan} used=${usedBytes} limit=${limitBytes} remaining=${remainingBytes} graceActive=${graceActive}`,
  );
  return Response.json({
    uid,
    usedBytes,
    plan,
    graceEndsAt,
    createdAt: row?.created_at ?? null,
    limitBytes,
    remainingBytes,
  });
}

// ─── Ariadne's Thread [AT-0281] ─────────────────────
// What: Proxy POST /api/billing/checkout to seenshot-api Polar checkout
// Why:  Cabinet Upgrade to Pro must use the existing /v1/billing/checkout, not a second Polar client
// Date: 2026-08-27
// Related: [AT-0277] backend→index.ts:checkout, [AT-0282] public/js/cabinet.js
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0549] ─────────────────────
// What: Forward checkout body product member|lifetime to seenshot-api
// Why:  /pricing Pay $87 must select Polar Lifetime; cabinet still defaults to Member
// Date: 2026-09-05
// Related: [AT-0281] lib/site.ts:billingCheckout, [AT-0547] backend→polar.ts:createPolarCheckoutUrl
// ─────────────────────────────────────────────────────
export async function billingCheckout(request: Request, env: SeenShotEnv): Promise<Response> {
  const authorization = request.headers.get("Authorization") || "";
  const cookie = request.headers.get("Cookie") || "";
  const signedIn = authorization.indexOf("Bearer ") === 0 || cookie.indexOf("seenshot_id=") !== -1;
  // ─── Ariadne's Thread [AT-0619] ─────────────────────
  // What: Proxy guest Buy checkout without requiring a Firebase cookie
  // Why:  Member and Lifetime Buy must open Polar, not /signin
  // Date: 2026-09-05
  // Related: [AT-0549] lib/site.ts:billingCheckout, [AT-0619] backend→index.ts:checkout
  // ─────────────────────────────────────────────────────
  if (signedIn) {
    await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
    console.log("index: billingCheckout signed-in");
  } else {
    console.log("index: billingCheckout guest");
  }
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const apiUrl = `${env.API_BASE_URL}/v1/billing/checkout`;
  let product = "member";
  try {
    const parsed = (await request.json()) as { product?: unknown };
    if (parsed && parsed.product === "lifetime") {
      product = "lifetime";
    }
  } catch (error) {
    console.log("index: billingCheckout empty body, default member");
  }
  console.log(`index: billingCheckout api=${apiUrl} ipChars=${ip.length} product=${product} signedIn=${signedIn} stripe=true`);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authorization) {
    headers.Authorization = authorization;
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ customer_ip_address: ip, product }),
  });
  const text = await response.text();
  console.log(`index: billingCheckout apiStatus=${response.status} bodyChars=${text.length} product=${product}`);
  return new Response(text, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json" },
  });
}

// ─── Ariadne's Thread [AT-0384] ─────────────────────
// What: Proxy POST /api/billing/redeem to seenshot-api Polar license redeem
// Why:  Cabinet must use the existing API Worker Polar token, not a second Polar client
// Date: 2026-08-31
// Related: [AT-0384] backend→index.ts:redeem, [AT-0385] public/js/redem.js:submitRedeem
// ─────────────────────────────────────────────────────
export async function billingRedeem(request: Request, env: SeenShotEnv): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const apiUrl = `${env.API_BASE_URL}/v1/billing/redeem`;
  const inbound = await request.text();
  console.log(`index: billingRedeem uid=${uid} api=${apiUrl} bodyChars=${inbound.length}`);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: request.headers.get("Authorization") || "",
      "Content-Type": "application/json",
    },
    body: inbound,
  });
  const text = await response.text();
  console.log(`index: billingRedeem uid=${uid} apiStatus=${response.status} bodyChars=${text.length}`);
  return new Response(text, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json" },
  });
}

// ─── Ariadne's Thread [AT-0007] ─────────────────────
// What: Merge D1 shot rows with objects under private/{uid}/ in R2
// Why:  Cabinet is the user's cloud folder; D1 is metadata, R2 is the files
// Date: 2026-08-26
// Related: [AT-0008] shotImage, infra→backend/src/quota.ts:confirm
// ─────────────────────────────────────────────────────
export async function listShots(uid: string, env: SeenShotEnv): Promise<ShotCard[]> {
  // ─── Ariadne's Thread [AT-0343] ─────────────────────
  // What: Cabinet list omits visibility=unavailable rows
  // Why:  Quota eviction keeps the share URL, not a broken Space card
  // Date: 2026-08-28
  // Related: [AT-0325] backend→quota.ts:evictShot, [AT-0007] src/index.ts:listShots
  // ─────────────────────────────────────────────────────
  const rows = await env.DB.prepare(
    "SELECT shot_id, created_at, bytes, visibility, public_id, watermarked FROM shots WHERE uid = ? AND visibility != 'unavailable' ORDER BY created_at DESC",
  )
    .bind(uid)
    .all<ShotRow>();
  const byId = new Map<string, ShotCard>();
  for (const row of rows.results ?? []) {
    byId.set(row.shot_id, { ...row, source: "d1", pagePath: pagePathFor(row) });
  }
  console.log(`index: listShots d1 uid=${uid} rows=${byId.size} skippedUnavailable=true`);
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

export async function shots(request: Request, env: SeenShotEnv): Promise<Response> {
  const uid = await uidFromRequest(request, env.FIREBASE_PROJECT_ID);
  const cards = await listShots(uid, env);
  return Response.json({ shots: cards });
}

// ─── Ariadne's Thread [AT-0070] ─────────────────────
// What: Echo R2 ETag and Cache-Control; 304 when onlyIf matches
// Why:  Cabinet <img> re-fetched full PNGs every 60s with no ETag
// Date: 2026-08-27
// Related: [AT-0069] public/js/cabinet.js:imageSrc, https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
// ─────────────────────────────────────────────────────
function r2Png(object: R2Object | R2ObjectBody, cacheControl: string): Response {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", object.httpMetadata?.contentType || "image/png");
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", cacheControl);
  // ─── Ariadne's Thread [AT-0362] ─────────────────────
  // What: Send X-Robots-Tag noindex,nofollow on every R2 PNG
  // Why:  Screenshot bytes must not appear in image search
  // Date: 2026-08-28
  // Related: [AT-0050] src/index.ts:publicPng, https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
  // ─────────────────────────────────────────────────────
  headers.set("x-robots-tag", "noindex, nofollow");
  const body = "body" in object ? object.body : undefined;
  if (!body) {
    console.log(
      `index: r2Png 304 key=${object.key} etag=${object.httpEtag} cache=${cacheControl} robots=noindex,nofollow`,
    );
    return new Response(null, { status: 304, headers });
  }
  console.log(
    `index: r2Png 200 key=${object.key} size=${object.size} etag=${object.httpEtag} cache=${cacheControl} robots=noindex,nofollow`,
  );
  return new Response(body, { headers });
}

export async function shotImage(request: Request, env: SeenShotEnv): Promise<Response> {
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
    `index: shotImage uid=${uid} shot=${shotId} d1=${Boolean(row)} visibility=${row?.visibility ?? "none"} publicId=${row?.public_id ?? "none"} ifNoneMatch=${request.headers.get("if-none-match") ?? "none"}`,
  );
  if (row?.visibility === "public" && row.public_id) {
    const banned = await env.DB.prepare("SELECT public_id FROM takedowns WHERE public_id = ?")
      .bind(row.public_id)
      .first();
    if (banned) {
      console.warn(`index: shotImage takedown publicId=${row.public_id}`);
      return jsonError("UNKNOWN_ERROR", 404);
    }
    const object = await env.BUCKET.get(`public/${row.public_id}.png`, { onlyIf: request.headers });
    if (object) {
      const response = r2Png(object, "private, max-age=86400");
      response.headers.set("vary", "Cookie");
      return response;
    }
    console.warn(`index: shotImage public object missing publicId=${row.public_id}`);
  }
  const privateKey = `private/${uid}/${shotId}.png`;
  const privateObject = await env.BUCKET.get(privateKey, { onlyIf: request.headers });
  if (privateObject) {
    const response = r2Png(privateObject, "private, max-age=86400");
    response.headers.set("vary", "Cookie");
    return response;
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
export async function publicPng(request: Request, env: SeenShotEnv): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const prefix = pathname.startsWith("/api/public/") ? "/api/public/" : "/public/";
  // ─── Ariadne's Thread [AT-0694] ─────────────────────
  // What: Drop a trailing slash before reading the public PNG id
  // Why:  trailingSlash turns /public/{id}.png into /public/{id}.png/ and safeId then rejects the file
  // Date: 2026-10-02
  // Related: [AT-0050] lib/site.ts:publicPng, [AT-0615] next.config.ts:trailingSlash, [AT-0069] lib/client/cabinet.ts:imageSrc
  // ─────────────────────────────────────────────────────
  let file = pathname.slice(prefix.length)
  if (file.endsWith("/")) {
    const stripped = file.slice(0, -1)
    console.log("index: publicPng strip trailing slash file=" + file + " stripped=" + stripped)
    file = stripped
  }
  const id = file.replace(/\.png$/, "")
  console.log(
    `index: publicPng prefix=${prefix} file=${file} id=${id} url=${request.url} ifNoneMatch=${request.headers.get("if-none-match") ?? "none"}`,
  );
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
  const object = await env.BUCKET.get(key, { onlyIf: request.headers });
  if (!object) {
    console.warn(`index: publicPng r2 missing id=${id} key=${key}`);
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }
  console.log(`index: publicPng hit id=${id} key=${key} size=${object.size} prefix=${prefix} hasBody=${"body" in object}`);
  return r2Png(object, "public, max-age=31536000, immutable");
}

export async function uploadProgress(request: Request, env: SeenShotEnv): Promise<Response> {
  const id = decodeURIComponent(new URL(request.url).pathname.slice("/upload-progress/".length));
  if (!id || !safeId(id)) {
    console.warn(`index: uploadProgress bad id path=${request.url}`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  const key = `progress/${id}.json`;
  const object = await env.BUCKET.get(key);
  if (!object) {
    console.log(`index: uploadProgress miss id=${id} key=${key}`);
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }
  console.log(`index: uploadProgress hit id=${id} key=${key} size=${object.size}`);
  return new Response(object.body, {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function loadShare(request: Request, env: SeenShotEnv, prefix: string): Promise<SharePageOpts | Response> {
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
        "SELECT shot_id, public_id, visibility FROM shots WHERE (visibility = 'public' OR visibility = 'unavailable') AND (public_id = ? OR shot_id = ?)",
      )
        .bind(id, id)
        .first<{ shot_id: string; public_id: string | null; visibility: string }>();
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
  // ─── Ariadne's Thread [AT-0341] ─────────────────────
  // What: visibility=unavailable share URLs return 200 with no PNG
  // Why:  Free quota eviction must not 404 links people already opened
  // Date: 2026-08-28
  // Related: [AT-0325] backend→quota.ts:evictShot, [AT-0004] src/html.ts:sharePage
  // ─────────────────────────────────────────────────────
  const imageUrl = `${origin}/public/${publicId}.png`;
  const pageUrl = `${origin}/screenshot/${publicId}`;
  const unavailable = row?.visibility === "unavailable";
  const waiting = !row && !banned && uploading;
  const abuseUrl = reportIssueUrl(publicId, pageUrl);
  console.log(
    `index: share imageUrl=${imageUrl} origin=${origin} r2PublicBase=${env.R2_PUBLIC_BASE_URL}` +
      ` uploading=${uploading} waiting=${waiting} banned=${Boolean(banned)} missing=${!row}` +
      ` unavailable=${unavailable} abuseUrl=${abuseUrl}`,
  );
  const live = Boolean(row) && !waiting && !unavailable;
  const etag = `"share-${publicId}-${live ? "ok" : waiting ? "wait" : unavailable ? "unavailable" : "gone"}-ghissue"`;
  const cacheControl = live ? "private, max-age=60" : "no-store";
  const status = row || waiting ? 200 : 404;
  console.log(
    `index: share prefix=${prefix} id=${id} publicId=${publicId} missing=${!row} banned=${Boolean(banned)}` +
      ` waiting=${waiting} unavailable=${unavailable} live=${live} etag=${etag} imageUrl=${imageUrl}` +
      ` abuseUrl=${abuseUrl} robots=noindex,nofollow`,
  );
  return {
    publicId,
    imageUrl,
    pageUrl,
    missing: !row,
    unavailable,
    uploading: waiting,
    abuseUrl,
    abuseEmail: env.ABUSE_EMAIL,
    live,
    etag,
    status,
    cacheControl,
  };
}

export function shareNotModified(request: Request, opts: SharePageOpts): Response | null {
  if (!opts.live) {
    return null;
  }
  const headers = shareHtmlHeaders(opts);
  headers.set("etag", opts.etag);
  headers.set("cloudflare-cdn-cache-control", "no-store");
  const inm = request.headers.get("if-none-match");
  if (inm === opts.etag) {
    console.log(
      `index: share 304 path=${new URL(request.url).pathname} etag=${opts.etag} inm=${inm} robots=noindex,nofollow`,
    );
    return new Response(null, { status: 304, headers });
  }
  return null;
}

export function shareHtmlHeaders(opts: SharePageOpts): Headers {
  // ─── Ariadne's Thread [AT-0362] ─────────────────────
  // What: Send X-Robots-Tag noindex,nofollow on share HTML
  // Why:  Screenshot pages are private and must not enter search
  // Date: 2026-08-28
  // Related: [AT-0362] public/robots.txt, [AT-0004] src/html.ts:sharePage, https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
  // ─────────────────────────────────────────────────────
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": opts.cacheControl,
    "x-robots-tag": "noindex, nofollow",
  });
  // ─── Ariadne's Thread [AT-0074] ─────────────────────
  // What: ETag/304 on live /screenshot/{id}; Cloudflare-CDN-Cache-Control no-store
  // Why:  PNG is already immutable; HTML must not sit on the CDN after Report
  // Date: 2026-08-27
  // Related: [AT-0050] src/index.ts:publicPng, https://developers.cloudflare.com/cache/concepts/cdn-cache-control/
  // ─────────────────────────────────────────────────────
  if (opts.live) {
    headers.set("etag", opts.etag);
    headers.set("cloudflare-cdn-cache-control", "no-store");
  }
  return headers;
}

export function ownerShotId(request: Request): string | Response {
  const shotId = decodeURIComponent(new URL(request.url).pathname.slice("/shot/".length));
  if (!shotId || !safeId(shotId)) {
    console.warn(`index: owner shot missing id path=${request.url} robots=noindex,nofollow`);
    return jsonError("UNKNOWN_ERROR", 400);
  }
  console.log(`index: owner shot page shotId=${shotId} robots=noindex,nofollow`);
  return shotId;
}
