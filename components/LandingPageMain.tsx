import { DownloadWrap } from "./DownloadPill";
import { JsonLdScript } from "./JsonLdScript";
import { LandingCompare } from "./LandingCompare";
import { LandingFaq } from "./LandingFaq";
import { PricingCards } from "./PricingCards";
import { WallOfLove } from "./WallOfLove";
import type { Landing, LandingMedia } from "@/content/landings/types";
import { landingPageJsonLd } from "@/content/site-jsonld";

// ─── Ariadne's Thread [AT-0589] ─────────────────────
// What: Render a unique SSR landing from one Landing record
// Why:  New /{slug}/ pages must reuse homepage CSS, Compare, Pricing, and FAQ without copying LandingMain
// Date: 2026-09-05
// Related: [AT-0582] content/landings/types.ts:Landing, [AT-0586] components/LandingCompare.tsx, [AT-0585] components/LandingFaq.tsx, [AT-0424] app/(site)/page.tsx
// ─────────────────────────────────────────────────────

function LandingMediaView({
  media,
  className,
}: {
  media: LandingMedia;
  className: string;
}) {
  console.log(
    "SeenShot site: LandingMediaView kind=" + media.kind +
      " src=" + media.src +
      " srcChars=" + media.src.length +
      " className=" + className +
      " poster=" + (media.poster || "") +
      " alt=" + media.alt
  )
  if (!media.src) {
    // ─── Ariadne's Thread [AT-0626] ─────────────────────
    // What: Skip hero and bento media when src is empty
    // Why:  Feature landings store title and slug only. Empty hero_media_src must not paint video.hero-shot
    // Date: 2026-09-06
    // Related: [AT-0624] backend→migrations/0007_feature_landings.sql, [AT-0589] components/LandingPageMain.tsx:LandingMediaView
    // ─────────────────────────────────────────────────────
    console.log("SeenShot site: LandingMediaView skip empty src className=" + className)
    return null
  }
  if (media.kind === "video") {
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
      >
        <source src={media.src} type="video/mp4" />
      </video>
    )
  }
  return (
    <img
      className={className}
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      loading="lazy"
      decoding="async"
    />
  )
}

export function LandingPageMain({ landing }: { landing: Landing }) {
  const jsonLd = landingPageJsonLd(landing)
  const ctaLabel = landing.hero.ctaLabel || "Download"
  const showHeroShot = Boolean(landing.hero.media.src)
  console.log(
    "SeenShot site: LandingPageMain slug=" + landing.slug +
      " h1=" + landing.hero.h1 +
      " h1Chars=" + landing.hero.h1.length +
      " landingH1=true" +
      " heroSrc=" + landing.hero.media.src +
      " showHeroShot=" + showHeroShot +
      " ctaLabel=" + ctaLabel +
      " features=" + landing.features.length +
      " faq=" + landing.faq.length +
      " showDownload=" + Boolean(landing.showDownload) +
      " showFounder=" + Boolean(landing.showFounder) +
      " showWallOfLove=" + Boolean(landing.showWallOfLove) +
      " hasCompare=" + Boolean(landing.compare) +
      " hasPricing=" + Boolean(landing.pricing)
  )
  return (
    <>
      <JsonLdScript id="app-jsonld" data={jsonLd} />
      <main className="landing">
        <section className="hero">
          {/* ─── Ariadne's Thread [AT-0625] ─────────────────────
            What: Mark unique-landing hero h1 so long titles wrap
            Why:  Homepage .hero h1 is nowrap. Feature titles overflow the 720px column
            Date: 2026-09-06
            Related: [AT-0625] app/site.css:.hero h1.landing-h1, [AT-0589] components/LandingPageMain.tsx
          ─────────────────────────────────────────────────────── */}
          <h1 className="landing-h1">{landing.hero.h1}</h1>
          <p className="lede">
            <span className="lede-copy">{landing.hero.description}</span>
          </p>
          {landing.showDownload ? (
            <div className="hero-cta">
              {/* ─── Ariadne's Thread [AT-0627] ─────────────────────
                What: Unique-landing CTA is Apple Download plus macOS 14 or later
                Why:  Hero must not show Download Free for macOS or Apple Silicon (arm64)
                Date: 2026-09-06
                Related: [AT-0627] components/DownloadPill.tsx:DownloadWrap, [AT-0589] components/LandingPageMain.tsx
              ─────────────────────────────────────────────────────── */}
              <DownloadWrap id="latest-download" label={ctaLabel} arch="macOS 14 or later" />
            </div>
          ) : null}
        </section>
        <LandingMediaView media={landing.hero.media} className="hero-shot" />
        {landing.showFounder ? (
          <aside className="founder">
            <img src="/alex-ign.png?v=0461" alt="Alex Ign" width="72" height="72" loading="lazy" decoding="async" />
            <div className="founder-copy">
              <p className="founder-head">
                <a className="founder-name" href="https://www.linkedin.com/in/ignalex/">
                  Alex Ign
                </a>
              </p>
              <p>
                Hey, this Alex im serial solofounder. I built this app because im sending feedback to my AI agents many times a day, and I've found they make much better edits when I provide comments and annotations on the screenshot. This app also helps me protect sensitive data phones, emails, passwords, API keys, and even faces from being sent to AI agents.
              </p>
            </div>
          </aside>
        ) : null}
        {landing.features.length > 0 ? (
          <>
            <h2>Features</h2>
            <div className="bento">
              {landing.features.map(function (feature, index) {
                console.log(
                  "SeenShot site: LandingPageMain feature[" + index + "] title=" + feature.title +
                    " layout=" + feature.layout +
                    " media=" + feature.media.src
                );
                const isFull = feature.layout === "full";
                return (
                  <article
                    key={feature.title + "-" + index}
                    className={"bento-card " + feature.layout}
                  >
                    {isFull ? (
                      <div className="bento-copy">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    ) : null}
                    <div className="bento-shot-wrap">
                      <LandingMediaView media={feature.media} className="bento-shot" />
                    </div>
                    {isFull ? null : (
                      <>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
        {landing.showWallOfLove ? <WallOfLove /> : null}
        {landing.compare ? (
          <LandingCompare
            heading={landing.compare.heading}
            productIds={landing.compare.productIds}
            featureKeys={landing.compare.featureKeys}
          />
        ) : null}
        {landing.pricing ? (
          <>
            <h2 id="pricing">{landing.pricing.heading}</h2>
            <PricingCards checkout={landing.pricing.checkout} />
          </>
        ) : null}
        {landing.faq.length > 0 ? (
          <LandingFaq items={landing.faq} pageUrl={landing.seo.canonical} />
        ) : null}
      </main>
    </>
  );
}
