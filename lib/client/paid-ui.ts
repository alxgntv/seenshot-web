// @ts-nocheck

// ─── Ariadne's Thread [AT-0687] ─────────────────────
// What: Show cabinet Download only after a paid plan, and keep Pay plus AppSumo for free accounts
// Why:  App DMG is no longer free after sign-up. Member comes from card checkout or an AppSumo code
// Date: 2026-10-02
// Related: [AT-0688] lib/site.ts:serveLatestMacDmg, [AT-0283] lib/client/nav.ts:paint, [AT-0689] components/SpaceMain.tsx
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
  const latestDownload = document.getElementById("latest-download")
  const latestWrap = latestDownload && latestDownload.closest ? latestDownload.closest(".download-wrap") : null
  const upgrade = document.getElementById("upgrade-pro")
  const appsumo = document.getElementById("buy-appsumo")
  const redeemLink = document.getElementById("redeem-promocode")
  const path = location.pathname.replace(/\/+$/, "") || "/"
  const onSpace = path === "/space" || path === "/space/redem"
  const showBuy = planKnown && !paid
  const showDownload = planKnown && paid
  if (cabinetDownload) {
    cabinetDownload.hidden = !showDownload || emptyVisible
  }
  if (onSpace && latestDownload) {
    latestDownload.hidden = !showDownload
  }
  if (onSpace && latestWrap) {
    latestWrap.hidden = !showDownload
  }
  if (upgrade) {
    upgrade.hidden = !showBuy
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
      " emptyVisible=" + emptyVisible +
      " onSpace=" + onSpace +
      " cabinetHidden=" + (cabinetDownload ? String(cabinetDownload.hidden) : "missing") +
      " latestHidden=" + (latestDownload ? String(latestDownload.hidden) : "missing") +
      " upgradeHidden=" + (upgrade ? String(upgrade.hidden) : "missing") +
      " appsumoHidden=" + (appsumo ? String(appsumo.hidden) : "missing") +
      " redeemHidden=" + (redeemLink ? String(redeemLink.hidden) : "missing")
  )
}
