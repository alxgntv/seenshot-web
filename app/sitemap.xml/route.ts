import { listLandings } from "@/content/landings/catalog";
import { SITE_ORIGIN } from "@/content/site-jsonld";

// ─── Ariadne's Thread [AT-0591] ─────────────────────
// What: Serve sitemap.xml from the static URL list plus the landing catalog
// Why:  Unique SSR landings must appear in the sitemap when they are added to the catalog
// Date: 2026-09-05
// Related: [AT-0583] content/landings/catalog.ts:landings, [AT-0421] middleware.ts, https://www.sitemaps.org/protocol.html
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0603] ─────────────────────
// What: Append D1 landings onto sitemap.xml at request time
// Why:  A new landings row must enter the sitemap without editing a static XML file
// Date: 2026-09-05
// Related: [AT-0601] content/landings/catalog.ts:listLandings, [AT-0600] backend→migrations/0002_landings.sql
// ─────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

type SitemapUrl = {
  loc: string;
  lastmod: string;
};

const STATIC_SITEMAP: SitemapUrl[] = [
  { loc: SITE_ORIGIN + "/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/blog/", lastmod: "2026-08-28" },
  {
    loc: SITE_ORIGIN + "/blog/screenshot-visual-privacy-apps-complete-feature-landscape/",
    lastmod: "2026-09-04",
  },
  { loc: SITE_ORIGIN + "/blog/best-screenshot-apps-2026/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/releases/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/pricing/", lastmod: "2026-09-05" },
  { loc: SITE_ORIGIN + "/privacy/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/terms/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/cookies/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/refund/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/acceptable-use/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/copyright/", lastmod: "2026-08-28" },
  { loc: SITE_ORIGIN + "/contact/", lastmod: "2026-08-28" },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sitemapXml(urls: SitemapUrl[]) {
  const body = urls
    .map(function (url) {
      return (
        "  <url>\n    <loc>" +
        escapeXml(url.loc) +
        "</loc>\n    <lastmod>" +
        escapeXml(url.lastmod) +
        "</lastmod>\n  </url>"
      );
    })
    .join("\n");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    "\n</urlset>\n"
  );
}

async function handle(request: Request) {
  const url = new URL(request.url);
  const today = new Date().toISOString().slice(0, 10);
  const landings = await listLandings();
  const landingUrls = landings.map(function (landing) {
    console.log(
      "SeenShot site: sitemap landing slug=" + landing.slug +
        " loc=" + landing.seo.canonical
    );
    return { loc: landing.seo.canonical, lastmod: today };
  });
  const urls = STATIC_SITEMAP.concat(landingUrls);
  console.log(
    "index: sitemap route host=" + url.hostname +
      " path=" + url.pathname +
      " method=" + request.method +
      " static=" + STATIC_SITEMAP.length +
      " landings=" + landingUrls.length +
      " total=" + urls.length
  );
  return new Response(sitemapXml(urls), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export function GET(request: Request) {
  return handle(request);
}

export function HEAD(request: Request) {
  return handle(request);
}
