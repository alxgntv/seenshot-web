import type { Metadata } from "next";
import { JsonLdScript } from "@/components/JsonLdScript";
import { SitePage } from "@/components/SiteChrome";
import { html } from "@/content/blog-best-screenshot-apps-2026";
import { blogArticleJsonLd } from "@/content/site-jsonld";

export const metadata: Metadata = {
  title: "Top ScreenShot Apps 2026: Best Tools for Capturing & Sharing",
  description:
    "Discover the best screenshot apps of 2026 for Windows, Mac, and Linux. Explore top screen capture tools like Snagit and ShareX for professional documentation, quick sharing, and AI-assisted workflows.",
  authors: [{ name: "Alex Ign" }],
  other: { author: "Alex Ign" },
};

export default function BlogPostPage() {
  return (
    <SitePage>
      {/* ─── Ariadne's Thread [AT-0568] ─────────────────────
        What: Emit BlogPosting JSON-LD on Best ScreenShot Apps 2026
        Why:  The article page must nest Person, Blog, and this BlogPosting
        Date: 2026-09-05
        Related: [AT-0568] content/site-jsonld.ts:blogArticleJsonLd, [AT-0349] app/(site)/blog/best-screenshot-apps-2026/page.tsx
      ─────────────────────────────────────────────────────── */}
      <JsonLdScript id="article-jsonld" data={blogArticleJsonLd("best-screenshot-apps-2026")} />
      <main className="legal-page">
        <article className="legal card" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </SitePage>
  );
}
