import type { Metadata } from "next"
import { SitePage } from "@/components/SiteChrome"
import { APPLE_PATH } from "@/components/DownloadPill"

export const metadata: Metadata = {
  title: "Releases - SeenShot",
  description: "SeenShot for MacOS release history and downloads.",
}

type PageProps = {
  searchParams: Promise<{ arch?: string }>
}

// ─── Ariadne's Thread [AT-0616] ─────────────────────
// What: Put the existing Apple mark on each Releases arch tab
// Why:  arm64 and x86 tabs must show they are Mac downloads
// Date: 2026-09-05
// Related: [AT-0423] components/DownloadPill.tsx:APPLE_PATH, [AT-0481] app/(site)/releases/page.tsx
// ─────────────────────────────────────────────────────
function ReleasesMacMark() {
  console.log("SeenShot site: ReleasesMacMark")
  return (
    <svg
      className="releases-arch-apple"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="currentColor"
      width={14}
      height={14}
    >
      <path d={APPLE_PATH}></path>
    </svg>
  )
}

export default async function ReleasesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const arch = sp.arch === "x86" ? "x86" : "arm"
  const armSelected = arch === "arm"
  console.log("SeenShot site: ReleasesPage arch=" + arch)
  return (
    <SitePage>
      <main className="legal-page">
        <article className="legal card">
          {/* ─── Ariadne's Thread [AT-0481] ─────────────────────
            What: Put arm64 / x86 tabs to the right of the Releases h1
            Why:  /releases/ must switch which GitHub DMG list is shown
            Date: 2026-09-04
            Related: [AT-0357] lib/client/releases.ts:render, https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tab_role
          ─────────────────────────────────────────────────────── */}
          {/* ─── Ariadne's Thread [AT-0482] ─────────────────────
            What: Give Releases arch tabs their own /releases/?arch= URLs
            Why:  arm64 and x86 must be shareable links, not buttons with no href
            Date: 2026-09-04
            Related: [AT-0481] app/(site)/releases/page.tsx, https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
          ─────────────────────────────────────────────────────── */}
          <div className="releases-head">
            <h1>Releases</h1>
            <div className="releases-arch" role="tablist" aria-label="Chip architecture">
              <a
                href="/releases/?arch=arm64"
                role="tab"
                id="releases-arch-arm"
                data-arch="arm"
                aria-selected={armSelected ? "true" : "false"}
                aria-controls="releases"
                tabIndex={armSelected ? 0 : -1}
              >
                <ReleasesMacMark />
                arm64
              </a>
              <a
                href="/releases/?arch=x86"
                role="tab"
                id="releases-arch-x86"
                data-arch="x86"
                aria-selected={armSelected ? "false" : "true"}
                aria-controls="releases"
                tabIndex={armSelected ? -1 : 0}
              >
                <ReleasesMacMark />
                x86
              </a>
            </div>
          </div>
          <div
            id="releases"
            role="tabpanel"
            aria-labelledby={armSelected ? "releases-arch-arm" : "releases-arch-x86"}
          ></div>
        </article>
      </main>
    </SitePage>
  )
}
