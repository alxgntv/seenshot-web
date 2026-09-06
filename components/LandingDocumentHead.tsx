import type { Landing } from "@/content/landings/types"

// ─── Ariadne's Thread [AT-0611] ─────────────────────
// What: Emit landing title, canonical, description, robots, Open Graph, and Twitter inside the document head
// Why:  Vinext streams generateMetadata into the body so SEO tools reported TITLE and canonical outside HEAD
// Date: 2026-09-05
// Related: [AT-0612] app/layout.tsx:loadLandingForHead, [AT-0602] app/(site)/[slug]/page.tsx, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#rel
// ─────────────────────────────────────────────────────

export function LandingDocumentHead({ landing }: { landing: Landing }) {
  const image = landing.og.images[0]
  console.log(
    "SeenShot site: LandingDocumentHead slug=" + landing.slug +
      " title=" + landing.seo.title +
      " canonical=" + landing.seo.canonical +
      " robots=" + landing.seo.robots +
      " ogImage=" + (image ? image.url : "none")
  )
  return (
    <>
      <title>{landing.seo.title}</title>
      <meta name="description" content={landing.seo.description} />
      <meta name="robots" content={landing.seo.robots} />
      <link rel="canonical" href={landing.seo.canonical} />
      <meta property="og:type" content={landing.og.type} />
      <meta property="og:url" content={landing.og.url} />
      <meta property="og:title" content={landing.og.title} />
      <meta property="og:description" content={landing.og.description} />
      <meta property="og:site_name" content={landing.og.siteName} />
      <meta property="og:locale" content={landing.og.locale} />
      {image ? (
        <>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={String(image.width)} />
          <meta property="og:image:height" content={String(image.height)} />
          <meta property="og:image:alt" content={image.alt} />
        </>
      ) : null}
      <meta name="twitter:card" content={landing.twitter.card} />
      <meta name="twitter:title" content={landing.twitter.title} />
      <meta name="twitter:description" content={landing.twitter.description} />
      {landing.twitter.images[0] ? (
        <meta name="twitter:image" content={landing.twitter.images[0]} />
      ) : null}
    </>
  )
}
