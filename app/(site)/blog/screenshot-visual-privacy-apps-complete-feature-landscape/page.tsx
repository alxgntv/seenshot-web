import type { Metadata } from "next";
import { JsonLdScript } from "@/components/JsonLdScript";
import { SitePage } from "@/components/SiteChrome";
import { html } from "@/content/blog-screenshot-visual-privacy-apps";
import { blogArticleJsonLd } from "@/content/site-jsonld";

// ─── Ariadne's Thread [AT-0495] ─────────────────────
// What: Add /blog/screenshot-visual-privacy-apps-complete-feature-landscape/ with Keenable report chrome
// Why:  Host the SELECT feature-landscape presentation on seenshot.app without restyling it as a legal card
// Date: 2026-09-04
// Related: [AT-0349] app/(site)/blog/best-screenshot-apps-2026/page.tsx, [AT-0495] content/blog-screenshot-visual-privacy-apps.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0499] ─────────────────────
// What: Point page metadata at the Medium-style product article title
// Why:  Tab title and description must match the rewritten report copy
// Date: 2026-09-04
// Related: [AT-0499] content/blog-screenshot-visual-privacy-apps.ts, [AT-0495] app/(site)/blog/screenshot-visual-privacy-apps-complete-feature-landscape/page.tsx
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0501] ─────────────────────
// What: Set article metadata title to Screenshot apps landscape at 2026
// Why:  Tab title must match the h1 landscape-at-year format
// Date: 2026-09-04
// Related: [AT-0501] content/blog-screenshot-visual-privacy-apps.ts, [AT-0499] app/(site)/blog/screenshot-visual-privacy-apps-complete-feature-landscape/page.tsx
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0502] ─────────────────────
// What: Set report metadata authors to Alex Ign
// Why:  Tab/document author must match the founder card at the top of the wrap
// Date: 2026-09-04
// Related: [AT-0502] content/blog-screenshot-visual-privacy-apps.ts, [AT-0349] app/(site)/blog/best-screenshot-apps-2026/page.tsx
// ─────────────────────────────────────────────────────

// ─── Ariadne's Thread [AT-0510] ─────────────────────
// What: Set report metadata description to the macOS-only 96-feature map
// Why:  Tab description must not still claim the unfiltered 102-feature scrape
// Date: 2026-09-05
// Related: [AT-0510] content/blog-screenshot-visual-privacy-apps.ts, [AT-0501] app/(site)/blog/screenshot-visual-privacy-apps-complete-feature-landscape/page.tsx
// ─────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Screenshot apps landscape at 2026",
  description:
    "I mapped macOS screenshot and visual-privacy apps, kept 96 shippable features, and scored BlurData against that map.",
  authors: [{ name: "Alex Ign" }],
  other: { author: "Alex Ign" },
};

export default function ScreenshotVisualPrivacyReportPage() {
  return (
    <SitePage>
      {/* ─── Ariadne's Thread [AT-0568] ─────────────────────
        What: Emit BlogPosting JSON-LD on Screenshot apps landscape at 2026
        Why:  The article page must nest Person, Blog, and this BlogPosting
        Date: 2026-09-05
        Related: [AT-0568] content/site-jsonld.ts:blogArticleJsonLd, [AT-0495] app/(site)/blog/screenshot-visual-privacy-apps-complete-feature-landscape/page.tsx
      ─────────────────────────────────────────────────────── */}
      <JsonLdScript
        id="article-jsonld"
        data={blogArticleJsonLd("screenshot-visual-privacy-apps-complete-feature-landscape")}
      />
      <link rel="stylesheet" href="/fonts/keenable-brand.css" />
      <main className="keenable-report" dangerouslySetInnerHTML={{ __html: html }} />
    </SitePage>
  );
}
