// ─── Ariadne's Thread [AT-0569] ─────────────────────
// What: Render native application/ld+json from a JSON object
// Why:  Next.js JSON-LD must use a script tag and escape <, not next/script
// Date: 2026-09-05
// Related: [AT-0568] content/site-jsonld.ts, [AT-0566] components/LandingFaq.tsx:#faq-jsonld, https://nextjs.org/docs/app/guides/json-ld
// ─────────────────────────────────────────────────────
export function JsonLdScript({ id, data }: { id: string; data: object }) {
  const html = JSON.stringify(data).replace(/</g, "\\u003c");
  console.log("SeenShot site: JsonLdScript id=" + id + " chars=" + html.length);
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
