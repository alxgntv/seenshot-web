import { LedeAgents } from "./LedeAgents";

// ─── Ariadne's Thread [AT-0550] ─────────────────────
// What: Render pricing cards on /pricing with Polar Pay CTAs for Member and Lifetime
// Why:  Pricing left the landing; selected paid plans must start the existing Polar checkout
// Date: 2026-09-05
// Related: [AT-0243] components/LandingMain.tsx:Pricing, [AT-0547] backend→polar.ts:createPolarCheckoutUrl, [AT-0551] lib/client/pricing.ts:startPricing
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0559] ─────────────────────
// What: Drop the Free card from /pricing
// Why:  This page sells Member, Lifetime, and Corporate; Free download stays in the header
// Date: 2026-09-05
// Related: [AT-0550] components/PricingCards.tsx, [AT-0525] components/SiteChrome.tsx:#nav-download
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0618] ─────────────────────
// What: Member and Lifetime always use Polar Buy, not the macOS Download pill
// Why:  Paid cards must open checkout, not /download/arm64
// Date: 2026-09-05
// Related: [AT-0550] components/PricingCards.tsx, [AT-0551] lib/client/pricing.ts:startPricing
// ─────────────────────────────────────────────────────
export function PricingCards({ checkout = false }: { checkout?: boolean }) {
  console.log(
    "SeenShot PricingCards render checkout=" + String(checkout) + " freeCard=false"
  )
  return (
    <div className="pricing">
      <article className="pricing-card">
        {/* ─── Ariadne's Thread [AT-0380] ─────────────────────
          What: Put Member and $29 / year in .pricing-head
          Why:  Title and price must share one row
          Date: 2026-08-29
          Related: [AT-0380] public/css/site.css:.pricing-head, [AT-0301] public/index.html:.pricing-price
        ─────────────────────────────────────────────────────── */}
        <div className="pricing-head">
          <h3>Member</h3>
          <p className="pricing-price">$29 / year</p>
        </div>
        {/* ─── Ariadne's Thread [AT-0690] ─────────────────────
          What: Move Free tool rows onto Member and drop the Free card
          Why:  The only sold plan is $29 / year. Free storage quota stays off this list
          Date: 2026-10-02
          Related: [AT-0451] components/LedeAgents.tsx:LedeAgents, [AT-0412] components/PricingCards.tsx, [AT-0367] components/PricingCards.tsx
        ─────────────────────────────────────────────────────── */}
        <ul>
          <li>
            Instant sharing with: <LedeAgents />
          </li>
          <li>Share via link</li>
          <li>Path Screen Shot</li>
          <li>Full Screen Shot</li>
          <li>Highlight zone</li>
          <li>Highlight steps</li>
          <li>Arrow, Line, Text</li>
          <li>Blur Sensitive data</li>
          <li>Add photo to screenshot</li>
          <li>Color picker</li>
          <li>Background</li>
          <li>Save screenshot locally</li>
          <li>Screenshots without watermarks</li>
          <li>Enterprise licence included. $29 per seat</li>
          <li>1 GB screenshot storage for 365 days</li>
        </ul>
        {/* ─── Ariadne's Thread [AT-0618] ─────────────────────
          What: Member CTA is Buy $29 / year and starts Polar checkout
          Why:  The paid card must not reuse Download Free for macOS
          Date: 2026-09-05
          Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0550] components/PricingCards.tsx:#pricing-pay-member
        ─────────────────────────────────────────────────────── */}
        <div className="download-wrap">
          <button type="button" id="pricing-pay-member" className="download" data-product="member">
            <span className="download-label">Buy $29 / year</span>
          </button>
        </div>
      </article>
      {/* ─── Ariadne's Thread [AT-0450] ─────────────────────
        What: Add Lifetime $179 pricing card after Member
        Why:  Landing Pricing must list the one-time plan next to yearly Member
        Date: 2026-09-03
        Related: [AT-0380] components/LandingMain.tsx:.pricing-head, [AT-0367] components/LandingMain.tsx:#pricing-member-download
      ─────────────────────────────────────────────────────── */}
      <article className="pricing-card">
        <div className="pricing-head">
          <h3>Lifetime</h3>
          {/* ─── Ariadne's Thread [AT-0489] ─────────────────────
            What: Set Lifetime .pricing-price to $87
            Why:  The one-time plan label must show $87, not $179
            Date: 2026-09-04
            Related: [AT-0450] components/LandingMain.tsx:.pricing-card, [AT-0489] lib/client/releases.ts:Lifetime
          ─────────────────────────────────────────────────────── */}
          <p className="pricing-price">$87</p>
        </div>
        <p className="pricing-note">Everything in Member. Pay once.</p>
        <ul>
          <li>Everything in Free.</li>
          <li>Screenshots without watermarks</li>
          {/* ─── Ariadne's Thread [AT-0463] ─────────────────────
            What: Remove the enterprise licence row from Lifetime
            Why:  The selected Lifetime pricing item must no longer be shown
            Date: 2026-09-03
            Related: [AT-0450] components/LandingMain.tsx:.pricing-card, [AT-0367] components/LandingMain.tsx:.pricing-card
          ─────────────────────────────────────────────────────── */}
          <li>1 GB screenshot storage for the lifetime</li>
        </ul>
        {/* ─── Ariadne's Thread [AT-0618] ─────────────────────
          What: Lifetime CTA is Buy $87 and starts Polar checkout
          Why:  The paid card must not reuse Download Free for macOS
          Date: 2026-09-05
          Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0550] components/PricingCards.tsx:#pricing-pay-lifetime
        ─────────────────────────────────────────────────────── */}
        <div className="download-wrap">
          <button type="button" id="pricing-pay-lifetime" className="download" data-product="lifetime">
            <span className="download-label">Buy $87</span>
          </button>
        </div>
      </article>
      {/* ─── Ariadne's Thread [AT-0465] ─────────────────────
        What: Add Corporate pricing card with LinkedIn Contact Me CTA
        Why:  Pricing must include a separate Corporate licence after Lifetime
        Date: 2026-09-03
        Related: [AT-0450] components/LandingMain.tsx:.pricing-card, [AT-0463] components/LandingMain.tsx:.pricing-card
      ─────────────────────────────────────────────────────── */}
      <article className="pricing-card">
        <div className="pricing-head">
          <h3>Corporate</h3>
        </div>
        {/* ─── Ariadne's Thread [AT-0473] ─────────────────────
          What: List Corporate seats, storage, domain, and user management
          Why:  Corporate pricing must state every supplied company capability
          Date: 2026-09-03
          Related: [AT-0465] components/LandingMain.tsx:.pricing-card, [AT-0467] lib/client/releases.ts:Corporate
        ─────────────────────────────────────────────────────── */}
        <ul>
          <li>Everything in Free.</li>
          <li>Buy an unlimited number of seats</li>
          <li>Connect your own storage</li>
          <li>Connect your own domain</li>
          <li>Manage users</li>
        </ul>
        <div className="download-wrap">
          <a id="pricing-corporate-contact" className="corporate-contact" href="https://www.linkedin.com/in/ignalex/">
            <span className="download-label">Contact Me</span>
          </a>
        </div>
      </article>
    </div>
  );
}
