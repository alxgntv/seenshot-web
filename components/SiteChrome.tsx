import { DownloadPill } from "./DownloadPill"

// ─── Ariadne's Thread [AT-0423] ─────────────────────
// What: Shared topnav brand, Sign In, optional Sign Out, and legal footer
// Why:  Product pages keep the same English chrome as the Worker HTML
// Date: 2026-09-03
// Related: [AT-0009] public/js/nav.js, [AT-0252] public/index.html:.site-foot, [AT-0430] components/ClientBoot.tsx
// ─────────────────────────────────────────────────────

export function TopNav({
  landing = false,
  oauth = false,
  signOut = false,
}: {
  landing?: boolean;
  oauth?: boolean;
  signOut?: boolean;
}) {
  // ─── Ariadne's Thread [AT-0438] ─────────────────────
  // What: Wrap landing and cabinet Sign In / email / Sign Out in details.topnav-menu
  // Why:  Landing mobile kept #nav-auth next to .brand-name so the email overlapped SeenShot.app
  // Date: 2026-09-03
  // Related: [AT-0437] components/SiteChrome.tsx:TopNav, [AT-0410] app/site.css:body:has(main.landing) .topnav, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
  // ─────────────────────────────────────────────────────
  // ─── Ariadne's Thread [AT-0525] ─────────────────────
  // What: Add Pricing hash link and Download CTA inside details.topnav-menu
  // Why:  Sticky header must jump to #pricing and reuse /download/arm64 without a second download path
  // Date: 2026-09-05
  // Related: [AT-0438] components/SiteChrome.tsx:TopNav, [AT-0517] components/DownloadPill.tsx, [AT-0243] components/LandingMain.tsx:Pricing
  // ─────────────────────────────────────────────────────
  // ─── Ariadne's Thread [AT-0632] ─────────────────────
  // What: Point #nav-pricing at /#pricing
  // Why:  Header Pricing must jump to homepage #pricing, not open /pricing/
  // Date: 2026-09-06
  // Related: [AT-0552] components/SiteChrome.tsx:TopNav, [AT-0562] components/LandingMain.tsx:#pricing, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href
  // ─────────────────────────────────────────────────────
  console.log(
    "SeenShot site: TopNav pricingHref=/#pricing landing=" + Boolean(landing) +
      " oauth=" + Boolean(oauth) +
      " signOut=" + Boolean(signOut)
  )
  const authNav = (
    <nav>
      <a id="nav-pricing" href="/#pricing">
        Pricing
      </a>
      {/* ─── Ariadne's Thread [AT-0628] ─────────────────────
        What: Render #nav-download with the same Apple mark as hero Download pills
        Why:  Header Download must show the Apple SVG next to the Download label
        Date: 2026-09-06
        Related: [AT-0525] components/SiteChrome.tsx:TopNav, [AT-0423] components/DownloadPill.tsx:DownloadPill
      ─────────────────────────────────────────────────────── */}
      <DownloadPill id="nav-download" label="Download" />
      <a id="nav-auth" href="/signin">
        Sign In
      </a>
      {signOut ? (
        <button className="sign-out" type="button" id="sign-out" hidden>
          Sign Out
        </button>
      ) : null}
    </nav>
  );
  return (
    <header className="topnav">
      <a className="brand" href="/">
        {/* ─── Ariadne's Thread [AT-0459] ─────────────────────
          What: Lazy-load the topnav SeenShot.png
          Why:  Native loading=lazy on all site media so first paint is not blocked by images
          Date: 2026-09-03
          Related: [AT-0459] components/LandingMain.tsx:.hero-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
        ─────────────────────────────────────────────────────── */}
        <img src="/SeenShot.png" alt="" width={36} height={36} loading="lazy" decoding="async" />
        {landing ? (
          <span className="brand-copy">
            <span className="brand-name">SeenShot.app</span>
            {/* ─── Ariadne's Thread [AT-0442] ─────────────────────
              What: Set landing .brand .lede to Fast annotation for Ai Agents
              Why:  Header tagline must name the AI-agent annotation loop, not MacOS marketing
              Date: 2026-09-03
              Related: [AT-0438] components/SiteChrome.tsx:TopNav, [AT-0403] components/LandingMain.tsx:.lede
            ─────────────────────────────────────────────────────── */}
            {/* ─── Ariadne's Thread [AT-0471] ─────────────────────
              What: Set the landing brand lede to Fast, Secure annotation App for Ai Agents
              Why:  The top navigation must use the supplied secure-app tagline
              Date: 2026-09-03
              Related: [AT-0442] components/SiteChrome.tsx:.brand .lede
            ─────────────────────────────────────────────────────── */}
            <span className="lede">Fast, Secure annotation App for Ai Agents</span>
          </span>
        ) : (
          <span className="brand-name">SeenShot.app</span>
        )}
      </a>
      {oauth ? null : (
        <details className="topnav-menu">
          <summary>Menu</summary>
          {authNav}
        </details>
      )}
    </header>
  );
}

// ─── Ariadne's Thread [AT-0617] ─────────────────────
// What: Put #site-version inside the footer Releases link
// Why:  Latest GitHub tag must sit to the right of the Releases label, not on its own row
// Date: 2026-09-05
// Related: [AT-0396] lib/client/releases.ts:paintFooterVersion, [AT-0423] components/SiteChrome.tsx:SiteFooter
// ─────────────────────────────────────────────────────
export function SiteFooter({ version = false }: { version?: boolean }) {
  console.log("SeenShot site: SiteFooter version=" + Boolean(version))
  return (
    <footer className="site-foot">
      <nav>
        <a href="/blog/">Blog</a>
        <a href="/releases/">
          Releases
          {version ? (
            <span id="site-version" className="site-version" hidden></span>
          ) : null}
        </a>
        {/* ─── Ariadne's Thread [AT-0558] ─────────────────────
          What: Add Pricing to the site footer nav
          Why:  /pricing must be reachable from the same footer as Blog and Releases
          Date: 2026-09-05
          Related: [AT-0550] app/(site)/pricing/page.tsx, [AT-0552] components/SiteChrome.tsx:#nav-pricing
        ─────────────────────────────────────────────────────── */}
        <a href="/pricing/">Pricing</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
        <a href="/cookies/">Cookies</a>
        {/* ─── Ariadne's Thread [AT-0560] ─────────────────────
          What: Drop Refunds from the site footer nav
          Why:  Refunds must live on /pricing, not in the global footer
          Date: 2026-09-05
          Related: [AT-0560] app/(site)/pricing/page.tsx:#pricing-refunds, [AT-0558] components/SiteChrome.tsx:.site-foot
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0561] ─────────────────────
          What: Drop Acceptable Use and Copyright from the site footer nav
          Why:  Those legal pages must no longer appear in the global footer
          Date: 2026-09-05
          Related: [AT-0560] components/SiteChrome.tsx:.site-foot, [AT-0374] app/(site)/acceptable-use/page.tsx
        ─────────────────────────────────────────────────────── */}
        <a href="/contact/">Contact</a>
      </nav>
      {/* ─── Ariadne's Thread [AT-0468] ─────────────────────
        What: Add benchmark.directory badge beside the Code Market badge
        Why:  The footer must display both external listing badges in one row
        Date: 2026-09-03
        Related: [AT-0393] components/SiteChrome.tsx:[data-codemarket-widget], [AT-0469] app/site.css:.site-badges
      ─────────────────────────────────────────────────────── */}
      <div className="site-badges">
        <div
          data-codemarket-widget="nl_2d31a38c2cdc488c"
          data-theme-bg="#ffffff"
          data-theme-text="slate-600"
          data-layout="grid"
          data-show-branding="false"
        ></div>
        <a
          href="https://benchmark.directory/tools/seenshot-app"
          target="_blank"
          rel="noopener"
          title="Seenshot.app on benchmark.directory"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "#201e1d",
            color: "#f3f2f2",
            border: "2px solid #201e1d",
            font: "800 13px/1 Archivo,system-ui,sans-serif",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "18px",
              height: "18px",
              background: "#f3f2f2",
              color: "#201e1d",
              textAlign: "center",
              lineHeight: "18px",
              fontSize: "12px",
            }}
          >
            b<span style={{ color: "#ff563c" }}>.</span>
          </span>
          <span>
            Listed on benchmark<span style={{ color: "#ff563c" }}>.directory</span>
          </span>
        </a>
      </div>
    </footer>
  );
}

export function SitePage({
  children,
  landing = false,
  oauth = false,
  signOut = false,
  version = false,
}: {
  children: React.ReactNode;
  landing?: boolean;
  oauth?: boolean;
  signOut?: boolean;
  version?: boolean;
}) {
  return (
    <>
      <TopNav landing={landing} oauth={oauth} signOut={signOut} />
      {children}
      <SiteFooter version={version} />
    </>
  );
}
