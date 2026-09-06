import { DownloadWrap } from "./DownloadPill";
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
  return (
    <div className="pricing">
      {checkout ? null : (
      <article className="pricing-card">
        {/* ─── Ariadne's Thread [AT-0249] ─────────────────────
          What: Add 10 MB screenshot storage to the Free pricing list
          Why:  Free cloud storage is 10 MB; Member is unlimited
          Date: 2026-08-27
          Related: [AT-0248] public/index.html, [AT-0243] public/index.html
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0380] ─────────────────────
          What: Put Free and Forever in .pricing-head
          Why:  Title and price must share one row
          Date: 2026-08-29
          Related: [AT-0380] public/css/site.css:.pricing-head, [AT-0301] public/index.html:.pricing-price
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0464] ─────────────────────
          What: Remove Forever from the Free pricing header
          Why:  The selected Free pricing label must no longer be shown
          Date: 2026-09-03
          Related: [AT-0380] components/LandingMain.tsx:.pricing-head
        ─────────────────────────────────────────────────────── */}
        <div className="pricing-head">
          <h3>Free</h3>
        </div>
        <ul>
          {/* ─── Ariadne's Thread [AT-0451] ─────────────────────
            What: Put Instant sharing with: and LedeAgents as the first Free list row
            Why:  Free pricing must lead with the same agent marks as .hero .lede-agents
            Date: 2026-09-03
            Related: [AT-0451] components/LedeAgents.tsx:LedeAgents, [AT-0440] components/LandingMain.tsx:.lede-agents
          ─────────────────────────────────────────────────────── */}
          <li>
            Instant sharing with: <LedeAgents />
          </li>
          {/* ─── Ariadne's Thread [AT-0454] ─────────────────────
            What: Put Share via link as the second Free list row
            Why:  Instant sharing must be followed by the share-by-URL line
            Date: 2026-09-03
            Related: [AT-0255] components/LandingMain.tsx:.pricing-card ul, [AT-0451] components/LandingMain.tsx:.pricing-card ul
          ─────────────────────────────────────────────────────── */}
          {/* ─── Ariadne's Thread [AT-0255] ─────────────────────
            What: Rename Free pricing Share Link to Share via link
            Why:  Pricing copy must say the shot is shared by a URL
            Date: 2026-08-27
            Related: [AT-0254] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Share via link</li>
          <li>Path Screen Shot</li>
          <li>Full Screen Shot</li>
          {/* ─── Ariadne's Thread [AT-0257] ─────────────────────
            What: Rename Free pricing Square to Highlight zone
            Why:  Square is the zone highlight; Highlight steps is the numbered tool
            Date: 2026-08-27
            Related: [AT-0256] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Highlight zone</li>
          {/* ─── Ariadne's Thread [AT-0256] ─────────────────────
            What: Rename Free pricing Steps to Highlight steps
            Why:  Pricing copy must name the numbered highlight tool
            Date: 2026-08-27
            Related: [AT-0255] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Highlight steps</li>
          {/* ─── Ariadne's Thread [AT-0267] ─────────────────────
            What: Combine Free pricing Arrow, Line, Text into one comma-separated row
            Why:  Those three annotation tools must share a single list line
            Date: 2026-08-27
            Related: [AT-0256] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Arrow, Line, Text</li>
          {/* ─── Ariadne's Thread [AT-0453] ─────────────────────
            What: Rename Free pricing Blur zone to Blur Sensitive data
            Why:  Free list must use the same Blur name as the Features card
            Date: 2026-09-03
            Related: [AT-0443] components/LandingMain.tsx:.bento-card h3, [AT-0260] components/LandingMain.tsx
          ─────────────────────────────────────────────────────── */}
          <li>Blur Sensitive data</li>
          {/* ─── Ariadne's Thread [AT-0258] ─────────────────────
            What: Rename Free pricing Photo to Add photo to screenshot
            Why:  Pricing copy must say Photo places a camera cutout on the shot
            Date: 2026-08-27
            Related: [AT-0257] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Add photo to screenshot</li>
          {/* ─── Ariadne's Thread [AT-0259] ─────────────────────
            What: Rename Free pricing Color to Color picker
            Why:  Pricing copy must name the annotate color control
            Date: 2026-08-27
            Related: [AT-0258] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Color picker</li>
          <li>Background</li>
          {/* ─── Ariadne's Thread [AT-0254] ─────────────────────
            What: Rename Free pricing Save to Save screenshot locally
            Why:  Save is local disk, not cloud storage
            Date: 2026-08-27
            Related: [AT-0249] public/index.html, [AT-0243] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>Save screenshot locally</li>
          {/* ─── Ariadne's Thread [AT-0455] ─────────────────────
            What: Put Watermarked screenshots as its own Free list row before 10 MB
            Why:  Watermarks must be second-to-last, not on the 10 MB storage line
            Date: 2026-09-03
            Related: [AT-0373] components/LandingMain.tsx:.pricing-card ul, [AT-0412] components/LandingMain.tsx:.pricing-card ul
          ─────────────────────────────────────────────────────── */}
          <li>Watermarked screenshots</li>
          {/* ─── Ariadne's Thread [AT-0456] ─────────────────────
            What: Add No corporate usage to the Free pricing list
            Why:  Free must state the plan is not for corporate use; Member lists Enterprise licence
            Date: 2026-09-03
            Related: [AT-0367] components/LandingMain.tsx:.pricing-card ul, [AT-0455] components/LandingMain.tsx:.pricing-card ul
          ─────────────────────────────────────────────────────── */}
          <li>No corporate usage</li>
          {/* ─── Ariadne's Thread [AT-0373] ─────────────────────
            What: Add 10 MB screenshot storage as the Free last list row
            Why:  Free cloud storage is 10 MB
            Date: 2026-08-28
            Related: [AT-0372] public/index.html, [AT-0249] public/index.html
          ─────────────────────────────────────────────────────── */}
          <li>10 MB screenshot storage</li>
        </ul>
        {/* ─── Ariadne's Thread [AT-0367] ─────────────────────
          What: Use the hero Apple Download pill on the Free pricing card
          Why:  #pricing-download must match #latest-download
          Date: 2026-08-28
          Related: [AT-0347] public/index.html:#latest-download, [AT-0340] public/js/releases.js:setLatestDownloadHref
        ─────────────────────────────────────────────────────── */}
        <DownloadWrap id="pricing-download" />
      </article>
      )}
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
        <p className="pricing-note">Everything in Free. All tools stay free. Member adds 1 GB screenshot storage.</p>
        <ul>
          <li>Everything in Free.</li>
          {/* ─── Ariadne's Thread [AT-0412] ─────────────────────
            What: Put Screenshots without watermarks on its own Member list row
            Why:  Watermarks sat on the Everything in Free line and wrapped as one 61px item
            Date: 2026-09-01
            Related: [AT-0372] public/index.html, [AT-0372] public/js/releases.js
          ─────────────────────────────────────────────────────── */}
          <li>Screenshots without watermarks</li>
          {/* ─── Ariadne's Thread [AT-0367] ─────────────────────
            What: Add Enterprise licence included. $29 per seat to Member list
            Why:  Member card must list the per-seat enterprise licence
            Date: 2026-08-28
            Related: [AT-0243] public/index.html, [AT-0367] public/index.html:#pricing-member-download
          ─────────────────────────────────────────────────────── */}
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
