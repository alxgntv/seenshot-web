import type { Metadata } from "next"
import Script from "next/script"
import { headers } from "next/headers"
import { ClientBoot } from "@/components/ClientBoot"
import { LandingDocumentHead } from "@/components/LandingDocumentHead"
import { SignupModal } from "@/components/SignupModal"
import { SupportChat } from "@/components/SupportChat"
import { getLanding } from "@/content/landings/catalog"
import "./support-chat.css"
import "./signup-modal.css"

// ─── Ariadne's Thread [AT-0416] ─────────────────────
// What: Root layout without site.css so share pages can paint black
// Why:  Product chrome CSS lives in the (site) route group; share CSS is local
// Date: 2026-09-03
// Related: [AT-0425] app/share.css, [AT-0430] components/ClientBoot.tsx
// ─────────────────────────────────────────────────────

export const metadata: Metadata = {
  icons: { icon: [{ url: "/favicon.png", sizes: "64x64", type: "image/png" }] },
}

const DEFAULT_TITLE = "SeenShot - Seen it? Shot it! Send It"
const DEFAULT_DESCRIPTION = "Hit cmd+shift+2, annotate, insert in to your agent. Free screenshot app for macOS."
const DEFAULT_URL = "https://seenshot.app/"
const DEFAULT_IMAGE = "https://seenshot.app/og.jpg"

// ─── Ariadne's Thread [AT-0612] ─────────────────────
// What: Load the D1 landing for the current one-segment path before closing head
// Why:  Title and canonical must be written inside the layout head, not streamed into the body
// Date: 2026-09-05
// Related: [AT-0611] components/LandingDocumentHead.tsx, [AT-0613] middleware.ts:x-seenshot-pathname, [AT-0601] content/landings/catalog.ts:getLanding
// ─────────────────────────────────────────────────────
async function loadLandingForHead(pathname: string) {
  console.log("SeenShot site: loadLandingForHead pathname=" + pathname)
  if (!pathname || pathname === "/") {
    console.log("SeenShot site: loadLandingForHead skip home")
    return undefined
  }
  const trimmed = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
  const parts = trimmed.split("/").filter(function (part) {
    return part.length > 0
  })
  if (parts.length !== 1) {
    console.log("SeenShot site: loadLandingForHead skip parts=" + parts.length)
    return undefined
  }
  const landing = await getLanding(parts[0])
  console.log(
    "SeenShot site: loadLandingForHead slug=" + parts[0] +
      " found=" + Boolean(landing)
  )
  return landing
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const pathname = headerList.get("x-seenshot-pathname") || "/"
  const landing = await loadLandingForHead(pathname)
  const isHome = pathname === "/"
  const trimmedPath =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
  const showSignupModal =
    trimmedPath !== "/signin" &&
    trimmedPath !== "/signup" &&
    trimmedPath !== "/oauth/authorize"
  console.log(
    "SeenShot site: RootLayout pathname=" + pathname +
      " landing=" + (landing ? landing.slug : "none") +
      " home=" + isHome +
      " signupModal=" + String(showSignupModal)
  )
  return (
    <html lang="en">
      <head>
        {landing ? (
          <LandingDocumentHead landing={landing} />
        ) : isHome ? (
          <>
            <title>{DEFAULT_TITLE}</title>
            <meta name="description" content={DEFAULT_DESCRIPTION} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={DEFAULT_URL} />
            <meta property="og:title" content={DEFAULT_TITLE} />
            <meta property="og:description" content={DEFAULT_DESCRIPTION} />
            <meta property="og:image" content={DEFAULT_IMAGE} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={DEFAULT_TITLE} />
            <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
            <meta name="twitter:image" content={DEFAULT_IMAGE} />
          </>
        ) : null}
        <Script id="share-theme-boot" strategy="beforeInteractive">
          {`(function () {
  try {
    var stored = localStorage.getItem("seenshot-share-theme");
    console.log("SeenShot share-theme: boot stored=" + stored);
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (error) {
    console.warn("SeenShot share-theme: boot storage failed", error);
  }
})();`}
        </Script>
      </head>
      <body>
        <ClientBoot />
        {/* ─── Ariadne's Thread [AT-0563] ─────────────────────
          What: Mount SupportChat on every page
          Why:  Open chat must stay after PostHog Conversations is disabled
          Date: 2026-09-05
          Related: [AT-0563] components/SupportChat.tsx, [AT-0430] components/ClientBoot.tsx
        ─────────────────────────────────────────────────────── */}
        {children}
        {/* ─── Ariadne's Thread [AT-0680] ─────────────────────
          What: Mount #signup-modal on every page except Sign In, Create account, and OAuth
          Why:  Public Download opens Create account in a dialog. Those auth URLs already render SignInForm
          Date: 2026-10-02
          Related: [AT-0680] components/SignupModal.tsx, [AT-0681] lib/client/signup-modal.ts:startSignupModal
        ─────────────────────────────────────────────────────── */}
        {showSignupModal ? <SignupModal /> : null}
        <SupportChat />
      </body>
    </html>
  )
}
