// @ts-nocheck

// ─── Ariadne's Thread [AT-0709] ─────────────────────
// What: Keep cabinet Download visible for free and paid, and send free clicks to Member Stripe
// Why:  Empty /space hid the DMG pill. Logged-in free accounts must still see Download next to AppSumo
// Date: 2026-10-02
// Related: [AT-0687] lib/client/paid-ui.ts:paintPaidCabinet, [AT-0710] lib/client/cabinet.ts:startCheckout, [AT-0707] components/SpaceMain.tsx:.cabinet-head
// ─────────────────────────────────────────────────────

let cachedPlan = "free"
let cachedGraceEndsAt = null
let planKnown = false

export function planIsPaid(plan, graceEndsAt) {
  if (plan === "pro") {
    return true
  }
  const graceMs = Number(graceEndsAt)
  const graceActive = plan === "grace" && Number.isFinite(graceMs) && graceMs > Date.now()
  return graceActive
}

export function paintPaidCabinet(plan, graceEndsAt) {
  if (typeof plan === "string" && plan) {
    cachedPlan = plan
    cachedGraceEndsAt = graceEndsAt
    planKnown = true
  }
  const paid = planIsPaid(cachedPlan, cachedGraceEndsAt)
  const emptyWrap = document.getElementById("empty-wrap")
  const emptyVisible = Boolean(emptyWrap && !emptyWrap.hidden)
  const cabinetDownload = document.getElementById("cabinet-download")
  const founderDownload = document.getElementById("founder-download")
  const cabinetLinks = [cabinetDownload, founderDownload]
  const latestDownload = document.getElementById("latest-download")
  const latestWrap = latestDownload && latestDownload.closest ? latestDownload.closest(".download-wrap") : null
  const upgrade = document.getElementById("upgrade-pro")
  const appsumo = document.getElementById("buy-appsumo")
  const redeemLink = document.getElementById("redeem-promocode")
  const heroCta = emptyWrap ? emptyWrap.querySelector(".hero-cta") : null
  const path = location.pathname.replace(/\/+$/, "") || "/"
  const onSpace = path === "/space" || path === "/space/redem"
  const showBuy = planKnown && !paid
  const showDownload = planKnown
  // ─── Ariadne's Thread [AT-0736] ─────────────────────
  // What: Paint #cabinet-download and #founder-download with the same checkout flag
  // Why:  Empty-cabinet founder pill is a copy of the head Download. Unpaid clicks still open Stripe
  // Date: 2026-10-02
  // Related: [AT-0735] components/LandingMain.tsx:#founder-download, [AT-0709] lib/client/paid-ui.ts:paintPaidCabinet
  // ─────────────────────────────────────────────────────
  cabinetLinks.forEach(function (link) {
    if (!link) {
      return
    }
    const wrap = link.closest ? link.closest(".download-wrap") : null
    link.hidden = !showDownload
    if (showBuy) {
      link.setAttribute("data-checkout", "member")
    } else {
      link.removeAttribute("data-checkout")
    }
    if (wrap) {
      wrap.hidden = !showDownload
    }
    console.log(
      "SeenShot paid-ui: download id=" + (link.id || "") +
        " hidden=" + String(link.hidden) +
        " wrapHidden=" + (wrap ? String(wrap.hidden) : "missing") +
        " checkout=" + (link.getAttribute("data-checkout") || "") +
        " href=" + (link.getAttribute("href") || "")
    )
  })
  if (onSpace && latestDownload) {
    latestDownload.hidden = true
  }
  if (onSpace && latestWrap) {
    latestWrap.hidden = true
  }
  if (upgrade) {
    upgrade.hidden = true
  }
  if (appsumo) {
    appsumo.hidden = !showBuy
  }
  if (redeemLink) {
    redeemLink.hidden = !showBuy
  }
  console.log(
    "SeenShot paid-ui: plan=" + cachedPlan +
      " planKnown=" + planKnown +
      " paid=" + paid +
      " showBuy=" + showBuy +
      " showDownload=" + showDownload +
      " checkout=" + (cabinetDownload ? (cabinetDownload.getAttribute("data-checkout") || "") : "missing") +
      " founderCheckout=" + (founderDownload ? (founderDownload.getAttribute("data-checkout") || "") : "missing") +
      " emptyVisible=" + emptyVisible +
      " onSpace=" + onSpace +
      " cabinetHidden=" + (cabinetDownload ? String(cabinetDownload.hidden) : "missing") +
      " founderHidden=" + (founderDownload ? String(founderDownload.hidden) : "missing") +
      " latestHidden=" + (latestDownload ? String(latestDownload.hidden) : "missing") +
      " upgradeHidden=" + (upgrade ? String(upgrade.hidden) : "missing") +
      " appsumoHidden=" + (appsumo ? String(appsumo.hidden) : "missing") +
      " redeemHidden=" + (redeemLink ? String(redeemLink.hidden) : "missing") +
      " heroCtaDisplay=" + (heroCta ? getComputedStyle(heroCta).display : "missing")
  )
}
