import type { Metadata } from "next";
import { PricingCards } from "@/components/PricingCards";
import { SitePage } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Pricing - SeenShot",
  description: "SeenShot Member $29/year, Lifetime $87, and Corporate pricing.",
};

export default function PricingPage() {
  console.log("SeenShot site: PricingPage");
  return (
    <SitePage version signOut>
      {/* ─── Ariadne's Thread [AT-0550] ─────────────────────
        What: Serve Pricing as /pricing with the existing card list
        Why:  Nav Pricing must open a page that can start Polar checkout for the selected plan
        Date: 2026-09-05
        Related: [AT-0552] components/SiteChrome.tsx:#nav-pricing, [AT-0550] components/PricingCards.tsx
      ─────────────────────────────────────────────────────── */}
      <main className="landing">
        <h2 id="pricing">Pricing</h2>
        <PricingCards checkout />
        {/* ─── Ariadne's Thread [AT-0560] ─────────────────────
          What: Add Refunds under the /pricing cards
          Why:  Refunds left the footer; the paid-plan page must still reach /refund/
          Date: 2026-09-05
          Related: [AT-0560] components/SiteChrome.tsx:.site-foot, [AT-0374] app/(site)/refund/page.tsx
        ─────────────────────────────────────────────────────── */}
        <p className="pricing-refunds">
          <a id="pricing-refunds" href="/refund/">
            Refunds
          </a>
        </p>
      </main>
    </SitePage>
  );
}
