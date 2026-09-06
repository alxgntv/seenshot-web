import type { LandingFaqItem } from "@/content/landing-faq";
import { landingFaqItems, landingFaqJsonLd } from "@/content/landing-faq";
import { JsonLdScript } from "./JsonLdScript";

// ─── Ariadne's Thread [AT-0565] ─────────────────────
// What: Render landing FAQ as native details/summary after Pricing
// Why:  Homepage must show the selected product questions without a custom accordion
// Date: 2026-09-05
// Related: [AT-0565] content/landing-faq.ts, [AT-0562] components/LandingMain.tsx:#pricing, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0585] ─────────────────────
// What: Accept FAQ items and pageUrl on LandingFaq
// Why:  Unique SSR landings must reuse the homepage details/summary FAQ with their own questions and canonical hashes
// Date: 2026-09-05
// Related: [AT-0584] content/landing-faq.ts:landingFaqJsonLd, [AT-0589] components/LandingPageMain.tsx, [AT-0565] components/LandingFaq.tsx
// ─────────────────────────────────────────────────────
export function LandingFaq({
  items = landingFaqItems,
  pageUrl = "https://seenshot.app/",
}: {
  items?: LandingFaqItem[];
  pageUrl?: string;
} = {}) {
  if (items.length === 0) {
    console.log("SeenShot site: LandingFaq skip empty items pageUrl=" + pageUrl);
    return null;
  }
  const jsonLd = landingFaqJsonLd(items, pageUrl);
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
  console.log(
    "SeenShot site: LandingFaq items=" + items.length +
      " pageUrl=" + pageUrl
  );
  console.log(
    "SeenShot site: LandingFaq jsonld type=" + jsonLd["@type"] +
      " questions=" + jsonLd.mainEntity.length +
      " chars=" + jsonLdHtml.length
  );
  items.forEach(function (item, index) {
    console.log(
      "SeenShot site: LandingFaq[" + index + "] id=" + item.id +
        " question=" + item.question +
        " paragraphs=" + item.paragraphs.length +
        " hasLink=" + Boolean(item.link)
    );
  });
  return (
    <section className="faq" aria-labelledby="faq">
      {/* ─── Ariadne's Thread [AT-0566] ─────────────────────
        What: Emit native application/ld+json FAQPage on the FAQ block
        Why:  Search and AI must read the same nine questions as the visible details
        Date: 2026-09-05
        Related: [AT-0566] content/landing-faq.ts:landingFaqJsonLd, [AT-0565] components/LandingFaq.tsx, https://schema.org/FAQPage, https://nextjs.org/docs/app/guides/json-ld
      ─────────────────────────────────────────────────────── */}
      <JsonLdScript id="faq-jsonld" data={jsonLd} />
      <h2 id="faq">FAQ</h2>
      {items.map((item) => (
        <details key={item.id} id={item.id} name="faq">
          <summary>{item.question}</summary>
          {item.paragraphs.map((paragraph, index) => {
            const isLast = index === item.paragraphs.length - 1;
            return (
              <p key={index}>
                {paragraph}
                {isLast && item.link ? (
                  <>
                    {" "}
                    <a id={item.link.id} href={item.link.href}>
                      {item.link.text}
                    </a>
                  </>
                ) : null}
              </p>
            );
          })}
        </details>
      ))}
    </section>
  );
}
