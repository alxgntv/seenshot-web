import { notFound } from "next/navigation"
import { LandingPageMain } from "@/components/LandingPageMain"
import { SitePage } from "@/components/SiteChrome"
import { getLanding } from "@/content/landings/catalog"

// ─── Ariadne's Thread [AT-0590] ─────────────────────
// What: Serve unique SSR landings at /{slug}/ from the landing catalog
// Why:  New landings must emit per-page metadata, Open Graph, and Twitter without a new page.tsx file each time
// Date: 2026-09-05
// Related: [AT-0583] content/landings/catalog.ts:getLanding, [AT-0589] components/LandingPageMain.tsx, [AT-0416] app/layout.tsx
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0602] ─────────────────────
// What: Read /{slug}/ landings from D1 on every request
// Why:  A new landings row must appear without generateStaticParams or a catalog file
// Date: 2026-09-05
// Related: [AT-0601] content/landings/catalog.ts:getLanding, [AT-0600] backend→migrations/0002_landings.sql
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0614] ─────────────────────
// What: Stop generateMetadata on unique landings
// Why:  Vinext put async generateMetadata after /head. Title and canonical now live in the layout head
// Date: 2026-09-05
// Related: [AT-0611] components/LandingDocumentHead.tsx, [AT-0612] app/layout.tsx:loadLandingForHead
// ─────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export default async function LandingSlugPage({ params }: PageProps) {
  const { slug } = await params
  const landing = await getLanding(slug)
  if (!landing) {
    console.error("SeenShot site: LandingSlugPage 404 slug=" + slug)
    notFound()
  }
  console.log(
    "SeenShot site: LandingSlugPage slug=" + landing.slug +
      " canonical=" + landing.seo.canonical
  )
  return (
    <SitePage landing version signOut>
      <LandingPageMain landing={landing} />
    </SitePage>
  )
}
