import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getEnv } from "@/lib/env"
import { handleRouteError } from "@/lib/http"
import { authorizeGetInvalidResponse, handleAuthorizePost } from "@/lib/oauth"
import { allowScreenshotTraffic } from "@/lib/site"

// ─── Ariadne's Thread [AT-0421] ─────────────────────
// What: 301 /s/{id}, POST /oauth/authorize, share rate limit, crawl-file logs
// Why:  Mac PKCE posts to /oauth/authorize; App Router page.tsx cannot also export POST
// Date: 2026-09-03
// Related: [AT-0362] src/index.ts:fetch, [AT-0040] src/oauth.ts:handleAuthorizePost
// ─────────────────────────────────────────────────────

function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

// ─── Ariadne's Thread [AT-0613] ─────────────────────
// What: Forward the request pathname into x-seenshot-pathname
// Why:  The root layout head must know the landing slug before it closes
// Date: 2026-09-05
// Related: [AT-0612] app/layout.tsx:loadLandingForHead, [AT-0421] middleware.ts
// ─────────────────────────────────────────────────────
function pathnameHeaders(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-seenshot-pathname", request.nextUrl.pathname)
  console.log("SeenShot site: middleware pathname=" + request.nextUrl.pathname)
  return requestHeaders
}

// ─── Ariadne's Thread [AT-0638] ─────────────────────
// What: Handle POST /oauth/authorize and /oauth/authorize/ before slash rewrite
// Why:  vinext 308s POST onto the slash URL, then the page rewrite answered 405 GET,HEAD
// Date: 2026-09-07
// Related: [AT-0421] middleware.ts, [AT-0040] lib/oauth.ts:handleAuthorizePost, [AT-0615] next.config.ts:trailingSlash
// ─────────────────────────────────────────────────────
async function oauthAuthorizeResponse(request: NextRequest, pathname: string) {
  const method = request.method
  console.log(
    "index: oauth authorize method=" + method +
      " path=" + pathname +
      " host=" + request.nextUrl.hostname
  )
  if (method === "POST") {
    try {
      const response = await handleAuthorizePost(request, getEnv())
      console.log("index: oauth authorize POST status=" + response.status)
      return response
    } catch (error) {
      console.error("index: oauth authorize POST failed", error)
      return handleRouteError(error)
    }
  }
  if (method === "GET") {
    const invalid = authorizeGetInvalidResponse(request)
    if (invalid) {
      console.warn("index: oauth authorize GET invalid status=" + invalid.status)
      return invalid
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname
  const requestHeaders = pathnameHeaders(request)
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    console.log(
      "index: crawl file host=" + url.hostname +
        " path=" + pathname +
        " method=" + request.method
    )
  }
  const normalized = stripTrailingSlash(pathname)
  if (normalized === "/s" || normalized.startsWith("/s/")) {
    const id = normalized.slice("/s/".length)
    const target = url.origin + "/screenshot/" + id
    console.log(`index: redirect /s/ to ${target} robots=noindex,nofollow`)
    const response = NextResponse.redirect(target, 301)
    response.headers.set("x-robots-tag", "noindex, nofollow")
    const env = getEnv()
    const limited = await allowScreenshotTraffic(request, env)
    if (limited) {
      return limited
    }
    return response
  }
  if (normalized === "/oauth/authorize") {
    const oauthResponse = await oauthAuthorizeResponse(request, pathname)
    if (oauthResponse) {
      return oauthResponse
    }
  }
  // ─── Ariadne's Thread [AT-0428] ─────────────────────
  // What: Rewrite /space/ and other HTML trailing slashes without a 308
  // Why:  Worker URLs used /space/; vinext still 308s despite skipTrailingSlashRedirect
  // Date: 2026-09-03
  // Related: [AT-0421] middleware.ts, next.config.ts:skipTrailingSlashRedirect
  // ─────────────────────────────────────────────────────
  if (pathname !== "/" && pathname.endsWith("/")) {
    const dest = new URL(request.url)
    dest.pathname = normalized
    console.log("index: trailing slash rewrite path=" + pathname + " dest=" + dest.pathname)
    return NextResponse.rewrite(dest, { request: { headers: requestHeaders } })
  }
  if (pathname.startsWith("/screenshot/")) {
    const limited = await allowScreenshotTraffic(request, getEnv())
    if (limited) {
      return limited
    }
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/",
    "/s/:path*",
    "/robots.txt",
    "/sitemap.xml",
    "/oauth/authorize",
    "/oauth/authorize/",
    "/screenshot/:path*",
    "/space",
    "/space/:path*",
    "/blog",
    "/blog/:path*",
    "/releases",
    "/releases/:path*",
    "/privacy",
    "/privacy/:path*",
    "/terms",
    "/terms/:path*",
    "/cookies",
    "/cookies/:path*",
    "/refund",
    "/refund/:path*",
    "/acceptable-use",
    "/acceptable-use/:path*",
    "/copyright",
    "/copyright/:path*",
    "/contact",
    "/contact/:path*",
    "/cabinet",
    "/cabinet/:path*",
    "/pricing",
    "/pricing/:path*",
    // ─── Ariadne's Thread [AT-0594] ─────────────────────
    // What: Match one-segment unique landing paths in middleware
    // Why:  /{slug}/ trailing-slash rewrite must run for catalog landings, not only the listed marketing pages
    // Date: 2026-09-05
    // Related: [AT-0593] next.config.ts, [AT-0428] middleware.ts, [AT-0590] app/(site)/[slug]/page.tsx
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0609] ─────────────────────
    // What: Match /{slug}/ in middleware as well as /{slug}
    // Why:  A slash URL that misses the matcher gets a 308 to the no-slash URL and disagrees with canonical
    // Date: 2026-09-05
    // Related: [AT-0594] middleware.ts:config.matcher, [AT-0428] middleware.ts, [AT-0601] content/landings/catalog.ts:landingCanonical
    // ─────────────────────────────────────────────────────
    "/:slug",
    "/:slug/",
  ],
}
