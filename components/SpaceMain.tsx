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
        {/* ─── Ariadne's Thread [AT-0289] ─────────────────────
          What: Set Upgrade to Pro label to Upgrade to Pro · $29 year
          Why:  Cabinet checkout pill must show the Member yearly price
          Date: 2026-08-27
          Related: [AT-0282] public/space/index.html, [AT-0283] public/js/nav.js:paint
        ─────────────────────────────────────────────────────── */}
        <button type="button" id="upgrade-pro" className="download" hidden={true}>Upgrade to Pro · $29 year</button>
        {/* ─── Ariadne's Thread [AT-0431] ─────────────────────
          What: Cabinet Redeem promocode pill next to Upgrade to Pro
          Why:  Signed-in space must open the existing /space/redem Polar code flow
          Date: 2026-09-03
          Related: [AT-0385] lib/client/redem.ts, [AT-0285] SpaceMain.tsx:.cabinet-actions
        ─────────────────────────────────────────────────────── */}
        <a id="redeem-promocode" className="download" href="/space/redem/" hidden={true}>Redeem promocode</a>
      </div>
    </div>
    {/* ─── Ariadne's Thread [AT-0415] ─────────────────────
      What: Put cabinet #latest-download first inside #empty, then the Cmd+Shift+2 hint
      Why:  Download Free for macOS must live in the empty card, not above it
      Date: 2026-09-03
      Related: [AT-0414] public/space/index.html:#empty-wrap, [AT-0397] public/index.html:#latest-download
    ─────────────────────────────────────────────────────── */}
    <div id="empty-wrap" className="empty-wrap" hidden={true}>
      <div id="empty" className="empty">
        <div className="download-wrap">
          {/* ─── Ariadne's Thread [AT-0517] ─────────────────────
            What: Cabinet Download href is /download/arm64
            Why:  Empty-card CTA must start the latest DMG, not open GitHub Releases
            Date: 2026-09-05
            Related: [AT-0515] backend→lib/site.ts:redirectLatestMacDmg, [AT-0415] components/SpaceMain.tsx:#empty
          ─────────────────────────────────────────────────────── */}
          <a id="latest-download" className="download" href="/download/arm64">
            <svg className="download-apple" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" width="18" height="18">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"></path>
            </svg>
            <span className="download-label">Download Free for macOS</span>
          </a>
          <p className="download-arch">Apple Silicon (arm64)</p>
        </div>
        <p>Create First Screen Shot Cmd + Shift + 2 and share it.</p>
      </div>
    </div>
    <div id="feed" className="feed"></div>
  </main>
  );
}
