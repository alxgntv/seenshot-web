// @ts-nocheck
import { SeenShotAuth } from "./auth"
import { setSigninMode, startSignin } from "./signin"

// ─── Ariadne's Thread [AT-0681] ─────────────────────
// What: Open Create account modal from public Download instead of starting the DMG
// Why:  App download is only from /space after registration. Unsigned CTA must not hit /download
// Date: 2026-10-02
// Related: [AT-0680] components/SignupModal.tsx, [AT-0682] lib/client/signin.ts:startSignin, [AT-0679] lib/site.ts:serveLatestMacDmg
// ─────────────────────────────────────────────────────

let started = false
let signinReady = false
let ignoreBackdrop = false

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

function isCabinetPath(pathname) {
  const path = normalizePath(pathname || "")
  return path === "/space" || path === "/space/redem"
}

function hrefLooksLikeAppDmg(href, absolute) {
  const raw = String(href || "")
  const abs = String(absolute || "")
  if (raw === "/download" || raw.indexOf("/download/") === 0) {
    return true
  }
  if (abs.indexOf("/download/arm64") !== -1 || abs.indexOf("/download/x86_64") !== -1) {
    return true
  }
  if (abs.indexOf("/download") !== -1 && abs.indexOf("/releases/download/") === -1) {
    try {
      const parsed = new URL(abs, location.origin)
      const path = normalizePath(parsed.pathname)
      if (path === "/download" || path === "/download/arm64" || path === "/download/x86_64") {
        return true
      }
    } catch (error) {
      console.warn("SeenShot signup-modal: href parse failed", error)
    }
  }
  if (abs.indexOf("github.com/alxgntv/seenshot/releases/download/") !== -1) {
    return true
  }
  return false
}

function isPublicAppDownloadLink(node) {
  if (!node || typeof node.closest !== "function") {
    return null
  }
  const link = node.closest("a")
  if (!link) {
    return null
  }
  if (link.closest("#signup-modal")) {
    console.log("SeenShot signup-modal: skip link inside modal id=" + (link.id || ""))
    return null
  }
  if (link.classList.contains("share-download")) {
    console.log("SeenShot signup-modal: skip share PNG download")
    return null
  }
  if (link.id === "upgrade-pro" || link.id === "redeem-promocode" || link.id === "buy-appsumo") {
    // ─── Ariadne's Thread [AT-0692] ─────────────────────
    // What: Do not intercept Pay with card, Redeem, or Buy on AppSumo as app downloads
    // Why:  Those cabinet links buy or grant Member. They must not open Create account
    // Date: 2026-10-02
    // Related: [AT-0689] components/SpaceMain.tsx:#buy-appsumo, [AT-0681] lib/client/signup-modal.ts:isPublicAppDownloadLink
    // ─────────────────────────────────────────────────────
    console.log("SeenShot signup-modal: skip billing id=" + link.id)
    return null
  }
  if (isCabinetPath(location.pathname)) {
    console.log(
      "SeenShot signup-modal: skip cabinet path=" + location.pathname +
        " id=" + (link.id || "") +
        " href=" + (link.getAttribute("href") || "")
    )
    return null
  }
  const href = link.getAttribute("href") || ""
  const absolute = link.href || ""
  const knownId =
    link.id === "nav-download" ||
    link.id === "latest-download" ||
    link.id === "pricing-download"
  const dmg = hrefLooksLikeAppDmg(href, absolute)
  console.log(
    "SeenShot signup-modal: inspect id=" + (link.id || "") +
      " href=" + href +
      " knownId=" + knownId +
      " dmg=" + dmg +
      " path=" + location.pathname
  )
  if (knownId || dmg) {
    return link
  }
  return null
}

function signupDialog() {
  const el = document.getElementById("signup-modal")
  if (el instanceof HTMLDialogElement) {
    return el
  }
  return null
}

async function ensureSigninBound() {
  if (signinReady) {
    console.log("SeenShot signup-modal: signin already bound")
    setSigninMode("create")
    return
  }
  console.log("SeenShot signup-modal: bind startSignin modal=true mode=create")
  startSignin({ modal: true, skipResume: true, mode: "create" })
  signinReady = true
}

export async function openSignupModal() {
  const dialog = signupDialog()
  if (!dialog) {
    console.error("SeenShot signup-modal: missing #signup-modal, go /signup")
    location.href = "/signup?next=" + encodeURIComponent("/space/")
    return
  }
  const session = SeenShotAuth.readSession()
  console.log(
    "SeenShot signup-modal: open hasRefresh=" + Boolean(session.refreshToken) +
      " uid=" + (session.uid || "") +
      " dialogOpen=" + String(dialog.open)
  )
  if (session.refreshToken) {
    try {
      await SeenShotAuth.ensureIdToken()
      console.log("SeenShot signup-modal: already signed in, go /space/")
      location.href = "/space/"
      return
    } catch (error) {
      console.warn("SeenShot signup-modal: session failed, show create", error)
    }
  }
  await ensureSigninBound()
  ignoreBackdrop = true
  if (!dialog.open) {
    dialog.showModal()
  }
  console.log("SeenShot signup-modal: dialog open=" + String(dialog.open))
  window.setTimeout(function () {
    ignoreBackdrop = false
  }, 300)
}

export function closeSignupModal() {
  const dialog = signupDialog()
  if (!dialog) {
    console.warn("SeenShot signup-modal: close skipped, missing dialog")
    return
  }
  if (dialog.open) {
    dialog.close()
  }
  console.log("SeenShot signup-modal: dialog closed open=" + String(dialog.open))
}

export function startSignupModal() {
  if (started) {
    console.warn("SeenShot signup-modal: start ignored, already started")
    return
  }
  started = true
  const dialog = signupDialog()
  const closeBtn = document.getElementById("signup-modal-close")
  console.log(
    "SeenShot signup-modal: start path=" + location.pathname +
      " dialog=" + Boolean(dialog) +
      " close=" + Boolean(closeBtn)
  )
  if (!dialog) {
    console.error("SeenShot signup-modal: #signup-modal missing")
    return
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      console.log("SeenShot signup-modal: close click")
      closeSignupModal()
    })
  } else {
    console.warn("SeenShot signup-modal: missing #signup-modal-close")
  }
  dialog.addEventListener("click", function (event) {
    if (ignoreBackdrop) {
      console.log("SeenShot signup-modal: backdrop click ignored after open")
      return
    }
    if (event.target !== dialog) {
      return
    }
    closeSignupModal()
    console.log("SeenShot signup-modal: closed via backdrop")
  })
  dialog.addEventListener("close", function () {
    console.log("SeenShot signup-modal: native close open=" + String(dialog.open))
  })
  document.addEventListener(
    "click",
    function (event) {
      const link = isPublicAppDownloadLink(event.target)
      if (!link) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) {
        console.log(
          "SeenShot signup-modal: native modifiers id=" + (link.id || "") +
            " href=" + (link.getAttribute("href") || "") +
            " button=" + event.button
        )
        return
      }
      event.preventDefault()
      console.log(
        "SeenShot signup-modal: intercept id=" + (link.id || "") +
          " href=" + (link.getAttribute("href") || "") +
          " path=" + location.pathname
      )
      openSignupModal().catch(function (error) {
        console.error("SeenShot signup-modal: open failed", error)
        location.href = "/signup?next=" + encodeURIComponent("/space/")
      })
    },
    true
  )
  console.log("SeenShot signup-modal: bound capture=true")
}
