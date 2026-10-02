// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
import { paintPaidCabinet, planIsPaid } from "./paid-ui";
/* ─── Ariadne's Thread [AT-0009] ─────────────────────
   What: Top nav Sign In / email / Sign Out from the Firebase session
   Why:  Landing, cabinet, and shot pages share one header
   Date: 2026-08-26
   Related: [AT-0008] auth.js
─────────────────────────────────────────────────────── */

let started = false;

function bindPricingHash() {
  if (document.documentElement.getAttribute("data-seenshot-pricing-hash") === "1") {
    console.log("SeenShot nav: pricing hash already bound")
    return
  }
  document.documentElement.setAttribute("data-seenshot-pricing-hash", "1")
  // ─── Ariadne's Thread [AT-0632] ─────────────────────
  // What: Delegate #nav-pricing clicks to homepage #pricing via location.hash
  // Why:  Header Pricing must stay a /#pricing hash. Client routing and replaced nodes swallow the native hash click
  // Date: 2026-09-06
  // Related: [AT-0632] components/SiteChrome.tsx:#nav-pricing, vinext→hash-scroll.js:scrollToHashTarget, https://developer.mozilla.org/en-US/docs/Web/API/Element/closest, https://developer.mozilla.org/en-US/docs/Web/API/Location/hash, https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  // ─────────────────────────────────────────────────────
  document.addEventListener("click", function (event) {
    const pricing = event.target && event.target.closest ? event.target.closest("#nav-pricing") : null
    if (!pricing) {
      return
    }
    const target = document.getElementById("pricing")
    const href = pricing.getAttribute("href") || ""
    const homeHash = href === "#pricing" || href === "/#pricing"
    const onHome = location.pathname === "/"
    console.log(
      "SeenShot nav: pricing click href=" + href +
        " path=" + location.pathname +
        " hash=" + location.hash +
        " isHomeHash=" + homeHash +
        " onHome=" + onHome +
        " targetPresent=" + Boolean(target) +
        " targetTop=" + (target ? Math.round(target.getBoundingClientRect().top) : -1)
    )
    if (!homeHash || !onHome || !target) {
      return
    }
    event.preventDefault()
    if (location.hash !== "#pricing") {
      location.hash = "pricing"
    }
    target.scrollIntoView({ behavior: "auto" })
    const box = target.getBoundingClientRect()
    console.log(
      "SeenShot nav: pricing hash scrolled top=" + Math.round(box.top) +
        " hash=" + location.hash +
        " scrollY=" + Math.round(window.scrollY)
    )
  }, true)
  console.log("SeenShot nav: pricing hash bound capture=true href=/#pricing")
}

export function startNav() {
  bindPricingHash()
  if (started) {
    console.warn("SeenShot startNav: start ignored, already started");
    return;
  }
  started = true;

    let paintSeq = 0;

    // ─── Ariadne's Thread [AT-0338] ─────────────────────
    // What: Log .topnav .brand img src and size next to .brand-name
    // Why:  Sign-in and legal headers must leave an English trail that /SeenShot.png sits left of SeenShot.app
    // Date: 2026-08-28
    // Related: [AT-0337] public/signin.html, [AT-0305] public/js/releases.js
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0355] ─────────────────────
    // What: Log .topnav wrap, brand flex basis, and whether nav stays on the brand row
    // Why:  Mobile Sign In must stay right of the brand, not wrap under the lede
    // Date: 2026-08-28
    // Related: [AT-0354] public/css/site.css:.topnav, [AT-0338] public/js/nav.js:logBrand
    // ─────────────────────────────────────────────────────
    function logBrand() {
      const header = document.querySelector("header.topnav");
      const brand = document.querySelector(".topnav a.brand");
      const logo = brand ? brand.querySelector("img") : null;
      const name = brand ? brand.querySelector(".brand-name") : null;
      const nav = document.querySelector(".topnav nav");
      const menu = document.querySelector("details.topnav-menu");
      if (!brand) {
        console.warn("SeenShot nav: brand missing");
        return;
      }
      const headerBox = header ? header.getBoundingClientRect() : null;
      const brandBox = brand.getBoundingClientRect();
      const logoBox = logo ? logo.getBoundingClientRect() : null;
      const nameBox = name ? name.getBoundingClientRect() : null;
      const navBox = nav ? nav.getBoundingClientRect() : null;
      const headerStyle = header ? getComputedStyle(header) : null;
      const brandStyle = getComputedStyle(brand);
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      const menuOpen = menu ? menu.open : true;
      const sameRow = Boolean(
        navBox &&
        navBox.left + 1 >= brandBox.right &&
        navBox.top < brandBox.bottom &&
        navBox.bottom > brandBox.top
      );
      console.log(
        "SeenShot nav: brand href=" + (brand.getAttribute("href") || "") +
          " logo=" + (logo ? logo.getAttribute("src") || "" : "") +
          " loading=" + (logo ? logo.getAttribute("loading") || "" : "") +
          " decoding=" + (logo ? logo.getAttribute("decoding") || "" : "") +
          " logoW=" + (logoBox ? Math.round(logoBox.width) : 0) +
          " logoH=" + (logoBox ? Math.round(logoBox.height) : 0) +
          " logoLeft=" + (logoBox ? Math.round(logoBox.left) : -1) +
          " name=" + (name ? name.textContent || "" : "") +
          " nameLeft=" + (nameBox ? Math.round(nameBox.left) : -1) +
          " logoBeforeName=" + Boolean(logoBox && nameBox && logoBox.right <= nameBox.left + 1) +
          " brandLeft=" + Math.round(brandBox.left) +
          " complete=" + (logo ? String(logo.complete) : "none")
      );
      console.log(
        "SeenShot nav: topnav wrap=" + (headerStyle ? headerStyle.flexWrap : "") +
          " brandFlex=" + brandStyle.flexGrow + " " + brandStyle.flexShrink + " " + brandStyle.flexBasis +
          " vw=" + window.innerWidth +
          " headerW=" + (headerBox ? Math.round(headerBox.width) : 0) +
          " headerH=" + (headerBox ? Math.round(headerBox.height) : 0) +
          " brandW=" + Math.round(brandBox.width) +
          " brandH=" + Math.round(brandBox.height) +
          " navLeft=" + (navBox ? Math.round(navBox.left) : -1) +
          " navTop=" + (navBox ? Math.round(navBox.top) : -1) +
          " sameRow=" + sameRow +
          " menuPresent=" + Boolean(menu) +
          " menuOpen=" + (menu ? String(menu.open) : "none") +
          " mobile=" + mobile
      );
      if (!name || name.textContent !== "SeenShot.app") {
        console.warn("SeenShot nav: brand-name expected SeenShot.app got=" + (name ? name.textContent || "" : ""));
      }
      if (nav && !sameRow && !(menu && mobile)) {
        console.warn("SeenShot nav: Sign In not on the brand row");
      }
      if (menu && mobile && menuOpen) {
        console.log("SeenShot nav: topnav-menu open email=" + (nav ? nav.textContent || "" : ""));
      }
      // ─── Ariadne's Thread [AT-0525] ─────────────────────
      // What: Log sticky .topnav, #nav-pricing hash, and #nav-download href
      // Why:  Menu must stay at the viewport top and reuse the same /download path as the pills
      // Date: 2026-09-05
      // Related: [AT-0525] components/SiteChrome.tsx:TopNav, [AT-0354] app/site.css:.topnav
      // ─────────────────────────────────────────────────────
      const pricing = document.getElementById("nav-pricing");
      const navDownload = document.getElementById("nav-download");
      const pricingTarget = document.getElementById("pricing");
      const navApple = navDownload ? navDownload.querySelector(".download-apple") : null;
      const navLabel = navDownload ? navDownload.querySelector(".download-label") : null;
      const pricingHref = pricing ? pricing.getAttribute("href") || "" : "";
      console.log(
        "SeenShot nav: sticky position=" + (headerStyle ? headerStyle.position : "") +
          " top=" + (headerStyle ? headerStyle.top : "") +
          " zIndex=" + (headerStyle ? headerStyle.zIndex : "") +
          " headerTop=" + (headerBox ? Math.round(headerBox.top) : -1) +
          " scrollY=" + Math.round(window.scrollY) +
          " pricingHref=" + pricingHref +
          " pricingHash=" + (pricingHref.indexOf("#pricing") !== -1) +
          " pricingPage=" + (pricingHref.indexOf("/pricing") === 0 && pricingHref.indexOf("#") === -1) +
          " pricingTarget=" + Boolean(pricingTarget) +
          " downloadHref=" + (navDownload ? navDownload.getAttribute("href") || "" : "") +
          " downloadClass=" + (navDownload ? navDownload.className : "") +
          " downloadHasApple=" + Boolean(navApple) +
          " downloadLabel=" + (navLabel ? (navLabel.textContent || "").trim() : "")
      );
    }

    // ─── Ariadne's Thread [AT-0437] ─────────────────────
    // What: Open details.topnav-menu above 600px and close it on mobile
    // Why:  HTMLDetailsElement.open is the documented way to show Sign In on desktop and collapse Menu on mobile
    // Date: 2026-09-03
    // Related: [AT-0437] components/SiteChrome.tsx:TopNav, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
    // ─────────────────────────────────────────────────────
    function syncTopnavMenu() {
      const menu = document.querySelector("details.topnav-menu");
      if (!menu) {
        console.log("SeenShot nav: topnav-menu missing");
        return;
      }
      if (menu.hidden) {
        menu.open = false
        console.log("SeenShot nav: topnav-menu skip sync hidden")
        return
      }
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      menu.open = !mobile;
      const summary = menu.querySelector("summary");
      const auth = document.getElementById("nav-auth");
      const name = document.querySelector(".brand-name");
      const summaryBox = summary ? summary.getBoundingClientRect() : null;
      const nameBox = name ? name.getBoundingClientRect() : null;
      const authVisible = Boolean(auth && auth.getClientRects().length > 0);
      const overlap = Boolean(
        nameBox &&
        summaryBox &&
        !(nameBox.bottom <= summaryBox.top + 1 ||
          summaryBox.bottom <= nameBox.top + 1 ||
          nameBox.right <= summaryBox.left + 1 ||
          summaryBox.right <= nameBox.left + 1)
      );
      console.log(
        "SeenShot nav: topnav-menu sync mobile=" + mobile +
          " open=" + menu.open +
          " vw=" + window.innerWidth +
          " summaryDisplay=" + (summary ? getComputedStyle(summary).display : "none") +
          " authVisible=" + authVisible +
          " overlapNameMenu=" + overlap
      );
    }

    function quotaNode() {
      const el = document.getElementById("nav-quota");
      console.log("SeenShot nav: quotaNode present=" + Boolean(el));
      return el;
    }

    function hideQuota() {
      const el = document.getElementById("nav-quota");
      if (!el) {
        return;
      }
      el.hidden = true;
      el.textContent = "";
      el.removeAttribute("title");
      console.log("SeenShot nav: quota hidden");
    }

    function hideUpgrade() {
      const upgrade = document.getElementById("upgrade-pro");
      if (upgrade) {
        upgrade.hidden = true;
        console.log("SeenShot nav: upgrade hidden");
      }
      const redeemLink = document.getElementById("redeem-promocode");
      if (redeemLink) {
        redeemLink.hidden = true;
        console.log("SeenShot nav: redeem promocode hidden");
      }
      const appsumo = document.getElementById("buy-appsumo");
      if (appsumo) {
        appsumo.hidden = true;
        console.log("SeenShot nav: appsumo hidden");
      }
    }

    // ─── Ariadne's Thread [AT-0385] ─────────────────────
    // What: Hide the /space/redem form when signed out; leave #redeem-ok visible
    // Why:  Success must stay on screen after plan becomes pro
    // Date: 2026-08-31
    // Related: [AT-0385] public/space/redem/index.html:#redeem-form, [AT-0283] public/js/nav.js:paint
    // ─────────────────────────────────────────────────────
    function hideRedeem() {
      const form = document.getElementById("redeem-form");
      if (!form) {
        return;
      }
      form.hidden = true;
      console.log("SeenShot nav: redeem hidden");
    }

    // ─── Ariadne's Thread [AT-0701] ─────────────────────
    // What: Hide header Pricing and Download while a Firebase session exists
    // Why:  Signed-in chrome keeps Sign Out. Pricing and Download are for guests
    // Date: 2026-10-02
    // Related: [AT-0525] components/SiteChrome.tsx:TopNav, [AT-0526] lib/client/nav.ts:paint
    // ─────────────────────────────────────────────────────
    function setGuestHeaderLinks(visible) {
      const pricing = document.getElementById("nav-pricing")
      const navDownload = document.getElementById("nav-download")
      const menu = document.querySelector("details.topnav-menu")
      if (pricing) {
        pricing.hidden = !visible
      }
      if (navDownload) {
        navDownload.hidden = !visible
      }
      if (menu) {
        menu.hidden = !visible
        if (!visible) {
          menu.open = false
        }
      }
      console.log(
        "SeenShot nav: guestHeader visible=" + visible +
          " pricingHidden=" + (pricing ? String(pricing.hidden) : "missing") +
          " downloadHidden=" + (navDownload ? String(navDownload.hidden) : "missing") +
          " menuHidden=" + (menu ? String(menu.hidden) : "missing")
      )
      if (visible) {
        syncTopnavMenu()
      }
    }

    function pageImageMeta() {
      const title = (document.title || "SeenShot").trim()
      const descNode = document.querySelector('meta[name="description"]')
      const description = descNode ? (descNode.getAttribute("content") || "").trim() : ""
      const desc = description || title
      console.log(
        "SeenShot nav: pageImageMeta title=" + title +
          " descChars=" + desc.length
      )
      return { title: title, description: desc }
    }

    function photoFromIdToken(idToken) {
      if (!idToken) {
        console.log("SeenShot nav: idToken picture skipped empty")
        return ""
      }
      try {
        const parts = String(idToken).split(".")
        if (parts.length < 2) {
          console.warn("SeenShot nav: idToken picture skipped parts=" + parts.length)
          return ""
        }
        const paddedRaw = parts[1].replace(/-/g, "+").replace(/_/g, "/")
        const pad = paddedRaw.length % 4
        const padded = pad ? paddedRaw + "====".slice(0, 4 - pad) : paddedRaw
        const json = atob(padded)
        const payload = JSON.parse(json)
        const picture = typeof payload.picture === "string" ? payload.picture.trim() : ""
        console.log(
          "SeenShot nav: idToken pictureChars=" + picture.length +
            " sub=" + (payload.sub || payload.user_id || "")
        )
        return picture
      } catch (err) {
        console.warn("SeenShot nav: idToken picture parse failed", err)
        return ""
      }
    }

    function avatarLetter(email) {
      const trimmed = String(email || "").trim()
      const ch = trimmed.charAt(0)
      const letter = ch ? ch.toUpperCase() : "S"
      console.log("SeenShot nav: avatarLetter=" + letter + " emailChars=" + trimmed.length)
      return letter
    }

    // ─── Ariadne's Thread [AT-0705] ─────────────────────
    // What: Paint #nav-account avatar from the Firebase picture claim or an email letter
    // Why:  Signed-in header shows an avatar. Sign Out stays inside the dropdown
    // Date: 2026-10-02
    // Related: [AT-0705] components/SiteChrome.tsx:#nav-account, [AT-0009] lib/client/nav.ts:paint
    // ─────────────────────────────────────────────────────
    function setAccountMenu(visible, email, idToken) {
      const account = document.getElementById("nav-account")
      const img = document.getElementById("nav-avatar")
      const fallback = document.getElementById("nav-avatar-fallback")
      const signOutBtn = document.getElementById("sign-out")
      if (!account) {
        console.log(
          "SeenShot nav: nav-account missing visible=" + visible +
            " emailChars=" + String(email || "").length
        )
        return
      }
      account.hidden = !visible
      if (!visible) {
        account.open = false
        if (signOutBtn) {
          signOutBtn.hidden = true
        }
        if (img) {
          img.hidden = true
          img.removeAttribute("src")
          img.alt = ""
          img.removeAttribute("title")
          img.removeAttribute("description")
        }
        if (fallback) {
          fallback.hidden = true
          fallback.textContent = ""
        }
        console.log("SeenShot nav: account hidden")
        return
      }
      if (signOutBtn) {
        signOutBtn.hidden = false
      }
      const photo = photoFromIdToken(idToken)
      const letter = avatarLetter(email)
      const meta = pageImageMeta()
      if (photo && img) {
        img.hidden = false
        img.src = photo
        img.alt = meta.title
        img.title = meta.title
        img.setAttribute("description", meta.description)
        if (fallback) {
          fallback.hidden = true
          fallback.textContent = letter
        }
      } else {
        if (img) {
          img.hidden = true
          img.removeAttribute("src")
          img.alt = meta.title
          img.title = meta.title
          img.setAttribute("description", meta.description)
        }
        if (fallback) {
          fallback.hidden = false
          fallback.textContent = letter
        }
      }
      const cabinet = document.getElementById("nav-cabinet")
      console.log(
        "SeenShot nav: account visible photo=" + Boolean(photo) +
          " letter=" + letter +
          " imgHidden=" + (img ? String(img.hidden) : "missing") +
          " fallbackHidden=" + (fallback ? String(fallback.hidden) : "missing") +
          " signOutHidden=" + (signOutBtn ? String(signOutBtn.hidden) : "missing") +
          " cabinetHref=" + (cabinet ? cabinet.getAttribute("href") || "" : "missing") +
          " open=" + String(account.open)
      )
    }

    function formatMb(bytes) {
      const gb = 1024 * 1024 * 1024;
      const mb = 1024 * 1024;
      const unit = bytes >= gb ? "GB" : "MB";
      const value = bytes / (unit === "GB" ? gb : mb);
      const n = new Intl.NumberFormat("en", { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(value);
      return n + " " + unit;
    }

    function planLabel(plan) {
      if (plan === "pro" || plan === "grace") {
        return "Member";
      }
      return "Free";
    }

    // ─── Ariadne's Thread [AT-0072] ─────────────────────
    // What: Paint leftover screenshot storage on .nav-quota from GET /api/me
    // Why:  Signed-in top nav must show Free 10MB / Pro 1GB remaining bytes
    // Date: 2026-08-27
    // Related: [AT-0071] src/index.ts:me, [AT-0009] public/js/nav.js:paint
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0079] ─────────────────────
    // What: Quota text is "Free: 10 MB, available N MB" beside My Screenshots
    // Why:  The leftover used to sit in the top nav as "N MB free"
    // Date: 2026-08-27
    // Related: [AT-0078] public/space/index.html, [AT-0071] src/index.ts:me
    // ─────────────────────────────────────────────────────
    async function paint() {
      const seq = paintSeq + 1;
      paintSeq = seq;
      const link = document.getElementById("nav-auth");
      if (!link) {
        console.log("SeenShot nav: no nav-auth link");
        return;
      }
      const session = SeenShotAuth.readSession();
      if (!session.refreshToken) {
        link.hidden = false;
        link.textContent = "Sign In";
        link.href = "/signin";
        link.onclick = null;
        setAccountMenu(false)
        hideQuota();
        paintPaidCabinet("free", null)
        hideUpgrade();
        hideRedeem();
        setGuestHeaderLinks(true)
        console.log(
          "SeenShot nav: signed out signOutPresent=" + Boolean(document.getElementById("sign-out")) +
            " navAuthHidden=" + link.hidden +
            " accountHidden=" + (document.getElementById("nav-account") ? String(document.getElementById("nav-account").hidden) : "missing")
        );
        return;
      }
      // ─── Ariadne's Thread [AT-0526] ─────────────────────
      // What: Hide #nav-auth with the HTML hidden attribute while a session exists
      // Why:  Signed-in chrome must not show the email; Sign In stays for signed-out
      // Date: 2026-09-05
      // Related: [AT-0009] lib/client/nav.ts:paint, [AT-0438] components/SiteChrome.tsx:#nav-auth, https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden
      // ─────────────────────────────────────────────────────
      link.hidden = true;
      console.log(
        "SeenShot nav: nav-auth hidden pending ensure seq=" + seq +
          " hasRefresh=" + Boolean(session.refreshToken)
      );
      try {
        await SeenShotAuth.ensureIdToken();
      } catch (error) {
        console.warn("SeenShot nav: ensure failed", error);
        link.hidden = false;
        link.textContent = "Sign In";
        link.href = "/signin";
        setAccountMenu(false)
        hideQuota();
        paintPaidCabinet("free", null)
        hideUpgrade();
        hideRedeem();
        setGuestHeaderLinks(true)
        console.log("SeenShot nav: nav-auth visible after ensure fail hidden=" + link.hidden);
        return;
      }
      if (seq !== paintSeq) {
        console.log("SeenShot nav: paint stale after ensure seq=" + seq + " latest=" + paintSeq);
        return;
      }
      const fresh = SeenShotAuth.readSession();
      link.hidden = true;
      link.textContent = fresh.email || "Space";
      link.href = "/space/";
      setAccountMenu(true, fresh.email, fresh.idToken)
      setGuestHeaderLinks(false)
      console.log(
        "SeenShot nav: signed in emailChars=" + (fresh.email || "").length +
          " navAuthHidden=" + link.hidden +
          " navAuthDisplay=" + getComputedStyle(link).display +
          " accountHidden=" + (document.getElementById("nav-account") ? String(document.getElementById("nav-account").hidden) : "missing")
      );
      // ─── Ariadne's Thread [AT-0708] ─────────────────────
      // What: Still GET /api/me when #nav-quota is missing from /space
      // Why:  Cabinet Download and AppSumo need plan= from me after the title row was removed
      // Date: 2026-10-02
      // Related: [AT-0707] components/SpaceMain.tsx:.cabinet-head, [AT-0709] lib/client/paid-ui.ts:paintPaidCabinet, [AT-0072] lib/client/nav.ts:paint
      // ─────────────────────────────────────────────────────
      const quota = quotaNode()
      try {
        const response = await SeenShotAuth.api("/api/me")
        if (seq !== paintSeq) {
          console.log("SeenShot nav: paint stale after me seq=" + seq + " latest=" + paintSeq)
          return
        }
        if (!response.ok) {
          console.warn("SeenShot nav: me status=" + response.status)
          hideQuota()
          paintPaidCabinet("free", null)
          hideUpgrade()
          hideRedeem()
          return
        }
        const data = await response.json()
        const remaining = typeof data.remainingBytes === "number" ? data.remainingBytes : 0
        const limit = typeof data.limitBytes === "number" ? data.limitBytes : 10 * 1024 * 1024
        const used = typeof data.usedBytes === "number" ? data.usedBytes : 0
        const plan = typeof data.plan === "string" ? data.plan : "free"
        const graceEndsAt = data.graceEndsAt
        paintPaidCabinet(plan, graceEndsAt)
        // ─── Ariadne's Thread [AT-0730] ─────────────────────
        // What: Hide #nav-quota when the plan label is Free
        // Why:  Cabinet title must not print Free. Member still shows
        // Date: 2026-10-02
        // Related: [AT-0725] lib/client/nav.ts:paint, [AT-0078] components/SpaceMain.tsx:#nav-quota
        // ─────────────────────────────────────────────────────
        const text = planLabel(plan)
        if (quota) {
          if (text === "Free") {
            hideQuota()
            console.log("SeenShot nav: quota skip Free remaining=" + remaining + " used=" + used + " limit=" + limit)
          } else {
            quota.hidden = false
            quota.textContent = text
            quota.title = formatMb(used) + " used of " + formatMb(limit) + " (" + plan + ")"
          }
        }
        console.log(
          "SeenShot nav: quota remaining=" + remaining +
            " used=" + used +
            " limit=" + limit +
            " plan=" + plan +
            " text=" + text +
            " quotaNode=" + Boolean(quota) +
            " quotaHidden=" + (quota ? String(quota.hidden) : "missing")
        )
        // ─── Ariadne's Thread [AT-0283] ─────────────────────
        // What: Show Upgrade to Pro when plan is not pro
        // Why:  Member accounts must not start a second Polar checkout from the cabinet
        // Date: 2026-08-27
        // Related: [AT-0282] public/space/index.html, [AT-0072] public/js/nav.js:paint
        // ─────────────────────────────────────────────────────
        const upgrade = document.getElementById("upgrade-pro");
        const appsumo = document.getElementById("buy-appsumo");
        const redeemLink = document.getElementById("redeem-promocode");
        const paid = planIsPaid(plan, graceEndsAt)
        if (upgrade) {
          console.log(
            "SeenShot nav: upgrade hidden=" + upgrade.hidden +
              " display=" + getComputedStyle(upgrade).display +
              " plan=" + plan +
              " paid=" + paid +
              " label=" + upgrade.textContent
          );
        }
        if (appsumo) {
          console.log(
            "SeenShot nav: appsumo hidden=" + appsumo.hidden +
              " href=" + (appsumo.getAttribute("href") || "") +
              " plan=" + plan +
              " paid=" + paid +
              " label=" + (appsumo.textContent || "").trim()
          )
        }
        if (redeemLink) {
          console.log(
            "SeenShot nav: redeem promocode hidden=" + redeemLink.hidden +
              " href=" + (redeemLink.getAttribute("href") || "") +
              " plan=" + plan +
              " paid=" + paid
          );
        }
        if (
          (upgrade || redeemLink || appsumo) &&
          window.SeenShotCabinet &&
          typeof window.SeenShotCabinet.logActions === "function"
        ) {
          window.SeenShotCabinet.logActions();
        }
        const redeemForm = document.getElementById("redeem-form");
        if (redeemForm) {
          redeemForm.hidden = paid
          console.log("SeenShot nav: redeem hidden=" + redeemForm.hidden + " plan=" + plan + " paid=" + paid);
        }
      } catch (error) {
        console.error("SeenShot nav: quota failed", error);
        if (seq !== paintSeq) {
          return;
        }
        hideQuota();
        paintPaidCabinet("free", null)
        hideUpgrade();
        hideRedeem();
      }
    }

    // ─── Ariadne's Thread [AT-0033] ─────────────────────
    // What: Sign Out in the top nav clears the session
    // Why:  The yellow cabinet-head button moved next to the email
    // Date: 2026-08-27
    // Related: [AT-0009] public/js/nav.js:paint, [AT-0008] public/js/auth.js:clearSession
    // ─────────────────────────────────────────────────────
    const cabinet = document.getElementById("nav-cabinet")
    if (cabinet) {
      cabinet.addEventListener("click", function () {
        console.log(
          "SeenShot nav: cabinet click href=" + (cabinet.getAttribute("href") || "") +
            " path=" + location.pathname
        )
      })
      console.log("SeenShot nav: cabinet link bound href=" + (cabinet.getAttribute("href") || ""))
    } else {
      console.log("SeenShot nav: nav-cabinet missing")
    }

    const signOut = document.getElementById("sign-out");
    if (signOut) {
      signOut.addEventListener("click", function () {
        console.log("SeenShot nav: sign out");
        SeenShotAuth.clearSession();
        location.href = "/signin";
      });
    } else {
      console.log("SeenShot nav: no sign-out button");
    }

    const account = document.getElementById("nav-account")
    const navAvatar = document.getElementById("nav-avatar")
    if (account) {
      account.addEventListener("toggle", function () {
        console.log(
          "SeenShot nav: account toggle open=" + account.open +
            " hidden=" + String(account.hidden) +
            " vw=" + window.innerWidth
        )
      })
      document.addEventListener("click", function (event) {
        if (!account.open || account.hidden) {
          return
        }
        const target = event.target
        if (target && account.contains(target)) {
          return
        }
        account.open = false
        console.log("SeenShot nav: account closed outside click")
      })
      document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
          return
        }
        if (!account.open || account.hidden) {
          return
        }
        account.open = false
        console.log("SeenShot nav: account closed escape")
      })
    } else {
      console.log("SeenShot nav: nav-account missing")
    }
    if (navAvatar) {
      navAvatar.addEventListener("error", function () {
        const fallback = document.getElementById("nav-avatar-fallback")
        const session = SeenShotAuth.readSession()
        const letter = avatarLetter(session.email)
        navAvatar.hidden = true
        navAvatar.removeAttribute("src")
        if (fallback) {
          fallback.hidden = false
          fallback.textContent = letter
        }
        console.warn(
          "SeenShot nav: avatar image failed letter=" + letter +
            " fallbackHidden=" + (fallback ? String(fallback.hidden) : "missing")
        )
      })
      navAvatar.addEventListener("load", function () {
        console.log(
          "SeenShot nav: avatar loaded natural=" + navAvatar.naturalWidth + "x" + navAvatar.naturalHeight +
            " srcChars=" + String(navAvatar.currentSrc || "").length
        )
      })
    }

    const menu = document.querySelector("details.topnav-menu");
    const menuMq = window.matchMedia("(max-width: 600px)");
    syncTopnavMenu();
    menuMq.addEventListener("change", function () {
      console.log("SeenShot nav: topnav-menu mq change matches=" + menuMq.matches);
      syncTopnavMenu();
      logBrand();
    });
    if (menu) {
      menu.addEventListener("toggle", function () {
        console.log("SeenShot nav: topnav-menu toggle open=" + menu.open + " vw=" + window.innerWidth);
      });
    }

    if (!document.getElementById("nav-pricing")) {
      console.log("SeenShot nav: nav-pricing missing")
    }
    const navDownload = document.getElementById("nav-download");
    if (navDownload) {
      navDownload.addEventListener("click", function () {
        const apple = navDownload.querySelector(".download-apple");
        const label = navDownload.querySelector(".download-label");
        console.log(
          "SeenShot nav: download click href=" + (navDownload.getAttribute("href") || "") +
            " id=" + (navDownload.id || "") +
            " hasApple=" + Boolean(apple) +
            " label=" + (label ? (label.textContent || "").trim() : "")
        );
      });
    } else {
      console.log("SeenShot nav: nav-download missing");
    }
    let topnavStuck = false;
    window.addEventListener("scroll", function () {
      const header = document.querySelector("header.topnav");
      if (!header) {
        return;
      }
      const top = header.getBoundingClientRect().top;
      const stuck = top <= 1;
      if (stuck === topnavStuck) {
        return;
      }
      topnavStuck = stuck;
      const cs = getComputedStyle(header);
      console.log(
        "SeenShot nav: topnav stuck=" + stuck +
          " headerTop=" + Math.round(top) +
          " position=" + cs.position +
          " scrollY=" + Math.round(window.scrollY)
      );
    }, { passive: true });

    logBrand();
    const brandLogo = document.querySelector(".topnav a.brand img");
    if (brandLogo && !brandLogo.complete) {
      brandLogo.addEventListener("load", function () {
        console.log("SeenShot nav: brand logo loaded natural=" + brandLogo.naturalWidth + "x" + brandLogo.naturalHeight);
        logBrand();
      });
      brandLogo.addEventListener("error", function () {
        console.error("SeenShot nav: brand logo failed src=" + (brandLogo.getAttribute("src") || ""));
      });
    }
    paint();
    window.SeenShotNav = { paint: paint };

}
