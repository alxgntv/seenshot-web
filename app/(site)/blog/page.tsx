import type { Metadata } from "next"
import { BlogLandings } from "@/components/BlogLandings"
import { JsonLdScript } from "@/components/JsonLdScript"
import { SitePage } from "@/components/SiteChrome"
import { html } from "@/content/blog-index"
import { listLandings } from "@/content/landings/catalog"
import { mergeLandingIndexItems } from "@/content/landings/feature-landings"
import { blogIndexJsonLd } from "@/content/site-jsonld"

export const metadata: Metadata = {
  title: "Blog - SeenShot",
  description: "SeenShot blog: screenshot app guides and product notes.",
  authors: [{ name: "Alex Ign" }],
  other: { author: "Alex Ign" },
}

export const dynamic = "force-dynamic"

export default async function BlogIndexPage() {
  const dbLandings = await listLandings()
  const dbItems = dbLandings.map(function (landing) {
    console.log(
      "SeenShot site: BlogIndexPage dbLanding slug=" + landing.slug +
        " title=" + landing.seo.title
    )
    return { title: landing.seo.title, slug: landing.slug }
  })
  const items = mergeLandingIndexItems(dbItems)
  console.log(
    "SeenShot site: BlogIndexPage dbCount=" + dbItems.length +
      " landingCount=" + items.length
  )
  return (
    <SitePage>
      {/* ─── Ariadne's Thread [AT-0568] ─────────────────────
        What: Emit Blog JSON-LD on /blog/
        Why:  The personal blog index must nest Person, Blog, and BlogPosting
        Date: 2026-09-05
        Related: [AT-0568] content/site-jsonld.ts:blogIndexJsonLd, [AT-0569] components/JsonLdScript.tsx, https://schema.org/Blog
      ─────────────────────────────────────────────────────── */}
      <JsonLdScript id="blog-jsonld" data={blogIndexJsonLd()} />
      <main className="legal-page">
        <article className="legal card" dangerouslySetInnerHTML={{ __html: html }} />
        {/* ─── Ariadne's Thread [AT-0622] ─────────────────────
          What: List every landing under the Blog card on /blog/
          Why:  Feature and D1 landings must reuse the same legal card index block
          Date: 2026-09-06
          Related: [AT-0622] components/BlogLandings.tsx:BlogLandings, [AT-0349] content/blog-index.ts
        ─────────────────────────────────────────────────────── */}
        <BlogLandings items={items} />
      </main>
    </SitePage>
  )
}
