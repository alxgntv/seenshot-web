import type { Metadata } from "next";
import { SitePage } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "SeenShot",
  robots: { index: false, follow: false },
};

export default async function OwnerShotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(`html: owner shot page shotId=${id} brandLogo=/SeenShot.png`);
  return (
    <SitePage>
      <main className="page share-page">
        <p id="status" className="meta">
          Loading…
        </p>
        {/* ─── Ariadne's Thread [AT-0459] ─────────────────────
          What: Lazy-load the owner #shot img
          Why:  Native loading=lazy on owner-shot media so first paint is not blocked by the PNG
          Date: 2026-09-03
          Related: [AT-0459] components/share/ShareView.tsx, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
        ─────────────────────────────────────────────────────── */}
        <img className="share-shot" id="shot" alt="Screenshot" hidden={true} loading="lazy" decoding="async" />
        <p className="share-actions">
          <button className="download" type="button" id="copy-link">
            Copy link
          </button>
          <a className="text-link" href="/space/">
            Back to space
          </a>
        </p>
      </main>
    </SitePage>
  );
}
