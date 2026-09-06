import { ShareBar, ShareFoot, ShareSocial } from "@/components/share/ShareChrome";
import type { SharePageOpts } from "@/lib/site";

// ─── Ariadne's Thread [AT-0425] ─────────────────────
// What: React share viewer for wait, unavailable, gone, and live PNG
// Why:  Replace src/html.ts HTML strings without changing share URLs or CSS rules
// Date: 2026-09-03
// Related: [AT-0004] src/html.ts:sharePage
// ─────────────────────────────────────────────────────

export function ShareGone() {
  console.log("html: share missing black gone page");
  return (
    <div className="share-gone">
      <p>This screenshot is gone. The link is expired, unpublished, or was removed.</p>
    </div>
  );
}

export function ShareUnavailable() {
  console.log("html: share unavailable");
  return (
    <div className="share-gone">
      <p>This screenshot is unavailable.</p>
    </div>
  );
}

export function ShareView(opts: SharePageOpts) {
  if (opts.unavailable) {
    console.log(`html: share unavailable publicId=${opts.publicId} pageUrl=${opts.pageUrl}`);
    return <ShareUnavailable />;
  }
  if (opts.missing && !opts.uploading) {
    console.log(`html: share missing publicId=${opts.publicId} black gone page`);
    return <ShareGone />;
  }
  if (opts.missing && opts.uploading) {
    console.log(
      `html: share uploading wait publicId=${opts.publicId} imageUrl=${opts.imageUrl} pageUrl=${opts.pageUrl}`,
    );
    return (
      <>
        <ShareBar />
        <div className="share-stage">
          <ShareSocial pageUrl={opts.pageUrl} />
          <div className="share-shot">
            <div id="upload-wait">
              <p>Uploading…</p>
              <progress id="upload-progress" max={100} value={0}></progress>
              <p id="upload-percent">0%</p>
            </div>
            {/* ─── Ariadne's Thread [AT-0459] ─────────────────────
              What: Lazy-load the wait-page #shot img
              Why:  Native loading=lazy on share media so first paint is not blocked by the PNG
              Date: 2026-09-03
              Related: [AT-0459] components/LandingMain.tsx:.hero-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
            ─────────────────────────────────────────────────────── */}
            <img id="shot" alt="Screenshot" hidden loading="lazy" decoding="async" />
          </div>
          <p id="status" hidden></p>
        </div>
        <ShareFoot abuseUrl={opts.abuseUrl} hidden downloadName={opts.publicId + ".png"} />
        <div
          id="share-boot"
          hidden
          data-image-url={opts.imageUrl}
          data-page-url={opts.pageUrl}
          data-public-id={opts.publicId}
          data-uploading="1"
        />
      </>
    );
  }
  console.log(
    `html: share page publicId=${opts.publicId} imageUrl=${opts.imageUrl} pageUrl=${opts.pageUrl} imgLoading=lazy decoding=async`,
  );
  return (
    <>
      <ShareBar />
      <div className="share-stage">
        <ShareSocial pageUrl={opts.pageUrl} />
        <div className="share-shot">
          {/* ─── Ariadne's Thread [AT-0459] ─────────────────────
            What: Lazy-load the live share screenshot PNG
            Why:  Native loading=lazy on share media so first paint is not blocked by the PNG
            Date: 2026-09-03
            Related: [AT-0459] components/share/ShareView.tsx, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
          ─────────────────────────────────────────────────────── */}
          <img src={opts.imageUrl} alt="Screenshot" loading="lazy" decoding="async" />
        </div>
      </div>
      <ShareFoot abuseUrl={opts.abuseUrl} hidden={false} downloadName={opts.publicId + ".png"} />
      <div
        id="share-boot"
        hidden
        data-image-url={opts.imageUrl}
        data-page-url={opts.pageUrl}
        data-public-id={opts.publicId}
        data-uploading="0"
      />
    </>
  );
}
