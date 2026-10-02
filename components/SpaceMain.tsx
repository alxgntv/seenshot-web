import { DownloadPill } from "@/components/DownloadPill"
import { LandingMain } from "@/components/LandingMain"

const SPACE_IMAGE_TITLE = "My Screenshots - SeenShot"
const SPACE_IMAGE_DESCRIPTION = "Hit cmd+shift+2, annotate, insert in to your agent. Free screenshot app for macOS."

export function SpaceMain() {
  return (
<main className="page">
    <div className="cabinet-head">
      <div className="cabinet-title">
        <h1>My Screenshots</h1>
        {/* ─── Ariadne's Thread [AT-0078] ─────────────────────
          What: Quota sits to the right of My Screenshots
          Why:  Storage leftover left the top nav; the cabinet title is the place it belongs
          Date: 2026-08-27
          Related: [AT-0072] public/js/nav.js:paint, [AT-0022] public/space/index.html
        ─────────────────────────────────────────────────────── */}
        <span id="nav-quota" className="nav-quota" hidden={true}></span>
      </div>
      {/* ─── Ariadne's Thread [AT-0282] ─────────────────────
        What: Cabinet Upgrade to Pro button next to Download
        Why:  Signed-in space is where Member checkout starts via Polar
        Date: 2026-08-27
        Related: [AT-0281] src/index.ts:billingCheckout, [AT-0283] public/js/nav.js:paint
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0285] ─────────────────────
        What: Wrap Upgrade to Pro and Download in .cabinet-actions
        Why:  The two cabinet pills must sit as one button group, not spread across the row
        Date: 2026-08-27
        Related: [AT-0282] public/space/index.html, [AT-0286] public/css/site.css:.cabinet-actions
      ─────────────────────────────────────────────────────── */}
      <div className="cabinet-actions" role="group" aria-label="Cabinet actions">
        {/* ─── Ariadne's Thread [AT-0685] ─────────────────────
          What: Keep a cabinet Download pill in .cabinet-actions for signed-in users
          Why:  App DMG is only after registration. Empty-card CTA is hidden once shots exist
          Date: 2026-10-02
          Related: [AT-0415] components/SpaceMain.tsx:#latest-download, [AT-0679] lib/site.ts:serveLatestMacDmg
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0702] ─────────────────────
          What: Default cabinet Download label is Download. ARM
          Why:  Signed-in CTA must name the Mac chip after the period. Chip detect can switch it to Download. x86
          Date: 2026-10-02
          Related: [AT-0685] components/SpaceMain.tsx:#cabinet-download, [AT-0702] lib/client/releases.ts:paintDownloadHref
        ─────────────────────────────────────────────────────── */}
        <DownloadPill id="cabinet-download" label="Download. ARM" hidden={true} />
        {/* ─── Ariadne's Thread [AT-0689] ─────────────────────
          What: Cabinet Pay with card and Buy on AppSumo sit next to Download
          Why:  Free accounts must buy Member before the DMG. Card uses Polar checkout. AppSumo uses the live deal
          Date: 2026-10-02
          Related: [AT-0687] lib/client/paid-ui.ts:paintPaidCabinet, [AT-0284] lib/client/cabinet.ts:startCheckout
        ─────────────────────────────────────────────────────── */}
        <button type="button" id="upgrade-pro" className="download" hidden={true}>Pay with card · $29 year</button>
        <a
          id="buy-appsumo"
          className="download"
          href="https://appsumo.com/products/seenshotapp/"
          target="_blank"
          rel="noopener noreferrer"
          hidden={true}
        >
          Buy on AppSumo
        </a>
        {/* ─── Ariadne's Thread [AT-0431] ─────────────────────
          What: Cabinet Redeem promocode pill next to Upgrade to Pro
          Why:  Signed-in space must open the existing /space/redem Polar code flow
          Date: 2026-09-03
          Related: [AT-0385] lib/client/redem.ts, [AT-0285] SpaceMain.tsx:.cabinet-actions
        ─────────────────────────────────────────────────────── */}
        <a id="redeem-promocode" className="download" href="/space/redem/" hidden={true}>Redeem promocode</a>
      </div>
    </div>
    {/* ─── Ariadne's Thread [AT-0703] ─────────────────────
      What: Show the homepage presentation in #empty-wrap when the cabinet feed has no shots
      Why:  Empty My Screenshots must reuse hero, features, and pricing without the Compare table
      Date: 2026-10-02
      Related: [AT-0703] components/LandingMain.tsx:LandingMain, [AT-0415] lib/client/cabinet.ts:setEmptyVisible
    ─────────────────────────────────────────────────────── */}
    <div id="empty-wrap" className="empty-wrap" hidden={true}>
      <LandingMain
        as="div"
        rootId="empty"
        compare={false}
        jsonLd={false}
        imageMeta={{
          title: SPACE_IMAGE_TITLE,
          description: SPACE_IMAGE_DESCRIPTION,
        }}
      />
    </div>
    <div id="feed" className="feed"></div>
  </main>
  );
}
