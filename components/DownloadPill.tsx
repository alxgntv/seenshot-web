// ─── Ariadne's Thread [AT-0423] ─────────────────────
// What: Shared Download Free for macOS Apple pill
// Why:  Landing, pricing, cabinet empty card, and share header use the same GitHub CTA
// Date: 2026-09-03
// Related: [AT-0397] public/index.html:#latest-download
// ─────────────────────────────────────────────────────

export const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

// ─── Ariadne's Thread [AT-0517] ─────────────────────
// What: Default Download pill href is /download/arm64
// Why:  Same-origin latest-release DMG, not github.com/releases
// Date: 2026-09-05
// Related: [AT-0515] backend→lib/site.ts:redirectLatestMacDmg, [AT-0423] components/DownloadPill.tsx
// ─────────────────────────────────────────────────────
const DEFAULT_DOWNLOAD_LABEL = "Download Free for macOS";

// ─── Ariadne's Thread [AT-0592] ─────────────────────
// What: Allow DownloadPill to keep a custom label via data-label
// Why:  Unique SSR landings may set hero.ctaLabel without the GitHub latest-download painter overwriting it
// Date: 2026-09-05
// Related: [AT-0423] components/DownloadPill.tsx:DownloadPill, [AT-0377] lib/client/releases.ts:latestDownloadLabel, [AT-0589] components/LandingPageMain.tsx
// ─────────────────────────────────────────────────────
export function DownloadPill({
  id,
  href = "/download/arm64",
  label = DEFAULT_DOWNLOAD_LABEL,
  hidden = false,
}: {
  id: string;
  href?: string;
  label?: string;
  hidden?: boolean
}) {
  const customLabel = label !== DEFAULT_DOWNLOAD_LABEL ? label : undefined;
  console.log(
    "SeenShot site: DownloadPill id=" + id +
      " href=" + href +
      " label=" + label +
      " dataLabel=" + (customLabel || "") +
      " hidden=" + String(hidden)
  );
  return (
    <a id={id} className="download" href={href} data-label={customLabel} hidden={hidden}>
      <svg
        className="download-apple"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        width="18"
        height="18"
      >
        <path d={APPLE_PATH}></path>
      </svg>
      <span className="download-label">{label}</span>
    </a>
  );
}

// ─── Ariadne's Thread [AT-0627] ─────────────────────
// What: Let DownloadWrap lock a custom .download-arch via data-arch
// Why:  Unique landings show macOS 14 or later and must not be overwritten by chip detect
// Date: 2026-09-06
// Related: [AT-0627] lib/client/releases.ts:paintDownloadArch, [AT-0423] components/DownloadPill.tsx:DownloadPill
// ─────────────────────────────────────────────────────
export function DownloadWrap({
  id,
  href,
  label,
  arch = "Apple Silicon (arm64)",
  hidden = false,
}: {
  id: string
  href?: string
  label?: string
  arch?: string
  hidden?: boolean
}) {
  const showArch = Boolean(arch)
  const archLocked = showArch && arch !== "Apple Silicon (arm64)"
  console.log(
    "SeenShot site: DownloadWrap id=" + id +
      " href=" + (href || "") +
      " label=" + (label || "") +
      " arch=" + arch +
      " showArch=" + String(showArch) +
      " archLocked=" + archLocked +
      " hidden=" + String(hidden)
  )
  return (
    <div className="download-wrap" hidden={hidden}>
      <DownloadPill id={id} href={href} label={label} hidden={hidden} />
      {showArch ? (
        <p className="download-arch" data-arch={archLocked ? arch : undefined}>
          {arch}
        </p>
      ) : null}
    </div>
  )
}
