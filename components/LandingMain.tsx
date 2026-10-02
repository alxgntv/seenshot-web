import { DownloadWrap } from "./DownloadPill"
import { LedeAgents } from "./LedeAgents";
import { landingAppJsonLd } from "@/content/site-jsonld";
import { LandingCompare } from "./LandingCompare";
import { LandingFaq } from "./LandingFaq";
import { JsonLdScript } from "./JsonLdScript";
import { PricingCards } from "./PricingCards";
import { WallOfLove } from "./WallOfLove";

type LandingImageMeta = {
  title: string
  description: string
}

function landingShotAttrs(
  fallbackAlt: string,
  imageMeta?: LandingImageMeta,
) {
  if (!imageMeta) {
    console.log("SeenShot site: landingShotAttrs fallbackAlt=" + fallbackAlt)
    return { alt: fallbackAlt }
  }
  console.log(
    "SeenShot site: landingShotAttrs pageTitle=" + imageMeta.title +
      " fallbackAlt=" + fallbackAlt
  )
  return {
    alt: imageMeta.title,
    title: imageMeta.title,
    description: imageMeta.description,
  }
}

// ─── Ariadne's Thread [AT-0703] ─────────────────────
// What: Let LandingMain omit Compare and render as a div with page image meta
// Why:  Empty cabinet must reuse the homepage presentation without the comparison table
// Date: 2026-10-02
// Related: [AT-0703] components/SpaceMain.tsx:#empty-wrap, [AT-0587] components/LandingMain.tsx:LandingCompare
// ─────────────────────────────────────────────────────
export function LandingMain({
  compare = true,
  jsonLd = true,
  as = "main",
  rootId,
  imageMeta,
  founderAgents = false,
}: {
  compare?: boolean
  jsonLd?: boolean
  as?: "main" | "div"
  rootId?: string
  imageMeta?: LandingImageMeta
  founderAgents?: boolean
} = {}) {
  const Root = as
  console.log(
    "SeenShot site: LandingMain as=" + as +
      " rootId=" + (rootId || "") +
      " compare=" + String(compare) +
      " jsonLd=" + String(jsonLd) +
      " founderAgents=" + String(founderAgents) +
      " imageTitle=" + (imageMeta ? imageMeta.title : "")
  )
  return (
    <>
    {/* ─── Ariadne's Thread [AT-0568] ─────────────────────
      What: Emit SoftwareApplication JSON-LD on the landing
      Why:  The homepage presents the macOS app and must expose Person plus SoftwareApplication
      Date: 2026-09-05
      Related: [AT-0568] content/site-jsonld.ts:landingAppJsonLd, [AT-0569] components/JsonLdScript.tsx, https://schema.org/SoftwareApplication
    ─────────────────────────────────────────────────────── */}
    {jsonLd ? <JsonLdScript id="app-jsonld" data={landingAppJsonLd()} /> : null}
<Root className="landing" id={rootId}>
    <section className="hero">
      {/* ─── Ariadne's Thread [AT-0304] ─────────────────────
        What: Drop the 126px SeenShot.png from .hero
        Why:  That logo moved to the topnav left of .brand-copy
        Date: 2026-08-28
        Related: [AT-0303] public/index.html, [AT-0238] public/css/site.css:.hero > img
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0225] ─────────────────────
        What: Hero h1 is plain words; outline is letter stroke and text-shadow
        Why:  Word pills looked like buttons; only glyphs need the Download outline
        Date: 2026-08-27
        Related: [AT-0221] public/css/site.css:.hero-word, [AT-0085] public/css/site.css:h1 .send
      ─────────────────────────────────────────────────────── */}
      <h1>Seen it? <span className="shot">Shot it!</span> <span className="send">Send It&nbsp;<span className="send-arrow">↗</span></span></h1>
      {/* ─── Ariadne's Thread [AT-0403] ─────────────────────
        What: Set hero .lede sentence to Hit cmd+shift+2, annotate, insert in to your agent
        Why:  The loop ends at insert into the agent, not a shareable link
        Date: 2026-09-01
        Related: [AT-0398] public/index.html, [AT-0402] public/index.html:.lede-agents
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0407] ─────────────────────
        What: Use insert in the hero .lede-copy sentence
        Why:  paste in to your agent is replaced with insert in to your agent
        Date: 2026-09-01
        Related: [AT-0403] public/index.html:.lede, [AT-0405] public/index.html:.lede-copy
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0402] ─────────────────────
        What: Put Claude, Codex, Cursor, and OpenCode marks in .hero .lede
        Why:  Those four agent icons belong on the cmd+shift+2 line, not in a separate pill
        Date: 2026-09-01
        Related: [AT-0398] public/index.html, [AT-0402] public/css/site.css:.lede-agents
      ─────────────────────────────────────────────────────── */}
      <p className="lede">
        {/* ─── Ariadne's Thread [AT-0405] ─────────────────────
          What: Place .lede-agents after .lede-copy
          Why:  Agent marks must follow the cmd+shift+2 sentence, not precede it
          Date: 2026-09-01
          Related: [AT-0404] public/css/site.css:.hero .lede, [AT-0402] public/index.html:.lede-agents
        ─────────────────────────────────────────────────────── */}
        <span className="lede-copy">Hit <b>cmd+shift+2</b>, annotate, insert in to your agent.</span>
        <LedeAgents />
      </p>
      {/* ─── Ariadne's Thread [AT-0339] ─────────────────────
        What: Drop #latest-keys and #keys-dialog from .hero-cta
        Why:  Landing shortcut pill must not sit next to Download
        Date: 2026-08-28
        Related: [AT-0297] public/index.html, [AT-0240] public/index.html, [AT-0340] public/js/releases.js:setLatestDownloadHref
      ─────────────────────────────────────────────────────── */}
      <div className="hero-cta">
        {/* ─── Ariadne's Thread [AT-0630] ─────────────────────
          What: Set homepage .download-arch to Free · macOS 14 or later
          Why:  Hero must not show Apple Silicon (arm64) under Download
          Date: 2026-09-06
          Related: [AT-0629] components/LandingMain.tsx:DownloadWrap, [AT-0627] components/DownloadPill.tsx:DownloadWrap
        ─────────────────────────────────────────────────────── */}
        <DownloadWrap id="latest-download" label="Download" arch="Free · macOS 14 or later" />
      </div>
      {/* ─── Ariadne's Thread [AT-0396] ─────────────────────
        What: Keep #latest-meta empty until GitHub download_count is at least 1000
        Why:  Seven downloads under the CTA is evidence against the product, not proof
        Date: 2026-09-01
        Related: [AT-0396] public/js/releases.js:paintLatestMeta, [AT-0394] public/js/releases.js:paintLatestMeta
      ─────────────────────────────────────────────────────── */}
      <p id="latest-meta" className="meta" hidden={true}></p>
    </section>
    {/* ─── Ariadne's Thread [AT-0711] ─────────────────────
      What: Place aside.founder above .hero-shot
      Why:  Empty cabinet and homepage must show Alex Ign under the hero, not under the demo video
      Date: 2026-10-02
      Related: [AT-0263] components/LandingMain.tsx:.founder, [AT-0459] components/LandingMain.tsx:.hero-shot, [AT-0703] components/SpaceMain.tsx:#empty-wrap
    ─────────────────────────────────────────────────────── */}
    {/* ─── Ariadne's Thread [AT-0263] ─────────────────────
      What: Founder card under hero-shot with Alex Ign avatar, handle, digest copy
      Why:  Landing must show the same intro block as the provided card, in site chrome
      Date: 2026-08-27
      Related: [AT-0264] public/css/site.css:.founder, [AT-0014] public/index.html
    ─────────────────────────────────────────────────────── */}
    <aside className="founder">
      {/* ─── Ariadne's Thread [AT-0266] ─────────────────────
        What: Use downloaded code.market newsletter-founder-avatar as /alex-ign.png
        Why:  Founder photo must be the original digest avatar, not a screenshot crop
        Date: 2026-08-27
        Related: [AT-0263] public/index.html, [AT-0265] public/js/releases.js
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0272] ─────────────────────
        What: Replace /alex-ign.png with the provided newsletter-founder-avatar file
        Why:  Founder img must use the attached original photo
        Date: 2026-08-27
        Related: [AT-0266] public/index.html, [AT-0263] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0461] ─────────────────────
        What: Swap /alex-ign.png to the sunglasses bandana founder photo
        Why:  Landing .founder img must show the attached avatar, cache-bust v=0461
        Date: 2026-09-03
        Related: [AT-0272] components/LandingMain.tsx:.founder img, [AT-0266] components/LandingMain.tsx:.founder img
      ─────────────────────────────────────────────────────── */}
      <img src="/alex-ign.png?v=0461" width="72" height="72" loading="lazy" decoding="async" {...landingShotAttrs("Alex Ign", imageMeta)} />
      <div className="founder-copy">
        {/* ─── Ariadne's Thread [AT-0543] ─────────────────────
          What: Drop the landing founder handle link
          Why:  .founder-head must keep Alex Ign only, without @aleksey_ignatov
          Date: 2026-09-05
          Related: [AT-0472] components/LandingMain.tsx:.founder-handle, [AT-0263] components/LandingMain.tsx:.founder
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0544] ─────────────────────
          What: Link landing .founder-name to the LinkedIn profile
          Why:  Click on Alex Ign must open the same URL as Contact Me
          Date: 2026-09-05
          Related: [AT-0543] components/LandingMain.tsx:.founder-head, [AT-0465] components/LandingMain.tsx:#pricing-corporate-contact
        ─────────────────────────────────────────────────────── */}
        <p className="founder-head">
          <a className="founder-name" href="https://www.linkedin.com/in/ignalex/">
            Alex Ign
          </a>
        </p>
        {/* ─── Ariadne's Thread [AT-0273] ─────────────────────
          What: Set founder body to serial indie hacker / new app screenshot copy
          Why:  Founder card must introduce SeenShot, not the code.market digest
          Date: 2026-08-27
          Related: [AT-0263] public/index.html, [AT-0265] public/js/releases.js
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0480] ─────────────────────
          What: Drop and after removing indiehacker from the founder body
          Why:  serial and solofounder kept a leftover and from the old two-role sentence
          Date: 2026-09-04
          Related: [AT-0479] components/LandingMain.tsx:.founder-copy, [AT-0413] components/LandingMain.tsx:.founder-copy
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0718] ─────────────────────
          What: Set founder body to Hey this Alex, and this is SeenShot
          Why:  Cabinet and homepage intro must name SeenShot, one-click agent shots, and sensitive data
          Date: 2026-10-02
          Related: [AT-0491] components/LandingMain.tsx:.founder-copy, [AT-0568] content/site-jsonld.ts:PERSON_DESCRIPTION
        ─────────────────────────────────────────────────────── */}
        <p>Hey this Alex, and this is SeenShot. This app helps send annotated screenshots to your agents in one click. Also it help protect sensitive data at your screenshots phones, emails, passwords, API keys.</p>
        {founderAgents ? (
          <>
            {/* ─── Ariadne's Thread [AT-0731] ─────────────────────
              What: Put LedeAgents under the empty-cabinet founder body
              Why:  Agent marks moved out of the cabinet brand lede. They sit under the intro paragraph
              Date: 2026-10-02
              Related: [AT-0722] components/SiteChrome.tsx:.brand .lede, [AT-0718] components/LandingMain.tsx:.founder-copy, [AT-0451] components/LedeAgents.tsx:LedeAgents
            ─────────────────────────────────────────────────────── */}
            <LedeAgents screenIt />
          </>
        ) : null}
      </div>
    </aside>
    {/* ─── Ariadne's Thread [AT-0459] ─────────────────────
      What: Preload none on .hero-shot sharing-demo-3.mp4
      Why:  Native video lazy: do not download the 3 MB file until autoplay in view
      Date: 2026-09-03
      Related: [AT-0458] components/LandingMain.tsx:.hero-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#preload
    ─────────────────────────────────────────────────────── */}
    <video
      className="hero-shot"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/hero.jpg"
      width={1264}
      height={720}
      aria-label={imageMeta ? imageMeta.title : "SeenShot"}
    >
      {/* ─── Ariadne's Thread [AT-0462] ─────────────────────
        What: Replace the landing hero source with sharing-demo-3.mp4
        Why:  Production must show the newly supplied sharing demo
        Date: 2026-09-03
        Related: [AT-0459] components/LandingMain.tsx:.hero-shot, lib/client/releases.ts:.hero-shot
      ─────────────────────────────────────────────────────── */}
      <source src="/sharing-demo-3.mp4" type="video/mp4" />
    </video>
    <h2>Features</h2>
    <div className="bento">
      {/* ─── Ariadne's Thread [AT-0452] ─────────────────────
        What: Put Show area for agent first, then Blur + Share
        Why:  Features must open with the agent highlight block, then the privacy/share row
        Date: 2026-09-03
        Related: [AT-0445] components/LandingMain.tsx:.bento-copy h3, [AT-0224] components/LandingMain.tsx:.bento
      ─────────────────────────────────────────────────────── */}
      <article className="bento-card full">
        <div className="bento-copy">
          {/* ─── Ariadne's Thread [AT-0445] ─────────────────────
            What: Set Square bento h3 to Show area for agent
            Why:  Features card must name the agent highlight use, not the Square tool
            Date: 2026-09-03
            Related: [AT-0443] components/LandingMain.tsx:.bento-card h3, [AT-0014] public/index.html
          ─────────────────────────────────────────────────────── */}
          <h3>Show area for agent</h3>
          {/* ─── Ariadne's Thread [AT-0446] ─────────────────────
            What: Set Square bento p to Highlight area for the agent what it should fix.
            Why:  Features copy must say the highlight is for the agent to fix, not a generic zone
            Date: 2026-09-03
            Related: [AT-0445] components/LandingMain.tsx:.bento-copy h3
          ─────────────────────────────────────────────────────── */}
          <p>Highlight area for the agent what it should fix.</p>
        </div>
        <div className="bento-shot-wrap">
          <img className="bento-shot" src="/bento/03-square.jpg" loading="lazy" decoding="async" {...landingShotAttrs("Square", imageMeta)} />
        </div>
      </article>
      <article className="bento-card wide">
        <div className="bento-shot-wrap">
          {/* ─── Ariadne's Thread [AT-0486] ─────────────────────
            What: Replace Blur bento source with auto-blur-demo-2.mp4
            Why:  Features Blur card must play the newly supplied auto-blur demo
            Date: 2026-09-04
            Related: [AT-0483] components/LandingMain.tsx:video.bento-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
          ─────────────────────────────────────────────────────── */}
          <video
            className="bento-shot"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/bento/05-blur.jpg"
            width={1134}
            height={720}
            aria-label={imageMeta ? imageMeta.title : "Blur"}
          >
            <source src="/auto-blur-demo-2.mp4" type="video/mp4" />
          </video>
        </div>
        {/* ─── Ariadne's Thread [AT-0484] ─────────────────────
          What: Set Blur bento h3 to Auto Blur Sensitive data
          Why:  Features card must name auto-blur, not the manual Blur tool alone
          Date: 2026-09-04
          Related: [AT-0483] components/LandingMain.tsx:video.bento-shot, [AT-0443] components/LandingMain.tsx:.bento-card h3
        ─────────────────────────────────────────────────────── */}
        <h3>Auto Blur Sensitive data</h3>
        {/* ─── Ariadne's Thread [AT-0631] ─────────────────────
          What: Set Blur bento p to Keep protect any sensitive data from AI Agents. Phones, faces, passwords, API keys. No need API keys, working offline
          Why:  Features copy must name AI Agents and offline blur without extra API keys
          Date: 2026-09-06
          Related: [AT-0485] components/LandingMain.tsx:.bento-card p, [AT-0484] components/LandingMain.tsx:.bento-card h3
        ─────────────────────────────────────────────────────── */}
        <p>Keep protect any sensitive data from AI Agents. Phones, faces, passwords, API keys. No need API keys, working offline</p>
      </article>
      {/* ─── Ariadne's Thread [AT-0224] ─────────────────────
        What: Place Share in the remaining column to the right of Blur
        Why:  Share sat after Background; Blur is wide so Share fills the third cell
        Date: 2026-08-27
        Related: [AT-0082] public/index.html, [AT-0014] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0232] ─────────────────────
        What: Put the Share bento shot at /bento/08-share.png
        Why:  The card src was 404; landing must show the Share Link screenshot
        Date: 2026-08-27
        Related: [AT-0224] public/index.html, [AT-0230] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0723] ─────────────────────
        What: Cache-bust Share bento src after replacing /bento/08-share.jpg
        Why:  The One-click Sharing shot with the agent share row must replace the old Share Link crop
        Date: 2026-10-02
        Related: [AT-0232] components/LandingMain.tsx:.bento-shot, public/bento/08-share.jpg
      ─────────────────────────────────────────────────────── */}
      <article className="bento-card narrow">
        <div className="bento-shot-wrap">
          <img className="bento-shot" src="/bento/08-share.jpg?v=0723" loading="lazy" decoding="async" {...landingShotAttrs("Share", imageMeta)} />
        </div>
        {/* ─── Ariadne's Thread [AT-0487] ─────────────────────
          What: Set Share bento h3 to One-click Share and p to Supports all AI Agents
          Why:  Features Share card must name one-click share and AI agent support
          Date: 2026-09-04
          Related: [AT-0224] components/LandingMain.tsx:.bento-card.narrow, [AT-0451] components/LedeAgents.tsx:LedeAgents
        ─────────────────────────────────────────────────────── */}
        <h3>One-click Share</h3>
        <p>Supports all AI Agents</p>
        {/* ─── Ariadne's Thread [AT-0488] ─────────────────────
          What: Put LedeAgents under Supports all AI Agents in the Share bento
          Why:  Features Share card must show the same Instant sharing marks as Free pricing
          Date: 2026-09-04
          Related: [AT-0487] components/LandingMain.tsx:.bento-card.narrow, [AT-0451] components/LedeAgents.tsx:LedeAgents
        ─────────────────────────────────────────────────────── */}
        <LedeAgents />
      </article>
      <article className="bento-card wide">
        <div className="bento-shot-wrap">
          <img className="bento-shot" src="/bento/01-photo.jpg" loading="lazy" decoding="async" {...landingShotAttrs("Photo", imageMeta)} />
        </div>
        {/* ─── Ariadne's Thread [AT-0490] ─────────────────────
          What: Set Photo bento h3 to add your selfie at screen shot
          Why:  Features card must name the selfie-on-screenshot use, not the Photo tool
          Date: 2026-09-04
          Related: [AT-0447] components/LandingMain.tsx:.bento-card h3, [AT-0488] components/LandingMain.tsx:.bento-card.narrow
        ─────────────────────────────────────────────────────── */}
        {/* ─── Ariadne's Thread [AT-0492] ─────────────────────
          What: Capitalize Photo bento h3 to Add your selfie at screen shot
          Why:  Features h3 uses sentence case like Show steps, not a leading lowercase
          Date: 2026-09-04
          Related: [AT-0490] components/LandingMain.tsx:.bento-card.wide h3, [AT-0447] components/LandingMain.tsx:.bento-card h3
        ─────────────────────────────────────────────────────── */}
        <h3>Add your selfie at screen shot</h3>
        <p>Add a webcam selfie on the screenshot in one click.</p>
      </article>
      <article className="bento-card narrow">
        <div className="bento-shot-wrap">
          <img className="bento-shot" src="/bento/02-steps.jpg" loading="lazy" decoding="async" {...landingShotAttrs("Steps", imageMeta)} />
        </div>
        {/* ─── Ariadne's Thread [AT-0447] ─────────────────────
          What: Set Steps bento h3 to Show steps
          Why:  Features card must name the numbered-order use, not the Steps tool
          Date: 2026-09-03
          Related: [AT-0445] components/LandingMain.tsx:.bento-copy h3
        ─────────────────────────────────────────────────────── */}
        <h3>Show steps</h3>
        {/* ─── Ariadne's Thread [AT-0448] ─────────────────────
          What: Set Steps bento p to Show the agent in what order to solve the task.
          Why:  Features copy must tell people to number the order for the agent
          Date: 2026-09-03
          Related: [AT-0447] components/LandingMain.tsx:.bento-card h3
        ─────────────────────────────────────────────────────── */}
        <p>Show the agent in what order to solve the task.</p>
      </article>
      {/* ─── Ariadne's Thread [AT-0081] ─────────────────────
        What: Drop the Text bento card
        Why:  Landing Features must not show that block
        Date: 2026-08-27
        Related: [AT-0014] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0230] ─────────────────────
        What: Put the Background bento shot at /bento/06-background.png
        Why:  The card src was 404; landing must show the editor background screenshot
        Date: 2026-08-27
        Related: [AT-0224] public/index.html, [AT-0014] public/index.html
      ─────────────────────────────────────────────────────── */}
      <article className="bento-card full">
        <div className="bento-copy">
          <h3>Background</h3>
          {/* ─── Ariadne's Thread [AT-0449] ─────────────────────
            What: Set Background bento p to Create a presentation from the screenshot and ask the agent to add it to your project.
            Why:  Features copy must say the background is for a slide the agent can add to the project
            Date: 2026-09-03
            Related: [AT-0448] components/LandingMain.tsx:.bento-card p, [AT-0230] components/LandingMain.tsx:.bento
          ─────────────────────────────────────────────────────── */}
          {/* ─── Ariadne's Thread [AT-0494] ─────────────────────
            What: Set Background bento p to Create sexy presentation from your screenshots.
            Why:  Features copy must name the sexy presentation use of the screenshot
            Date: 2026-09-04
            Related: [AT-0449] components/LandingMain.tsx:.bento-copy p, [AT-0493] components/LandingMain.tsx:.bento-shot
          ─────────────────────────────────────────────────────── */}
          <p>Create sexy presentation from your screenshots.</p>
        </div>
        <div className="bento-shot-wrap">
          {/* ─── Ariadne's Thread [AT-0493] ─────────────────────
            What: Swap Background bento shot to the presentation screenshot, cache-bust v=0493
            Why:  Features Background card must show the supplied Create a presentation from your screenshot frame
            Date: 2026-09-04
            Related: [AT-0230] components/LandingMain.tsx:.bento-shot, [AT-0461] components/LandingMain.tsx:.founder img
          ─────────────────────────────────────────────────────── */}
          <img className="bento-shot" src="/bento/06-background.jpg?v=0493" loading="lazy" decoding="async" {...landingShotAttrs("Background", imageMeta)} />
        </div>
      </article>
      {/* ─── Ariadne's Thread [AT-0082] ─────────────────────
        What: Drop the Color bento card
        Why:  Landing Features must not show that block
        Date: 2026-08-27
        Related: [AT-0081] public/index.html, [AT-0014] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0231] ─────────────────────
        What: Drop the Embed bento card
        Why:  Landing Features must not show that block
        Date: 2026-08-27
        Related: [AT-0082] public/index.html, [AT-0230] public/index.html
      ─────────────────────────────────────────────────────── */}
      {/* ─── Ariadne's Thread [AT-0083] ─────────────────────
        What: Drop the Arrow & Line bento card
        Why:  Landing Features must not show that block
        Date: 2026-08-27
        Related: [AT-0082] public/index.html, [AT-0014] public/index.html
      ─────────────────────────────────────────────────────── */}
    </div>
    {/* ─── Ariadne's Thread [AT-0475] ─────────────────────
      What: Add Indie Hackers Wall of Love between Features and Pricing
      Why:  Launch comments must sit on the landing with links to each IH reply
      Date: 2026-09-03
      Related: [AT-0474] content/wall-of-love.ts, [AT-0476] app/site.css:.wall-of-love
    ─────────────────────────────────────────────────────── */}
    <WallOfLove imageMeta={imageMeta} />
    {/* ─── Ariadne's Thread [AT-0587] ─────────────────────
      What: Render homepage Compare through LandingCompare
      Why:  Unique SSR landings must reuse the same matrix without a second Compare table
      Date: 2026-09-05
      Related: [AT-0586] components/LandingCompare.tsx:LandingCompare, [AT-0521] components/LandingMain.tsx:.compare-section
    ─────────────────────────────────────────────────────── */}
    {compare ? <LandingCompare /> : null}
    {/* ─── Ariadne's Thread [AT-0562] ─────────────────────
      What: Put landing Pricing cards back after Compare
      Why:  Homepage must show Free, Member, Lifetime, and Corporate as before the /pricing split
      Date: 2026-09-05
      Related: [AT-0550] app/(site)/pricing/page.tsx, [AT-0243] components/LandingMain.tsx:Pricing
    ─────────────────────────────────────────────────────── */}
    <h2 id="pricing">Pricing</h2>
    <PricingCards />
    {/* ─── Ariadne's Thread [AT-0565] ─────────────────────
      What: Put FAQ after landing Pricing
      Why:  Homepage must answer the selected product questions under the plan cards
      Date: 2026-09-05
      Related: [AT-0565] components/LandingFaq.tsx, [AT-0562] components/LandingMain.tsx:#pricing
    ─────────────────────────────────────────────────────── */}
    <LandingFaq emitJsonLd={jsonLd} />
  </Root>
    </>
  );
}
