import { DownloadWrap } from "@/components/DownloadPill"
import { LandingMain } from "@/components/LandingMain"

const SPACE_IMAGE_TITLE = "My Screenshots - SeenShot"
const SPACE_IMAGE_DESCRIPTION = "Hit cmd+shift+2, annotate, insert in to your agent. Free screenshot app for macOS."

export function SpaceMain() {
  console.log("SeenShot site: SpaceMain heading=Welcome To SeenShot")
  return (
<main className="page">
    {/* ─── Ariadne's Thread [AT-0717] ─────────────────────
      What: Restore My Screenshots and #nav-quota on the left of .cabinet-head
      Why:  The cabinet title row must stay. Download stays on the right of that heading
      Date: 2026-10-02
      Related: [AT-0078] components/SpaceMain.tsx:.cabinet-title, [AT-0708] lib/client/nav.ts:paint, [AT-0707] components/SpaceMain.tsx:.cabinet-head
    ─────────────────────────────────────────────────────── */}
    <div className="cabinet-head">
      <div className="cabinet-title">
        {/* ─── Ariadne's Thread [AT-0732] ─────────────────────
          What: Set cabinet h1 to Welcome To SeenShot
          Why:  The space heading must greet, not say My Screenshots
          Date: 2026-10-02
          Related: [AT-0717] components/SpaceMain.tsx:.cabinet-title, [AT-0078] components/SpaceMain.tsx:h1
        ─────────────────────────────────────────────────────── */}
        <h1>Welcome To SeenShot</h1>
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
        {/* ─── Ariadne's Thread [AT-0729] ─────────────────────
          What: Drop cabinet DownloadWrap .download-arch
          Why:  The macOS 14 or later line under cabinet Download must not show
          Date: 2026-10-02
          Related: [AT-0721] components/SpaceMain.tsx:DownloadWrap, [AT-0627] components/DownloadPill.tsx:DownloadWrap
        ─────────────────────────────────────────────────────── */}
        <DownloadWrap id="cabinet-download" label="Download" arch="" hidden={true} />
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
          {/* ─── Ariadne's Thread [AT-0728] ─────────────────────
            What: Set #buy-appsumo label to AppSumo
            Why:  Cabinet buy pill must say AppSumo, not Buy on AppSumo
            Date: 2026-10-02
            Related: [AT-0689] components/SpaceMain.tsx:#buy-appsumo, [AT-0709] lib/client/paid-ui.ts:paintPaidCabinet
          ─────────────────────────────────────────────────────── */}
          AppSumo
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
        founderAgents
      />
    </div>
    <div id="feed" className="feed"></div>
  </main>
  );
}
