import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // ─── Ariadne's Thread [AT-0615] ─────────────────────
  // What: Keep public landing URLs with a trailing slash
  // Why:  Canonical is https://seenshot.app/{slug}/ and a 308 to the no-slash URL failed the SEO URL check
  // Date: 2026-09-05
  // Related: [AT-0601] content/landings/catalog.ts:landingCanonical, [AT-0609] middleware.ts:config.matcher
  // ─────────────────────────────────────────────────────
  trailingSlash: true,
  // ─── Ariadne's Thread [AT-0608] ─────────────────────
  // What: Disable streaming metadata so title and canonical stay in the first head
  // Why:  Unique landing generateMetadata was flushed into body and SEO tools reported TITLE and canonical outside HEAD
  // Date: 2026-09-05
  // Related: [AT-0602] app/(site)/[slug]/page.tsx:generateMetadata, https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots
  // ─────────────────────────────────────────────────────
  htmlLimitedBots: /.*/,
  async rewrites() {
    return [
      { source: "/space/", destination: "/space" },
      { source: "/space/redem/", destination: "/space/redem" },
      { source: "/blog/", destination: "/blog" },
      { source: "/releases/", destination: "/releases" },
      { source: "/privacy/", destination: "/privacy" },
      { source: "/terms/", destination: "/terms" },
      { source: "/cookies/", destination: "/cookies" },
      { source: "/refund/", destination: "/refund" },
      { source: "/acceptable-use/", destination: "/acceptable-use" },
      { source: "/copyright/", destination: "/copyright" },
      { source: "/contact/", destination: "/contact" },
      { source: "/cabinet/", destination: "/cabinet" },
      { source: "/pricing/", destination: "/pricing" },
      { source: "/download/", destination: "/download" },
      { source: "/download/arm64/", destination: "/download/arm64" },
      { source: "/download/x86_64/", destination: "/download/x86_64" },
      // ─── Ariadne's Thread [AT-0593] ─────────────────────
      // What: Rewrite /:slug/ onto /:slug after the static page list
      // Why:  Unique SSR landings are not in the per-path rewrite list and must keep trailing-slash URLs
      // Date: 2026-09-05
      // Related: [AT-0590] app/(site)/[slug]/page.tsx, [AT-0428] middleware.ts, [AT-0591] app/sitemap.xml/route.ts
      // ─────────────────────────────────────────────────────
      { source: "/:slug/", destination: "/:slug" },
    ];
  },
  async headers() {
    return [
      {
        source: "/screenshot/:id*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/shot/:id*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
