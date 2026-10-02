// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0013] ─────────────────────
   What: Render GitHub Releases on the landing page
   Why:  Same download list as the GitHub Pages microsite
   Date: 2026-08-26
   Related: docs/index.html, https://docs.github.com/en/rest/releases/releases
─────────────────────────────────────────────────────── */

import { jsonLdNodeByType, readJsonLdScript } from "@/lib/client/jsonld";

let started = false;
export function startReleases() {
  if (started) {
    console.warn("SeenShot startReleases: start ignored, already started");
    return;
  }
  started = true;

    const REPO = "alxgntv/seenshot";
    const RELEASES_URL = "https://api.github.com/repos/" + REPO + "/releases";
    const FALLBACK = "https://github.com/" + REPO + "/releases";
    const MAC_DOWNLOAD_LABEL = "Download Free for macOS";
    const DOWNLOAD_COUNT_HERO_MIN = 1000;
    let cachedPublished = [];
    let listArch = "arm";
    let heroArch = "arm";
    // ─── Ariadne's Thread [AT-0237] ─────────────────────
    // What: Log .brand .lede and .hero .lede separately
    // Why:  querySelector(".lede") would hit the topnav subtitle first
    // Date: 2026-08-27
    // Related: [AT-0235] public/index.html, [AT-0013] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const brandLede = document.querySelector(".brand .lede");
    const lede = document.querySelector(".hero .lede");
    const heroTitle = document.querySelector("h1");
    // ─── Ariadne's Thread [AT-0269] ─────────────────────
    // What: Log homepage topnav and landing column widths
    // Why:  Header must match main.landing, not the full viewport
    // Date: 2026-08-27
    // Related: [AT-0268] public/css/site.css, [AT-0013] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const topnav = document.querySelector(".topnav");
    const landing = document.querySelector("main.landing");
    if (topnav && landing) {
      const topnavCs = window.getComputedStyle(topnav);
      const topnavBox = topnav.getBoundingClientRect();
      const brandName = document.querySelector(".brand-name");
      const brandNameBox = brandName ? brandName.getBoundingClientRect() : null;
      const navAuth = document.getElementById("nav-auth");
      const navAuthBox = navAuth ? navAuth.getBoundingClientRect() : null;
      console.log(
        "SeenShot site: topnav width=" + Math.round(topnavBox.width) +
          " height=" + Math.round(topnavBox.height) +
          " display=" + topnavCs.display +
          " landing width=" + Math.round(landing.getBoundingClientRect().width) +
          " match=" + (Math.round(topnavBox.width) === Math.round(landing.getBoundingClientRect().width)) +
          " vw=" + window.innerWidth
      );
      if (brandLede && brandNameBox && navAuthBox) {
        const brandLedeBox = brandLede.getBoundingClientRect();
        console.log(
          "SeenShot site: topnav brand-name left=" + Math.round(brandNameBox.left) +
            " signIn left=" + Math.round(navAuthBox.left) +
            " brand-lede top=" + Math.round(brandLedeBox.top) +
            " brand-lede width=" + Math.round(brandLedeBox.width) +
            " brand-lede overflowX=" + (brandLede.scrollWidth > Math.ceil(brandLedeBox.width) + 1 ? "yes" : "no")
        );
      }
    }
    console.log("SeenShot site: brand lede=" + (brandLede ? brandLede.textContent : "") + " chars=" + (brandLede ? brandLede.textContent.length : 0));
    const brandAgents = document.querySelector(".brand .lede-agents");
    const brandAgentMarks = brandAgents ? brandAgents.querySelectorAll(".lede-agent") : [];
    const brandLedeCopy = document.querySelector(".brand .lede-copy");
    const brandLucide = document.querySelector(".brand .lede-agents .lede-lucide")
    console.log(
      "SeenShot site: brand lede-agents=" + Boolean(brandAgents) +
        " marks=" + brandAgentMarks.length +
        " label=" + (brandAgents ? (brandAgents.getAttribute("aria-label") || "") : "") +
        " lucide=" + Boolean(brandLucide) +
        " lucideFirst=" + Boolean(brandAgents && brandLucide && brandAgents.firstElementChild === brandLucide) +
        " afterCopy=" + Boolean(brandLedeCopy && brandAgents && brandLedeCopy.nextElementSibling === brandAgents)
    )
    const founderAgents = document.querySelector(".founder-copy .lede-agents")
    const founderAgentMarks = founderAgents ? founderAgents.querySelectorAll(".lede-agent") : []
    const founderBody = document.querySelector(".founder-copy > p:not(.founder-head)")
    console.log(
      "SeenShot site: founder lede-agents=" + Boolean(founderAgents) +
        " marks=" + founderAgentMarks.length +
        " afterBody=" + Boolean(founderBody && founderAgents && founderBody.nextElementSibling === founderAgents)
    )
    // ─── Ariadne's Thread [AT-0305] ─────────────────────
    // What: Log .brand img src after the logo returned to the topnav
    // Why:  Landing header must leave an English trail that /SeenShot.png sits left of .brand-copy
    // Date: 2026-08-28
    // Related: [AT-0303] public/index.html, [AT-0237] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const brandLogo = document.querySelector(".brand img");
    console.log(
      "SeenShot site: brand logo=" + (brandLogo ? brandLogo.getAttribute("src") : "") +
        " complete=" + (brandLogo ? String(brandLogo.complete) : "none") +
        " loading=" + (brandLogo ? (brandLogo.getAttribute("loading") || "") : "none") +
        " decoding=" + (brandLogo ? (brandLogo.getAttribute("decoding") || "") : "none")
    );
    console.log("SeenShot site: lede=" + (lede ? lede.textContent : "") + " chars=" + (lede ? lede.textContent.length : 0));
    const ledeAgents = document.querySelector(".hero .lede-agents");
    const ledeAgentMarks = ledeAgents ? ledeAgents.querySelectorAll(".lede-agent") : [];
    const ledeCopy = document.querySelector(".hero .lede-copy");
    const ledeLucide = ledeAgents ? ledeAgents.querySelector(".lede-lucide") : null
    console.log(
      "SeenShot site: lede-agents=" + Boolean(ledeAgents) +
        " marks=" + ledeAgentMarks.length +
        " label=" + (ledeAgents ? (ledeAgents.getAttribute("aria-label") || "") : "") +
        " lucide=" + Boolean(ledeLucide) +
        " lucideFirst=" + Boolean(ledeAgents && ledeLucide && ledeAgents.firstElementChild === ledeLucide) +
        " afterCopy=" + Boolean(ledeCopy && ledeAgents && ledeCopy.nextElementSibling === ledeAgents)
    );
    // ─── Ariadne's Thread [AT-0451] ─────────────────────
    // What: Log Free pricing Instant sharing with: LedeAgents
    // Why:  First Free list row must reuse the same agent marks as .hero .lede-agents
    // Date: 2026-09-03
    // Related: [AT-0451] components/LandingMain.tsx:.pricing-card ul, [AT-0402] lib/client/releases.ts:.lede-agents
    // ─────────────────────────────────────────────────────
    const freePricingCard = Array.prototype.find.call(document.querySelectorAll(".pricing-card"), function (card) {
      const title = card.querySelector("h3");
      return title && title.textContent === "Free";
    });
    const pricingAgents = freePricingCard ? freePricingCard.querySelector(".lede-agents") : null;
    const pricingAgentMarks = pricingAgents ? pricingAgents.querySelectorAll(".lede-agent") : [];
    const pricingFirstItem = freePricingCard ? freePricingCard.querySelector("ul li") : null;
    const pricingSecondItem = freePricingCard ? freePricingCard.querySelector("ul li:nth-child(2)") : null;
    console.log(
      "SeenShot site: pricing-agents=" + Boolean(pricingAgents) +
        " marks=" + pricingAgentMarks.length +
        " label=" + (pricingAgents ? (pricingAgents.getAttribute("aria-label") || "") : "") +
        " firstItem=" + (pricingFirstItem ? pricingFirstItem.textContent.trim().slice(0, 48) : "") +
        " freeCard=" + Boolean(freePricingCard)
    );
    // ─── Ariadne's Thread [AT-0454] ─────────────────────
    // What: Log Free pricing second row Share via link
    // Why:  Share via link must sit after Instant sharing with, not above 10 MB
    // Date: 2026-09-03
    // Related: [AT-0454] components/LandingMain.tsx:.pricing-card ul, [AT-0451] lib/client/releases.ts:pricingFirstItem
    // ─────────────────────────────────────────────────────
    console.log(
      "SeenShot site: pricing second=" + (pricingSecondItem ? pricingSecondItem.textContent.trim() : "") +
        " freeItems=" + (freePricingCard ? freePricingCard.querySelectorAll("ul li").length : 0)
    );
    if (lede) {
      const ledeCs = window.getComputedStyle(lede);
      const ledeBox = lede.getBoundingClientRect();
      const ledeCopyCs = ledeCopy ? window.getComputedStyle(ledeCopy) : null;
      const ledeCopyBox = ledeCopy ? ledeCopy.getBoundingClientRect() : null;
      console.log(
        "SeenShot site: lede flex=" + ledeCs.flexDirection +
          " wrap=" + ledeCs.flexWrap +
          " whiteSpace=" + ledeCs.whiteSpace +
          " height=" + Math.round(ledeBox.height) +
          " width=" + Math.round(ledeBox.width) +
          " overflowX=" + (lede.scrollWidth > Math.ceil(ledeBox.width) ? "yes" : "no")
      );
      if (ledeCopy && ledeCopyCs && ledeCopyBox) {
        console.log(
          "SeenShot site: lede-copy left=" + Math.round(ledeCopyBox.left) +
            " width=" + Math.round(ledeCopyBox.width) +
            " height=" + Math.round(ledeCopyBox.height) +
            " whiteSpace=" + ledeCopyCs.whiteSpace +
            " vw=" + window.innerWidth +
            " overflowX=" + (ledeCopy.scrollWidth > Math.ceil(ledeCopyBox.width) ? "yes" : "no")
        );
      }
    }
    const downloadArch = document.querySelector(".hero .download-arch");
    console.log("SeenShot site: download-arch=" + (downloadArch ? downloadArch.textContent : "") + " chars=" + (downloadArch ? downloadArch.textContent.length : 0));
    const pricingLabels = document.querySelectorAll(".pricing-card .download-label");
    pricingLabels.forEach(function (label) {
      const parent = label.parentElement;
      const box = label.getBoundingClientRect();
      const cs = window.getComputedStyle(label);
      console.log(
        "SeenShot site: pricing-label id=" + (parent ? parent.id : "") +
          " width=" + Math.round(box.width) +
          " height=" + Math.round(box.height) +
          " whiteSpace=" + cs.whiteSpace +
          " textOverflow=" + cs.textOverflow +
          " truncated=" + (label.scrollWidth > Math.ceil(box.width) + 1)
      );
    });
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    console.log(
      "SeenShot site: og:title=" + (ogTitle ? ogTitle.getAttribute("content") : "") +
        " og:image=" + (ogImage ? ogImage.getAttribute("content") : "") +
        " twitter:card=" + (twitterCard ? twitterCard.getAttribute("content") : "")
    );
    // ─── Ariadne's Thread [AT-0275] ─────────────────────
    // What: Log hero lede <b>cmd+shift+2</b> text and computed font-weight
    // Why:  Confirm the shortcut is native bold, not the surrounding lede weight
    // Date: 2026-08-27
    // Related: [AT-0274] public/index.html, [AT-0237] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const ledeKey = document.querySelector(".hero .lede b");
    if (ledeKey) {
      console.log(
        "SeenShot site: lede key=" + ledeKey.textContent +
          " tag=" + ledeKey.tagName +
          " weight=" + window.getComputedStyle(ledeKey).fontWeight +
          " ledeWeight=" + (lede ? window.getComputedStyle(lede).fontWeight : "")
      );
    } else {
      console.warn("SeenShot site: hero lede <b> missing");
    }
    console.log("SeenShot site: h1=" + (heroTitle ? heroTitle.textContent : "") + " chars=" + (heroTitle ? heroTitle.textContent.length : 0));
    if (heroTitle) {
      const h1Style = window.getComputedStyle(heroTitle);
      console.log(
        "SeenShot site: h1 fontSize=" + h1Style.fontSize +
          " textShadow=" + h1Style.textShadow +
          " webkitTextStroke=" + (h1Style.webkitTextStroke || h1Style.getPropertyValue("-webkit-text-stroke"))
      );
    }
    const heroShot = document.querySelector(".hero-shot");
    if (heroShot) {
      const heroSource = heroShot.querySelector("source");
      const heroSrc = heroShot.currentSrc || heroShot.getAttribute("src") || (heroSource ? heroSource.getAttribute("src") : "");
      // ─── Ariadne's Thread [AT-0459] ─────────────────────
      // What: Log .hero-shot preload=none after native video lazy
      // Why:  Landing must not fetch sharing-demo-3.mp4 on first paint
      // Date: 2026-09-03
      // Related: [AT-0459] components/LandingMain.tsx:.hero-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#preload
      // ─────────────────────────────────────────────────────
      console.log(
        "SeenShot site: hero shot tag=" + heroShot.tagName +
          " src=" + heroSrc +
          " poster=" + (heroShot.getAttribute("poster") || "") +
          " preload=" + (heroShot.getAttribute("preload") || "") +
          " muted=" + String(heroShot.muted) +
          " loop=" + String(heroShot.loop) +
          " paused=" + String(heroShot.paused)
      );
      heroShot.addEventListener("loadeddata", function () {
        console.log(
          "SeenShot site: hero video loaded video=" + heroShot.videoWidth + "x" + heroShot.videoHeight +
            " display=" + heroShot.clientWidth + "x" + heroShot.clientHeight +
            " duration=" + heroShot.duration +
            " preload=" + (heroShot.getAttribute("preload") || "")
        );
      });
      heroShot.addEventListener("playing", function () {
        console.log("SeenShot site: hero video playing paused=" + String(heroShot.paused) + " currentTime=" + heroShot.currentTime);
      });
      heroShot.addEventListener("error", function () {
        console.warn("SeenShot site: hero shot missing src=" + heroSrc + " hide until sharing-demo-3.mp4 exists");
        heroShot.hidden = true;
      });
    }
    // ─── Ariadne's Thread [AT-0265] ─────────────────────
    // What: Log founder card name, handle, avatar src after hero-shot
    // Why:  Landing intro block must leave an English console trail
    // Date: 2026-08-27
    // Related: [AT-0263] public/index.html, [AT-0013] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const founder = document.querySelector(".founder");
    if (founder) {
      const founderName = founder.querySelector(".founder-name");
      const founderHandle = founder.querySelector(".founder-handle");
      const founderPhoto = founder.querySelector("img");
      const founderBody = founder.querySelector(".founder-copy p:last-child");
      const founderBodyText = founderBody ? founderBody.textContent : "";
      // ─── Ariadne's Thread [AT-0491] ─────────────────────
      // What: Log founder body sensitive-data sentence
      // Why:  Landing intro must keep phones, emails, passwords, API keys, and faces off AI agents
      // Date: 2026-09-04
      // Related: [AT-0491] components/LandingMain.tsx:.founder-copy, [AT-0485] components/LandingMain.tsx:.bento-card p
      // ─────────────────────────────────────────────────────
      console.log(
        "SeenShot site: founder name=" + (founderName ? founderName.textContent : "") +
          " handle=" + (founderHandle ? founderHandle.textContent : "") +
          " handleTag=" + (founderHandle ? founderHandle.tagName : "") +
          " handleHref=" + (founderHandle ? (founderHandle.getAttribute("href") || "") : "") +
          " handleColor=" + (founderHandle ? getComputedStyle(founderHandle).color : "") +
          " photo=" + (founderPhoto ? founderPhoto.getAttribute("src") : "") +
          " photoLoading=" + (founderPhoto ? founderPhoto.getAttribute("loading") : "") +
          " body=" + founderBodyText +
          " chars=" + (founderBody ? founderBodyText.length : 0) +
          " hasAiAgents=" + (founderBody ? String(founderBodyText.indexOf("AI agents") !== -1) : "false") +
          " hasIndiehacker=" + (founderBody ? String(founderBodyText.indexOf("indiehacker") !== -1) : "false") +
          " hasSensitiveData=" + (founderBody ? String(founderBodyText.indexOf("sensitive data") !== -1) : "false") +
          " hasPhones=" + (founderBody ? String(founderBodyText.indexOf("phones") !== -1) : "false") +
          " hasEmails=" + (founderBody ? String(founderBodyText.indexOf("emails") !== -1) : "false") +
          " hasPasswords=" + (founderBody ? String(founderBodyText.indexOf("passwords") !== -1) : "false") +
          " hasApiKeys=" + (founderBody ? String(founderBodyText.indexOf("API keys") !== -1) : "false") +
          " hasFaces=" + (founderBody ? String(founderBodyText.indexOf("faces") !== -1) : "false")
      );
      // ─── Ariadne's Thread [AT-0543] ─────────────────────
      // What: Fail landing if .founder-handle or @aleksey_ignatov remains
      // Why:  The selected handle link must stay off the landing founder card
      // Date: 2026-09-05
      // Related: [AT-0543] frontend→components/LandingMain.tsx:.founder-head, [AT-0472] components/LandingMain.tsx:.founder-handle
      // ─────────────────────────────────────────────────────
      if (landing) {
        const founderHandleText = founderHandle ? (founderHandle.textContent || "") : "";
        const founderHasHandleCopy = founder.textContent.indexOf("@aleksey_ignatov") !== -1;
        const founderNameHref = founderName ? (founderName.getAttribute("href") || "") : "";
        const founderNameTag = founderName ? founderName.tagName : "";
        const expectedFounderHref = "https://www.linkedin.com/in/ignalex/";
        console.log(
          "SeenShot site: founder handlePresent=" + Boolean(founderHandle) +
            " handleText=" + founderHandleText +
            " handleCopy=" + founderHasHandleCopy +
            " nameTag=" + founderNameTag +
            " nameHref=" + founderNameHref
        );
        // ─── Ariadne's Thread [AT-0544] ─────────────────────
        // What: Require landing .founder-name to be the LinkedIn anchor
        // Why:  Click on Alex Ign must open the same profile as Contact Me, without the handle
        // Date: 2026-09-05
        // Related: [AT-0544] frontend→components/LandingMain.tsx:a.founder-name, [AT-0543] lib/client/releases.ts:.founder
        // ─────────────────────────────────────────────────────
        if (founderHandle || founderHasHandleCopy) {
          console.error(
            "SeenShot site: founder handle must stay off landing handlePresent=" +
              Boolean(founderHandle) +
              " handleCopy=" + founderHasHandleCopy
          );
        }
        if (founderNameTag !== "A" || founderNameHref !== expectedFounderHref) {
          console.error(
            "SeenShot site: founder name must link to LinkedIn tag=" +
              founderNameTag +
              " href=" + founderNameHref
          );
        }
      }
      if (
        !founderBody ||
        founderBodyText.indexOf("sensitive data") === -1 ||
        founderBodyText.indexOf("phones") === -1 ||
        founderBodyText.indexOf("emails") === -1 ||
        founderBodyText.indexOf("passwords") === -1 ||
        founderBodyText.indexOf("API keys") === -1 ||
        founderBodyText.indexOf("faces") === -1
      ) {
        console.error("SeenShot site: founder body missing sensitive data sentence");
      }
      if (founderPhoto) {
        founderPhoto.addEventListener("load", function () {
          console.log(
            "SeenShot site: founder photo loaded natural=" +
              founderPhoto.naturalWidth + "x" + founderPhoto.naturalHeight +
              " src=" + (founderPhoto.getAttribute("src") || "") +
              " loading=" + (founderPhoto.getAttribute("loading") || "")
          );
        });
        founderPhoto.addEventListener("error", function () {
          console.warn("SeenShot site: founder photo missing src=" + founderPhoto.getAttribute("src"));
        });
        // ─── Ariadne's Thread [AT-0461] ─────────────────────
        // What: Log founder photo src and natural size when already cached
        // Why:  Cache-bust v=0461 must show the new sunglasses avatar even on complete
        // Date: 2026-09-03
        // Related: [AT-0461] components/LandingMain.tsx:.founder img, [AT-0265] lib/client/releases.ts:.founder
        // ─────────────────────────────────────────────────────
        if (founderPhoto.complete && founderPhoto.naturalWidth > 0) {
          console.log(
            "SeenShot site: founder photo already complete natural=" +
              founderPhoto.naturalWidth + "x" + founderPhoto.naturalHeight +
              " src=" + (founderPhoto.getAttribute("src") || "")
          );
        }
      }
    }
    const bentoShots = document.querySelectorAll(".bento-shot");
    const bentoCards = document.querySelectorAll(".bento-card");
    console.log("SeenShot site: bento shots=" + bentoShots.length + " cards=" + bentoCards.length);
    // ─── Ariadne's Thread [AT-0452] ─────────────────────
    // What: Log Features bento order after Show area moved first
    // Why:  card[0] must be Show area for agent, card[1]/[2] Blur and Share
    // Date: 2026-09-03
    // Related: [AT-0452] components/LandingMain.tsx:.bento, [AT-0013] lib/client/releases.ts:bentoCards
    // ─────────────────────────────────────────────────────
    console.log(
      "SeenShot site: bento order first=" + (bentoCards[0] && bentoCards[0].querySelector("h3") ? bentoCards[0].querySelector("h3").textContent : "") +
        " second=" + (bentoCards[1] && bentoCards[1].querySelector("h3") ? bentoCards[1].querySelector("h3").textContent : "") +
        " third=" + (bentoCards[2] && bentoCards[2].querySelector("h3") ? bentoCards[2].querySelector("h3").textContent : "")
    );
    // ─── Ariadne's Thread [AT-0631] ─────────────────────
    // What: Log Auto Blur bento p copy
    // Why:  Features Blur card must keep the AI Agents and offline sentence
    // Date: 2026-09-06
    // Related: [AT-0631] components/LandingMain.tsx:.bento-card p, [AT-0452] lib/client/releases.ts:bentoCards
    // ─────────────────────────────────────────────────────
    const blurBento = Array.prototype.find.call(bentoCards, function (card) {
      const title = card.querySelector("h3")
      return title && title.textContent === "Auto Blur Sensitive data"
    })
    const blurCopy = blurBento ? blurBento.querySelector("p") : null
    const blurCopyText = blurCopy ? (blurCopy.textContent || "").trim() : ""
    const blurCopyBox = blurCopy ? blurCopy.getBoundingClientRect() : null
    const expectedBlurCopy = "Keep protect any sensitive data from AI Agents. Phones, faces, passwords, API keys. No need API keys, working offline"
    console.log(
      "SeenShot site: blur-bento=" + Boolean(blurBento) +
        " copy=" + blurCopyText +
        " chars=" + blurCopyText.length +
        " valid=" + String(blurCopyText === expectedBlurCopy) +
        " hasAiAgents=" + String(blurCopyText.indexOf("AI Agents") !== -1) +
        " hasOffline=" + String(blurCopyText.indexOf("working offline") !== -1) +
        " width=" + (blurCopyBox ? Math.round(blurCopyBox.width) : 0) +
        " height=" + (blurCopyBox ? Math.round(blurCopyBox.height) : 0)
    )
    if (blurCopyText !== expectedBlurCopy) {
      console.error("SeenShot site: Blur bento p is missing or not the AI Agents offline sentence")
    }
    // ─── Ariadne's Thread [AT-0488] ─────────────────────
    // What: Log Share bento LedeAgents under Supports all AI Agents
    // Why:  One-click Share card must reuse the same Instant sharing marks as Free pricing
    // Date: 2026-09-04
    // Related: [AT-0488] components/LandingMain.tsx:.bento-card.narrow, [AT-0451] components/LedeAgents.tsx:LedeAgents
    // ─────────────────────────────────────────────────────
    const shareBento = Array.prototype.find.call(bentoCards, function (card) {
      const title = card.querySelector("h3");
      return title && title.textContent === "One-click Share";
    });
    const shareCopy = shareBento ? shareBento.querySelector("p") : null;
    const shareAgents = shareBento ? shareBento.querySelector(".lede-agents") : null;
    const shareAgentMarks = shareAgents ? shareAgents.querySelectorAll(".lede-agent") : [];
    const shareCopyBox = shareCopy ? shareCopy.getBoundingClientRect() : null;
    const shareAgentsBox = shareAgents ? shareAgents.getBoundingClientRect() : null;
    const shareAgentsCs = shareAgents ? window.getComputedStyle(shareAgents) : null;
    console.log(
      "SeenShot site: share-bento=" + Boolean(shareBento) +
        " copy=" + (shareCopy ? shareCopy.textContent : "") +
        " agents=" + Boolean(shareAgents) +
        " marks=" + shareAgentMarks.length +
        " label=" + (shareAgents ? (shareAgents.getAttribute("aria-label") || "") : "") +
        " afterCopy=" + Boolean(shareCopy && shareAgents && shareCopy.nextElementSibling === shareAgents) +
        " belowCopy=" + Boolean(shareCopyBox && shareAgentsBox && shareAgentsBox.top >= shareCopyBox.bottom - 1) +
        " display=" + (shareAgentsCs ? shareAgentsCs.display : "") +
        " wrap=" + (shareAgentsCs ? shareAgentsCs.flexWrap : "") +
        " width=" + (shareAgentsBox ? Math.round(shareAgentsBox.width) : 0) +
        " height=" + (shareAgentsBox ? Math.round(shareAgentsBox.height) : 0)
    );
    shareAgentMarks.forEach(function (mark, index) {
      const markBox = mark.getBoundingClientRect();
      console.log(
        "SeenShot site: share-bento mark[" + index + "] tag=" + mark.tagName +
          " class=" + mark.className +
          " w=" + Math.round(markBox.width) +
          " h=" + Math.round(markBox.height) +
          " x=" + Math.round(markBox.left) +
          " y=" + Math.round(markBox.top)
      );
    });
    bentoCards.forEach(function (card, index) {
      const title = card.querySelector("h3");
      console.log(
        "SeenShot site: bento card[" + index + "] class=" + card.className +
          " title=" + (title ? title.textContent : "") +
          " fullSplit=" + card.classList.contains("full")
      );
    });
    // ─── Ariadne's Thread [AT-0490] ─────────────────────
    // What: Log Photo bento h3 is add your selfie at screen shot
    // Why:  Features Photo card must name the selfie-on-screenshot use, not Photo
    // Date: 2026-09-04
    // Related: [AT-0490] components/LandingMain.tsx:.bento-card.wide h3, [AT-0447] components/LandingMain.tsx:.bento-card h3
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0492] ─────────────────────
    // What: Log Photo bento h3 sentence case Add your selfie at screen shot
    // Why:  Features h3 must start with a capital like Show steps
    // Date: 2026-09-04
    // Related: [AT-0492] components/LandingMain.tsx:.bento-card.wide h3, [AT-0490] lib/client/releases.ts:photoTitle
    // ─────────────────────────────────────────────────────
    const photoBento = Array.prototype.find.call(bentoCards, function (card) {
      return card.classList.contains("wide") && card.querySelector("img.bento-shot") &&
        (card.querySelector("img.bento-shot").getAttribute("src") || "").indexOf("01-photo") !== -1;
    });
    const photoTitle = photoBento ? photoBento.querySelector("h3") : null;
    const photoTitleText = photoTitle ? (photoTitle.textContent || "").trim() : "";
    const validPhotoTitle = photoTitleText === "Add your selfie at screen shot";
    console.log(
      "SeenShot site: photo-bento=" + Boolean(photoBento) +
        " title=" + photoTitleText +
        " valid=" + String(validPhotoTitle)
    );
    if (!validPhotoTitle) {
      console.error("SeenShot site: Photo bento h3 is missing or not Add your selfie at screen shot");
    }
    // ─── Ariadne's Thread [AT-0493] ─────────────────────
    // What: Log Background bento shot src /bento/06-background.jpg?v=0493
    // Why:  Features Background card must show the supplied presentation screenshot
    // Date: 2026-09-04
    // Related: [AT-0493] components/LandingMain.tsx:.bento-shot, [AT-0486] lib/client/releases.ts:.bento-shot
    // ─────────────────────────────────────────────────────
    const backgroundBento = Array.prototype.find.call(bentoCards, function (card) {
      const title = card.querySelector("h3");
      return title && title.textContent === "Background";
    });
    const backgroundShot = backgroundBento ? backgroundBento.querySelector("img.bento-shot") : null;
    const backgroundCopy = backgroundBento ? backgroundBento.querySelector(".bento-copy p") : null;
    const backgroundSrc = backgroundShot ? (backgroundShot.getAttribute("src") || "") : "";
    const backgroundCopyText = backgroundCopy ? (backgroundCopy.textContent || "").trim() : "";
    const validBackgroundSrc = backgroundSrc === "/bento/06-background.jpg?v=0493";
    const validBackgroundCopy = backgroundCopyText === "Create sexy presentation from your screenshots.";
    // ─── Ariadne's Thread [AT-0494] ─────────────────────
    // What: Log Background bento p is Create sexy presentation from your screenshots.
    // Why:  Features copy must name the sexy presentation use, not the agent-add-to-project sentence
    // Date: 2026-09-04
    // Related: [AT-0494] components/LandingMain.tsx:.bento-copy p, [AT-0493] lib/client/releases.ts:backgroundSrc
    // ─────────────────────────────────────────────────────
    console.log(
      "SeenShot site: background-bento=" + Boolean(backgroundBento) +
        " src=" + backgroundSrc +
        " complete=" + (backgroundShot ? String(backgroundShot.complete) : "none") +
        " natural=" + (backgroundShot ? backgroundShot.naturalWidth + "x" + backgroundShot.naturalHeight : "none") +
        " validSrc=" + String(validBackgroundSrc) +
        " copy=" + backgroundCopyText +
        " validCopy=" + String(validBackgroundCopy)
    );
    if (!validBackgroundSrc) {
      console.error("SeenShot site: Background bento shot src is missing or not /bento/06-background.jpg?v=0493");
    }
    if (!validBackgroundCopy) {
      console.error("SeenShot site: Background bento p is missing or not Create sexy presentation from your screenshots.");
    }
    bentoShots.forEach(function (shot, index) {
      // ─── Ariadne's Thread [AT-0486] ─────────────────────
      // What: Log VIDEO and IMG .bento-shot from the same Features query
      // Why:  Blur is auto-blur-demo-2.mp4; other cards stay imgs; no parallel bento media path
      // Date: 2026-09-04
      // Related: [AT-0486] components/LandingMain.tsx:video.bento-shot, [AT-0483] lib/client/releases.ts:.bento-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
      // ─────────────────────────────────────────────────────
      const source = shot.querySelector("source");
      const src = shot.getAttribute("src") || (source ? source.getAttribute("src") : "") || "";
      if (shot.tagName === "VIDEO") {
        console.log(
          "SeenShot site: bento[" + index + "] tag=VIDEO src=" + src +
            " poster=" + (shot.getAttribute("poster") || "") +
            " preload=" + (shot.getAttribute("preload") || "") +
            " muted=" + String(shot.muted) +
            " loop=" + String(shot.loop) +
            " paused=" + String(shot.paused)
        );
        shot.addEventListener("loadeddata", function () {
          console.log(
            "SeenShot site: bento video loaded src=" + src +
              " video=" + shot.videoWidth + "x" + shot.videoHeight +
              " display=" + shot.clientWidth + "x" + shot.clientHeight +
              " duration=" + shot.duration +
              " preload=" + (shot.getAttribute("preload") || "")
          );
        });
        shot.addEventListener("playing", function () {
          console.log(
            "SeenShot site: bento video playing src=" + src +
              " paused=" + String(shot.paused) +
              " currentTime=" + shot.currentTime
          );
        });
        shot.addEventListener("error", function () {
          console.warn("SeenShot site: bento video missing src=" + src + " hide until auto-blur-demo-2.mp4 exists");
          shot.hidden = true;
        });
        return;
      }
      console.log(
        "SeenShot site: bento[" + index + "] src=" + src +
          " complete=" + shot.complete +
          " loading=" + (shot.getAttribute("loading") || "") +
          " decoding=" + (shot.getAttribute("decoding") || "")
      );
      shot.addEventListener("load", function () {
        console.log(
          "SeenShot site: bento loaded src=" + src +
            " natural=" + shot.naturalWidth + "x" + shot.naturalHeight
        );
      });
      shot.addEventListener("error", function () {
        console.warn("SeenShot site: bento missing src=" + src + " hide until file exists");
        shot.hidden = true;
      });
    });
    // ─── Ariadne's Thread [AT-0477] ─────────────────────
    // What: Log Wall of Love cards, IH links, and avatar lazy loading
    // Why:  Each testimonial must keep its commentId URL and lazy avatar attrs
    // Date: 2026-09-03
    // Related: [AT-0475] components/WallOfLove.tsx, [AT-0474] content/wall-of-love.ts
    // ─────────────────────────────────────────────────────
    const wallSection = document.querySelector(".wall-of-love");
    const wallCards = document.querySelectorAll(".wall-of-love-card");
    const wallLinks = document.querySelectorAll(".wall-of-love-link");
    const wallHeading = document.getElementById("wall-of-love-heading");
    console.log(
      "SeenShot site: wallOfLove section=" + Boolean(wallSection) +
        " heading=" + (wallHeading ? wallHeading.textContent : "") +
        " cards=" + wallCards.length +
        " links=" + wallLinks.length
    );
    wallLinks.forEach(function (link, index) {
      const commentId = link.getAttribute("data-comment-id") || "";
      const href = link.getAttribute("href") || "";
      const name = link.querySelector(".wall-of-love-name");
      const avatar = link.querySelector(".wall-of-love-avatar");
      const body = link.querySelector(".wall-of-love-body");
      const validHref = href.indexOf("commentId=" + commentId) !== -1;
      console.log(
        "SeenShot site: wallOfLove[" + index + "] id=" + commentId +
          " name=" + (name ? name.textContent : "") +
          " href=" + href +
          " validHref=" + String(validHref) +
          " avatar=" + (avatar ? (avatar.getAttribute("src") || "") : "") +
          " avatarLoading=" + (avatar ? (avatar.getAttribute("loading") || "") : "") +
          " bodyChars=" + (body ? (body.textContent || "").length : 0)
      );
      if (!validHref) {
        console.error("SeenShot site: wallOfLove[" + index + "] comment URL missing commentId=" + commentId);
      }
      if (avatar) {
        avatar.addEventListener("load", function () {
          console.log(
            "SeenShot site: wallOfLove avatar loaded index=" + index +
              " natural=" + avatar.naturalWidth + "x" + avatar.naturalHeight +
              " src=" + (avatar.getAttribute("src") || "")
          );
        });
        avatar.addEventListener("error", function () {
          console.warn(
            "SeenShot site: wallOfLove avatar missing index=" + index +
              " src=" + (avatar.getAttribute("src") || "")
          );
        });
      }
    });
    if (document.querySelector(".hero")) {
    if (!wallSection) {
      console.error("SeenShot site: Wall of Love section missing");
    } else if (wallCards.length !== 8) {
      console.error("SeenShot site: Wall of Love expected 8 cards got=" + wallCards.length);
    }
    }
    // ─── Ariadne's Thread [AT-0521] ─────────────────────
    // What: Log the Compare Description row above Price, then 96 landscape features
    // Why:  A missing Description row or Price first means the shape block dropped
    // Date: 2026-09-05
    // Related: [AT-0521] components/LandingMain.tsx:.compare-section, [AT-0521] content/landing-compare.ts
    // ─────────────────────────────────────────────────────
    if (landing && document.querySelector(".compare-section")) {
    const compareSection = document.querySelector(".compare-section");
    const compareHeading = document.getElementById("compare-heading");
    // ─── Ariadne's Thread [AT-0527] ─────────────────────
    // What: Log that Compare no longer has .compare-note
    // Why:  The selected intro paragraph must stay off the landing
    // Date: 2026-09-05
    // Related: [AT-0527] components/LandingMain.tsx:.compare-section, [AT-0521] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const compareNote = compareSection ? compareSection.querySelector(".compare-note") : null;
    const compareTable = compareSection ? compareSection.querySelector("table.compare") : null;
    const compareHeadCells = compareTable ? compareTable.querySelectorAll("thead th[data-app]") : [];
    const compareFeatureRows = compareTable ? compareTable.querySelectorAll("tbody tr[data-feature]") : [];
    const compareGroupRows = compareTable ? compareTable.querySelectorAll("tbody tr[data-group]") : [];
    const compareApps = [];
    const compareFeatures = [];
    const compareGroups = [];
    const compareBanned = ["Snagit", "ShareX", "PicPick", "Flameshot", "CaseGuard", "Screenpresso", "Xnapper"];
    const compareBannedHits = [];
    const seenShotDashHits = [];
    Array.prototype.forEach.call(compareHeadCells, function (cell) {
      const app = cell.getAttribute("data-app") || cell.textContent || "";
      const href = cell.querySelector("a") ? cell.querySelector("a").getAttribute("href") : "";
      compareApps.push(app);
      console.log(
        "SeenShot site: compare product[" + compareApps.length + "] app=" + app +
          " href=" + href
      );
    });
    Array.prototype.forEach.call(compareGroupRows, function (row) {
      const group = row.getAttribute("data-group") || "";
      compareGroups.push(group);
      console.log("SeenShot site: compare group=" + group);
    });
    Array.prototype.forEach.call(compareFeatureRows, function (row) {
      const featureKey = row.getAttribute("data-feature") || "";
      const featureLabel = row.cells[0] ? row.cells[0].textContent : "";
      compareFeatures.push(featureKey);
      const seenShotCell = row.querySelector('td[data-app="SeenShot"]');
      const blurDataCell = row.querySelector('td[data-app="BlurData"]');
      const redactedCell = row.querySelector('td[data-app="Redacted"]');
      const zightCell = row.querySelector('td[data-app="Zight"]');
      const seenShotValue = seenShotCell ? seenShotCell.textContent : "";
      if (featureKey !== "description" && featureKey !== "price" && seenShotValue === "—") {
        seenShotDashHits.push(featureKey);
      }
      console.log(
        "SeenShot site: compare feature[" + compareFeatures.length + "] key=" + featureKey +
          " label=" + featureLabel +
          " seenShot=" + seenShotValue +
          " zight=" + (zightCell ? zightCell.textContent : "") +
          " blurData=" + (blurDataCell ? blurDataCell.textContent : "") +
          " redacted=" + (redactedCell ? redactedCell.textContent : "")
      );
    });
    compareBanned.forEach(function (name) {
      if (compareSection && compareSection.textContent.indexOf(name) !== -1) {
        compareBannedHits.push(name);
      }
    });
    const pricingHeading = Array.prototype.find.call(document.querySelectorAll("main.landing h2"), function (heading) {
      return heading.textContent === "Pricing";
    });
    // ─── Ariadne's Thread [AT-0562] ─────────────────────
    // What: Require Compare to sit immediately before landing #pricing
    // Why:  Homepage Pricing returned after Compare; /pricing stays the Polar Buy page
    // Date: 2026-09-05
    // Related: [AT-0562] components/LandingMain.tsx:#pricing, [AT-0556] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const compareBeforePricing = Boolean(
      compareSection && pricingHeading && compareSection.nextElementSibling === pricingHeading
    );
    const priceRow = compareTable ? compareTable.querySelector('tbody tr[data-feature="price"]') : null;
    const descriptionRow = compareTable ? compareTable.querySelector('tbody tr[data-feature="description"]') : null;
    const captureRow = compareTable ? compareTable.querySelector('tbody tr[data-feature="f01"]') : null;
    const scrollRow = compareTable ? compareTable.querySelector('tbody tr[data-feature="f02"]') : null;
    const lastRow = compareTable ? compareTable.querySelector('tbody tr[data-feature="f93"]') : null;
    // ─── Ariadne's Thread [AT-0531] ─────────────────────
    // What: Log Feature-column th type against .compare-price
    // Why:  Feature names must use the same font-size, weight, and line-height as Price cells
    // Date: 2026-09-05
    // Related: [AT-0531] app/site.css:.compare tbody th, [AT-0520] app/site.css:.compare-price
    // ─────────────────────────────────────────────────────
    const featureLabelTh = compareTable
      ? compareTable.querySelector('tbody tr[data-feature="f01"] > th[scope="row"]')
      : null;
    const priceTd = compareTable ? compareTable.querySelector("td.compare-price[data-app=\"Zight\"]") : null;
    const featureLabelCs = featureLabelTh ? getComputedStyle(featureLabelTh) : null;
    const priceCs = priceTd ? getComputedStyle(priceTd) : null;
    const featureLabelFontMatch = Boolean(
      featureLabelCs &&
      priceCs &&
      featureLabelCs.fontSize === priceCs.fontSize &&
      featureLabelCs.fontWeight === priceCs.fontWeight &&
      featureLabelCs.lineHeight === priceCs.lineHeight &&
      featureLabelCs.fontFamily === priceCs.fontFamily &&
      featureLabelCs.fontVariantNumeric === priceCs.fontVariantNumeric
    );
    console.log(
      "SeenShot site: compare featureLabel fontSize=" + (featureLabelCs ? featureLabelCs.fontSize : "") +
        " fontWeight=" + (featureLabelCs ? featureLabelCs.fontWeight : "") +
        " lineHeight=" + (featureLabelCs ? featureLabelCs.lineHeight : "") +
        " fontFamily=" + (featureLabelCs ? featureLabelCs.fontFamily : "") +
        " variant=" + (featureLabelCs ? featureLabelCs.fontVariantNumeric : "") +
        " label=" + (featureLabelTh ? (featureLabelTh.textContent || "").trim() : "") +
        " priceFontSize=" + (priceCs ? priceCs.fontSize : "") +
        " priceFontWeight=" + (priceCs ? priceCs.fontWeight : "") +
        " priceLineHeight=" + (priceCs ? priceCs.lineHeight : "") +
        " priceFamily=" + (priceCs ? priceCs.fontFamily : "") +
        " priceVariant=" + (priceCs ? priceCs.fontVariantNumeric : "") +
        " match=" + featureLabelFontMatch
    );
    // ─── Ariadne's Thread [AT-0546] ─────────────────────
    // What: Require SeenShot Compare Description and Price type to match Zight Description
    // Why:  Those two SeenShot cells must not stay at font-weight 800
    // Date: 2026-09-05
    // Related: [AT-0546] app/site.css:.compare-desc, [AT-0531] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const seenShotDescTd = compareTable ? compareTable.querySelector('td.compare-desc[data-app="SeenShot"]') : null;
    const zightDescTd = compareTable ? compareTable.querySelector('td.compare-desc[data-app="Zight"]') : null;
    const seenShotPriceTd = compareTable ? compareTable.querySelector('td.compare-price[data-app="SeenShot"]') : null;
    const seenShotDescCs = seenShotDescTd ? getComputedStyle(seenShotDescTd) : null;
    const zightDescCs = zightDescTd ? getComputedStyle(zightDescTd) : null;
    const seenShotPriceTypeCs = seenShotPriceTd ? getComputedStyle(seenShotPriceTd) : null;
    const seenShotDescFontMatch = Boolean(
      seenShotDescCs &&
      zightDescCs &&
      seenShotDescCs.fontSize === zightDescCs.fontSize &&
      seenShotDescCs.fontWeight === zightDescCs.fontWeight &&
      seenShotDescCs.lineHeight === zightDescCs.lineHeight &&
      seenShotDescCs.fontFamily === zightDescCs.fontFamily &&
      seenShotDescCs.fontWeight === "400"
    );
    const seenShotPriceFontMatch = Boolean(
      seenShotPriceTypeCs &&
      zightDescCs &&
      seenShotPriceTypeCs.fontSize === zightDescCs.fontSize &&
      seenShotPriceTypeCs.fontWeight === zightDescCs.fontWeight &&
      seenShotPriceTypeCs.lineHeight === zightDescCs.lineHeight &&
      seenShotPriceTypeCs.fontFamily === zightDescCs.fontFamily &&
      seenShotPriceTypeCs.fontWeight === "400"
    );
    console.log(
      "SeenShot site: compare seenShotDesc fontSize=" + (seenShotDescCs ? seenShotDescCs.fontSize : "") +
        " fontWeight=" + (seenShotDescCs ? seenShotDescCs.fontWeight : "") +
        " lineHeight=" + (seenShotDescCs ? seenShotDescCs.lineHeight : "") +
        " fontFamily=" + (seenShotDescCs ? seenShotDescCs.fontFamily : "") +
        " zightDescFontSize=" + (zightDescCs ? zightDescCs.fontSize : "") +
        " zightDescFontWeight=" + (zightDescCs ? zightDescCs.fontWeight : "") +
        " zightDescLineHeight=" + (zightDescCs ? zightDescCs.lineHeight : "") +
        " zightDescFamily=" + (zightDescCs ? zightDescCs.fontFamily : "") +
        " seenShotPriceFontSize=" + (seenShotPriceTypeCs ? seenShotPriceTypeCs.fontSize : "") +
        " seenShotPriceFontWeight=" + (seenShotPriceTypeCs ? seenShotPriceTypeCs.fontWeight : "") +
        " seenShotPriceLineHeight=" + (seenShotPriceTypeCs ? seenShotPriceTypeCs.lineHeight : "") +
        " seenShotPriceFamily=" + (seenShotPriceTypeCs ? seenShotPriceTypeCs.fontFamily : "") +
        " seenShotDescFontMatch=" + seenShotDescFontMatch +
        " seenShotPriceFontMatch=" + seenShotPriceFontMatch
    );
    const seenShotPrice = priceRow && priceRow.querySelector('td[data-app="SeenShot"]')
      ? priceRow.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    // ─── Ariadne's Thread [AT-0545] ─────────────────────
    // What: Require SeenShot Compare Price to be Free, $29/year, Lifetime $87
    // Why:  Member must not remain in that matrix cell
    // Date: 2026-09-05
    // Related: [AT-0545] content/landing-compare.ts, [AT-0524] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const expectedSeenShotPrice = "Free, $29/year, Lifetime $87";
    const seenShotPriceHasMember = seenShotPrice.indexOf("Member") !== -1;
    console.log(
      "SeenShot site: compare seenShotPrice=" + seenShotPrice +
        " expectedSeenShotPrice=" + expectedSeenShotPrice +
        " seenShotPriceHasMember=" + seenShotPriceHasMember
    );
    const blurDataCapture = captureRow && captureRow.querySelector('td[data-app="BlurData"]')
      ? captureRow.querySelector('td[data-app="BlurData"]').textContent
      : "";
    const redactedCapture = captureRow && captureRow.querySelector('td[data-app="Redacted"]')
      ? captureRow.querySelector('td[data-app="Redacted"]').textContent
      : "";
    const zightCapture = captureRow && captureRow.querySelector('td[data-app="Zight"]')
      ? captureRow.querySelector('td[data-app="Zight"]').textContent
      : "";
    const seenShotCapture = captureRow && captureRow.querySelector('td[data-app="SeenShot"]')
      ? captureRow.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotScroll = scrollRow && scrollRow.querySelector('td[data-app="SeenShot"]')
      ? scrollRow.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const f03Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f03"]') : null;
    const f23Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f23"]') : null;
    const f24Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f24"]') : null;
    const seenShotF03 = f03Row && f03Row.querySelector('td[data-app="SeenShot"]')
      ? f03Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF23 = f23Row && f23Row.querySelector('td[data-app="SeenShot"]')
      ? f23Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF24 = f24Row && f24Row.querySelector('td[data-app="SeenShot"]')
      ? f24Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const zightScroll = scrollRow && scrollRow.querySelector('td[data-app="Zight"]')
      ? scrollRow.querySelector('td[data-app="Zight"]').textContent
      : "";
    const seenShotDescription = descriptionRow && descriptionRow.querySelector('td[data-app="SeenShot"]')
      ? descriptionRow.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    // ─── Ariadne's Thread [AT-0522] ─────────────────────
    // What: Require SeenShot Description to be Fast, Free, Secure Screenshots in Agentic Era
    // Why:  The landscape shape must not remain in the SeenShot Compare cell
    // Date: 2026-09-05
    // Related: [AT-0522] content/landing-compare.ts, [AT-0521] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const blurDataDescription = descriptionRow && descriptionRow.querySelector('td[data-app="BlurData"]')
      ? descriptionRow.querySelector('td[data-app="BlurData"]').textContent
      : "";
    const zightDescription = descriptionRow && descriptionRow.querySelector('td[data-app="Zight"]')
      ? descriptionRow.querySelector('td[data-app="Zight"]').textContent
      : "";
    const seenShotFirst = compareApps[0] === "SeenShot";
    // ─── Ariadne's Thread [AT-0528] ─────────────────────
    // What: Require #compare-heading to be Landscape of MacOS tool for screenshot & Blur data
    // Why:  The Compare title must match the selected landscape label
    // Date: 2026-09-05
    // Related: [AT-0528] components/LandingMain.tsx:#compare-heading, [AT-0521] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const expectedHeading = "Landscape of MacOS tool for screenshot & Blur data";
    const expectedApps = "SeenShot,Zight,Droplr,Gyazo,Loom,CleanShot,Shottr,BlurData,Redacted";
    const expectedFirst = "description";
    const expectedSecond = "price";
    const expectedLast = "f93";
    const hasVolumeHeader = Boolean(
      compareTable && compareTable.textContent.indexOf("Feature mentions") !== -1
    );
    // ─── Ariadne's Thread [AT-0524] ─────────────────────
    // What: Fail Compare if visible section text still contains a semicolon
    // Why:  Compare copy must not show ; in the note or cells
    // Date: 2026-09-05
    // Related: [AT-0524] content/landing-compare.ts, [AT-0521] components/LandingMain.tsx:.compare-section
    // ─────────────────────────────────────────────────────
    const compareSemicolon = compareSection && compareSection.textContent.indexOf(";") !== -1;
    // ─── Ariadne's Thread [AT-0529] ─────────────────────
    // What: Fail Compare if Screen recording f11-f17 or the SCREEN RECORDING group remain
    // Why:  Screen recording is out of scope for this screenshot and blur matrix
    // Date: 2026-09-05
    // Related: [AT-0529] content/landing-compare.ts, [AT-0521] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const recordingKeys = ["f11", "f12", "f13", "f14", "f15", "f16", "f17"];
    const recordingRows = recordingKeys.filter(function (key) {
      return compareFeatures.indexOf(key) !== -1;
    });
    const recordingGroup = compareGroups.indexOf("Screen recording") !== -1;
    const recordingCopy = Boolean(
      compareSection &&
      (
        compareSection.textContent.indexOf("Screen recording") !== -1 ||
        compareSection.textContent.indexOf("Video recording of screen") !== -1
      )
    );
    console.log(
      "SeenShot site: compare recordingGroup=" + recordingGroup +
        " recordingRows=" + recordingRows.join(",") +
        " recordingCopy=" + recordingCopy +
        " groups=" + compareGroups.join("|")
    );
    // ─── Ariadne's Thread [AT-0530] ─────────────────────
    // What: Fail Compare if Commercial & packaging f94-f96 remain
    // Why:  Plan packaging lives in Price, not a second commercial group
    // Date: 2026-09-05
    // Related: [AT-0530] content/landing-compare.ts, [AT-0529] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const commercialKeys = ["f94", "f95", "f96"];
    const commercialRows = commercialKeys.filter(function (key) {
      return compareFeatures.indexOf(key) !== -1;
    });
    const commercialGroup = compareGroups.indexOf("Commercial & packaging") !== -1;
    const commercialCopy = Boolean(
      compareSection &&
      (
        compareSection.textContent.indexOf("Commercial & packaging") !== -1 ||
        compareSection.textContent.indexOf("Free tier or trial") !== -1
      )
    );
    console.log(
      "SeenShot site: compare commercialGroup=" + commercialGroup +
        " commercialRows=" + commercialRows.join(",") +
        " commercialCopy=" + commercialCopy +
        " lastFeature=" + (compareFeatures[compareFeatures.length - 1] || "")
    );
    // ─── Ariadne's Thread [AT-0533] ─────────────────────
    // What: Fail Compare if f83 MDM remains and require SeenShot f89, f90, f91, f93 Yes
    // Why:  The selected MDM row is gone and those four SeenShot dashes must stay Yes
    // Date: 2026-09-05
    // Related: [AT-0532] content/landing-compare.ts, [AT-0530] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const mdmKey = "f83";
    const mdmRow = compareFeatures.indexOf(mdmKey) !== -1;
    const mdmCopy = Boolean(
      compareSection &&
      (
        compareSection.textContent.indexOf("Group policy / MDM deployment") !== -1 ||
        compareSection.textContent.indexOf("MDM deployment") !== -1
      )
    );
    const f89Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f89"]') : null;
    const f90Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f90"]') : null;
    const f91Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f91"]') : null;
    const f93Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f93"]') : null;
    const seenShotF89 = f89Row && f89Row.querySelector('td[data-app="SeenShot"]')
      ? f89Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF90 = f90Row && f90Row.querySelector('td[data-app="SeenShot"]')
      ? f90Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF91 = f91Row && f91Row.querySelector('td[data-app="SeenShot"]')
      ? f91Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF93 = f93Row && f93Row.querySelector('td[data-app="SeenShot"]')
      ? f93Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    // ─── Ariadne's Thread [AT-0542] ─────────────────────
    // What: Require Compare group Platform with MacOS Arm, MacOS x86, and Windows – in development
    // Why:  Platform & UX and macOS desktop apps must not remain as the last block
    // Date: 2026-09-05
    // Related: [AT-0542] content/landing-compare.ts, [AT-0540] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const platformGroup = compareGroups.indexOf("Platform") !== -1;
    const oldPlatformGroup = compareGroups.indexOf("Platform & UX") !== -1;
    const platformF92 = compareFeatures.indexOf("f92") !== -1;
    const platformF105 = compareFeatures.indexOf("f105") !== -1;
    const platformF106 = compareFeatures.indexOf("f106") !== -1;
    const platformCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("MacOS Arm") !== -1 &&
      compareSection.textContent.indexOf("MacOS x86") !== -1 &&
      compareSection.textContent.indexOf("Windows – in development") !== -1 &&
      compareSection.textContent.indexOf("macOS desktop apps") === -1 &&
      compareSection.textContent.indexOf("Platform & UX") === -1
    );
    const f92Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f92"]') : null;
    const f105Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f105"]') : null;
    const f106Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f106"]') : null;
    const seenShotF92 = f92Row && f92Row.querySelector('td[data-app="SeenShot"]')
      ? f92Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF105 = f105Row && f105Row.querySelector('td[data-app="SeenShot"]')
      ? f105Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF106 = f106Row && f106Row.querySelector('td[data-app="SeenShot"]')
      ? f106Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const f92Label = f92Row && f92Row.querySelector("th")
      ? (f92Row.querySelector("th").textContent || "").trim()
      : "";
    const f105Label = f105Row && f105Row.querySelector("th")
      ? (f105Row.querySelector("th").textContent || "").trim()
      : "";
    const f106Label = f106Row && f106Row.querySelector("th")
      ? (f106Row.querySelector("th").textContent || "").trim()
      : "";
    console.log(
      "SeenShot site: compare platformGroup=" + platformGroup +
        " oldPlatformGroup=" + oldPlatformGroup +
        " platformF92=" + platformF92 +
        " platformF105=" + platformF105 +
        " platformF106=" + platformF106 +
        " platformCopy=" + platformCopy +
        " f92Label=" + f92Label +
        " f105Label=" + f105Label +
        " f106Label=" + f106Label +
        " seenShotF92=" + seenShotF92 +
        " seenShotF105=" + seenShotF105 +
        " seenShotF106=" + seenShotF106 +
        " lastGroup=" + (compareGroups[compareGroups.length - 1] || "") +
        " featureCount=" + compareFeatures.length
    );
    console.log(
      "SeenShot site: compare mdmRow=" + mdmRow +
        " mdmCopy=" + mdmCopy +
        " mdmKey=" + mdmKey +
        " teamGroup=" + (compareGroups.indexOf("Team & admin") !== -1) +
        " seenShotF89=" + seenShotF89 +
        " seenShotF90=" + seenShotF90 +
        " seenShotF91=" + seenShotF91 +
        " seenShotF93=" + seenShotF93 +
        " featureCount=" + compareFeatures.length
    );
    // ─── Ariadne's Thread [AT-0535] ─────────────────────
    // What: Fail Compare if f75 MP4/MOV/GIF video export remains
    // Why:  That Export & formats row must stay off the landing matrix
    // Date: 2026-09-05
    // Related: [AT-0534] content/landing-compare.ts, [AT-0533] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const videoExportKey = "f75";
    const videoExportRow = compareFeatures.indexOf(videoExportKey) !== -1;
    const videoExportCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("MP4/MOV/GIF video export") !== -1
    );
    console.log(
      "SeenShot site: compare videoExportRow=" + videoExportRow +
        " videoExportCopy=" + videoExportCopy +
        " videoExportKey=" + videoExportKey +
        " exportGroup=" + (compareGroups.indexOf("Export & formats") !== -1) +
        " featureCount=" + compareFeatures.length
    );
    // ─── Ariadne's Thread [AT-0536] ─────────────────────
    // What: Require Compare Auto Blur group f97-f102 and SeenShot Yes on those six rows
    // Why:  The selected blur block must list sensitive data, faces, phones, passwords, emails, and API keys
    // Date: 2026-09-05
    // Related: [AT-0536] content/landing-compare.ts, [AT-0535] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const autoBlurKeys = ["f97", "f98", "f99", "f100", "f101", "f102"];
    const autoBlurGroup = compareGroups.indexOf("Auto Blur") !== -1;
    const autoBlurRows = autoBlurKeys.filter(function (key) {
      return compareFeatures.indexOf(key) !== -1;
    });
    const autoBlurCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("Auto-blur sensitive data") !== -1 &&
      compareSection.textContent.indexOf("Auto-blur faces") !== -1 &&
      compareSection.textContent.indexOf("Auto-blur phone numbers") !== -1 &&
      compareSection.textContent.indexOf("Auto-blur passwords") !== -1 &&
      compareSection.textContent.indexOf("Auto-blur emails") !== -1 &&
      compareSection.textContent.indexOf("Auto-blur API keys") !== -1
    );
    const seenShotAutoBlur = autoBlurKeys.map(function (key) {
      const row = compareTable ? compareTable.querySelector('tbody tr[data-feature="' + key + '"]') : null;
      const cell = row ? row.querySelector('td[data-app="SeenShot"]') : null;
      const value = cell ? cell.textContent : "";
      console.log("SeenShot site: compare autoBlur key=" + key + " seenShot=" + value);
      return value;
    });
    const seenShotAutoBlurYes = seenShotAutoBlur.every(function (value) {
      return value === "Yes";
    });
    console.log(
      "SeenShot site: compare autoBlurGroup=" + autoBlurGroup +
        " autoBlurRows=" + autoBlurRows.join(",") +
        " autoBlurCopy=" + autoBlurCopy +
        " autoBlurAfterCapture=" + String(compareFeatures[8] === "f97") +
        " seenShotAutoBlurYes=" + seenShotAutoBlurYes +
        " groups=" + compareGroups.join("|")
    );
    // ─── Ariadne's Thread [AT-0537] ─────────────────────
    // What: Require Compare Offline f77 after Auto Blur and SeenShot Yes
    // Why:  All features work without internet and without external APIs must stay on the matrix
    // Date: 2026-09-05
    // Related: [AT-0537] content/landing-compare.ts, [AT-0536] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const offlineKey = "f77";
    const offlineGroup = compareGroups.indexOf("Offline") !== -1;
    const offlineRow = compareFeatures.indexOf(offlineKey) !== -1;
    const offlineCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("All features work without internet and without external APIs") !== -1
    );
    const oldOfflineCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("100% offline / on-device processing option") !== -1
    );
    const offlineRowEl = compareTable ? compareTable.querySelector('tbody tr[data-feature="f77"]') : null;
    const seenShotOffline = offlineRowEl && offlineRowEl.querySelector('td[data-app="SeenShot"]')
      ? offlineRowEl.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    console.log(
      "SeenShot site: compare offlineGroup=" + offlineGroup +
        " offlineRow=" + offlineRow +
        " offlineCopy=" + offlineCopy +
        " oldOfflineCopy=" + oldOfflineCopy +
        " offlineAfterAgents=" + String(compareFeatures[16] === "f77") +
        " seenShotOffline=" + seenShotOffline +
        " groups=" + compareGroups.join("|")
    );
    // ─── Ariadne's Thread [AT-0538] ─────────────────────
    // What: Require Compare AI Agents f103 one-click export and f104 LedeAgents marks
    // Why:  One-click export to agents and the Share bento icons must sit in AI Agents
    // Date: 2026-09-05
    // Related: [AT-0541] frontend→components/LandingMain.tsx:.compare-agents, [AT-0451] components/LedeAgents.tsx:LedeAgents
    // ─────────────────────────────────────────────────────
    const agentsGroup = compareGroups.indexOf("AI Agents") !== -1;
    const agentsF103 = compareFeatures.indexOf("f103") !== -1;
    const agentsF104 = compareFeatures.indexOf("f104") !== -1;
    const agentsCopy = Boolean(
      compareSection &&
      compareSection.textContent.indexOf("One-click export to agents") !== -1 &&
      compareSection.textContent.indexOf("Supported agents") !== -1
    );
    const expectedAgents = "Claude, Claude Code, ChatGPT, Codex, Cursor, Hermes, OpenClaw, Grok Bot, OpenCode, and Pi";
    const expectedAgentsLabel = "Works with " + expectedAgents;
    const f103Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f103"]') : null;
    const f104Row = compareTable ? compareTable.querySelector('tbody tr[data-feature="f104"]') : null;
    const seenShotF103 = f103Row && f103Row.querySelector('td[data-app="SeenShot"]')
      ? f103Row.querySelector('td[data-app="SeenShot"]').textContent
      : "";
    const seenShotF104Cell = f104Row ? f104Row.querySelector('td[data-app="SeenShot"]') : null;
    const seenShotF104 = seenShotF104Cell ? seenShotF104Cell.textContent : "";
    const seenShotF104Agents = seenShotF104Cell ? seenShotF104Cell.querySelector(".lede-agents") : null;
    const seenShotF104Label = seenShotF104Agents ? seenShotF104Agents.getAttribute("aria-label") || "" : "";
    const seenShotF104Marks = seenShotF104Agents ? seenShotF104Agents.querySelectorAll(".lede-agent").length : 0;
    const shareBentoAgents = document.querySelector(".bento-card.narrow .lede-agents");
    const shareBentoMarks = shareBentoAgents ? shareBentoAgents.querySelectorAll(".lede-agent").length : 0;
    console.log(
      "SeenShot site: compare f104 agents=" + Boolean(seenShotF104Agents) +
        " label=" + seenShotF104Label +
        " marks=" + seenShotF104Marks +
        " shareMarks=" + shareBentoMarks +
        " dataCell=" + (seenShotF104Cell ? seenShotF104Cell.getAttribute("data-cell") : "") +
        " text=" + seenShotF104
    );
    console.log(
      "SeenShot site: compare agentsGroup=" + agentsGroup +
        " agentsF103=" + agentsF103 +
        " agentsF104=" + agentsF104 +
        " agentsCopy=" + agentsCopy +
        " agentsAfterAutoBlur=" + String(compareFeatures[14] === "f103" && compareFeatures[15] === "f104") +
        " seenShotF103=" + seenShotF103 +
        " seenShotF104=" + seenShotF104 +
        " seenShotF104Label=" + seenShotF104Label +
        " seenShotF104Marks=" + seenShotF104Marks +
        " shareBentoMarks=" + shareBentoMarks +
        " expectedAgents=" + expectedAgents +
        " groups=" + compareGroups.join("|")
    );
    // ─── Ariadne's Thread [AT-0539] ─────────────────────
    // What: Fail Compare if SeenShot still has a dash or a group with no SeenShot point
    // Why:  Dash rows and empty SeenShot blocks must stay off the matrix
    // Date: 2026-09-05
    // Related: [AT-0539] content/landing-compare.ts, [AT-0538] lib/client/releases.ts:compare
    // ─────────────────────────────────────────────────────
    const emptySeenShotGroups = [
      "Image editing",
      "Library & assets",
      "Integrations & API",
      "Export & formats",
      "Security & compliance",
      "Accessibility & localization"
    ];
    const emptySeenShotGroupHits = emptySeenShotGroups.filter(function (name) {
      return compareGroups.indexOf(name) !== -1;
    });
    console.log(
      "SeenShot site: compare seenShotDashHits=" + seenShotDashHits.join(",") +
        " emptySeenShotGroupHits=" + emptySeenShotGroupHits.join(",") +
        " featureCount=" + compareFeatures.length +
        " groups=" + compareGroups.length
    );
    console.log(
      "SeenShot site: compare heading=" + (compareHeading ? compareHeading.textContent : "") +
        " products=" + compareApps.length +
        " apps=" + compareApps.join(",") +
        " featureCount=" + compareFeatures.length +
        " firstFeature=" + (compareFeatures[0] || "") +
        " secondFeature=" + (compareFeatures[1] || "") +
        " lastFeature=" + (compareFeatures[compareFeatures.length - 1] || "") +
        " groups=" + compareGroups.length +
        " seenShotDescription=" + seenShotDescription +
        " zightDescription=" + zightDescription +
        " blurDataDescription=" + blurDataDescription +
        " seenShotPrice=" + seenShotPrice +
        " seenShotCapture=" + seenShotCapture +
        " zightCapture=" + zightCapture +
        " blurDataCapture=" + blurDataCapture +
        " redactedCapture=" + redactedCapture +
        " seenShotScroll=" + seenShotScroll +
        " seenShotF03=" + seenShotF03 +
        " seenShotF23=" + seenShotF23 +
        " seenShotF24=" + seenShotF24 +
        " zightScroll=" + zightScroll +
        " beforePricing=" + String(compareBeforePricing) +
        " volumeHeader=" + String(hasVolumeHeader) +
        " semicolon=" + String(compareSemicolon) +
        " notePresent=" + Boolean(compareNote) +
        " recordingGroup=" + recordingGroup +
        " recordingRows=" + recordingRows.join(",") +
        " recordingCopy=" + recordingCopy +
        " commercialGroup=" + commercialGroup +
        " commercialRows=" + commercialRows.join(",") +
        " commercialCopy=" + commercialCopy +
        " mdmRow=" + mdmRow +
        " mdmCopy=" + mdmCopy +
        " seenShotF89=" + seenShotF89 +
        " seenShotF90=" + seenShotF90 +
        " seenShotF91=" + seenShotF91 +
        " seenShotF93=" + seenShotF93 +
        " platformGroup=" + platformGroup +
        " oldPlatformGroup=" + oldPlatformGroup +
        " seenShotF92=" + seenShotF92 +
        " seenShotF105=" + seenShotF105 +
        " seenShotF106=" + seenShotF106 +
        " f92Label=" + f92Label +
        " f105Label=" + f105Label +
        " f106Label=" + f106Label +
        " videoExportRow=" + videoExportRow +
        " videoExportCopy=" + videoExportCopy +
        " autoBlurGroup=" + autoBlurGroup +
        " autoBlurRows=" + autoBlurRows.join(",") +
        " autoBlurCopy=" + autoBlurCopy +
        " seenShotAutoBlurYes=" + seenShotAutoBlurYes +
        " offlineGroup=" + offlineGroup +
        " offlineRow=" + offlineRow +
        " offlineCopy=" + offlineCopy +
        " oldOfflineCopy=" + oldOfflineCopy +
        " seenShotOffline=" + seenShotOffline +
        " agentsGroup=" + agentsGroup +
        " agentsF103=" + agentsF103 +
        " agentsF104=" + agentsF104 +
        " agentsCopy=" + agentsCopy +
        " seenShotF103=" + seenShotF103 +
        " seenShotF104=" + seenShotF104 +
        " seenShotF104Label=" + seenShotF104Label +
        " seenShotF104Marks=" + seenShotF104Marks +
        " shareBentoMarks=" + shareBentoMarks +
        " seenShotDashHits=" + seenShotDashHits.join(",") +
        " emptySeenShotGroupHits=" + emptySeenShotGroupHits.join(",") +
        " featureLabelFontMatch=" + featureLabelFontMatch +
        " seenShotDescFontMatch=" + seenShotDescFontMatch +
        " seenShotPriceFontMatch=" + seenShotPriceFontMatch +
        " bannedHits=" + compareBannedHits.join(",")
    );
    if (
      compareSection &&
      compareHeading &&
      compareHeading.textContent === expectedHeading &&
      !compareNote &&
      compareApps.join(",") === expectedApps &&
      compareFeatures.length === 46 &&
      compareFeatures[0] === expectedFirst &&
      compareFeatures[1] === expectedSecond &&
      compareFeatures[2] === "f01" &&
      compareFeatures[compareFeatures.length - 1] === expectedLast &&
      compareFeatures[42] === "f92" &&
      compareFeatures[43] === "f105" &&
      compareFeatures[44] === "f106" &&
      compareGroups.length === 13 &&
      compareGroups[0] === "Capture" &&
      compareGroups[1] === "Auto Blur" &&
      compareGroups[2] === "AI Agents" &&
      compareGroups[3] === "Offline" &&
      compareGroups[compareGroups.length - 1] === "Platform" &&
      autoBlurGroup &&
      autoBlurRows.length === 6 &&
      autoBlurCopy &&
      seenShotAutoBlurYes &&
      offlineGroup &&
      offlineRow &&
      offlineCopy &&
      !oldOfflineCopy &&
      compareFeatures[8] === "f97" &&
      seenShotOffline === "Yes" &&
      agentsGroup &&
      agentsF103 &&
      agentsF104 &&
      agentsCopy &&
      compareFeatures[14] === "f103" &&
      compareFeatures[15] === "f104" &&
      compareFeatures[16] === "f77" &&
      seenShotF103 === "Yes" &&
      Boolean(seenShotF104Agents) &&
      seenShotF104Cell.getAttribute("data-cell") === "agents" &&
      seenShotF104Label === expectedAgentsLabel &&
      seenShotF104Marks === shareBentoMarks &&
      seenShotF104Marks > 0 &&
      seenShotF104.indexOf(expectedAgents) === -1 &&
      seenShotDashHits.length === 0 &&
      emptySeenShotGroupHits.length === 0 &&
      !recordingGroup &&
      recordingRows.length === 0 &&
      !recordingCopy &&
      !commercialGroup &&
      commercialRows.length === 0 &&
      !commercialCopy &&
      !mdmRow &&
      !mdmCopy &&
      !videoExportRow &&
      !videoExportCopy &&
      seenShotF89 === "Yes" &&
      seenShotF90 === "Yes" &&
      seenShotF91 === "Yes" &&
      seenShotF92 === "Yes" &&
      seenShotF93 === "Yes" &&
      seenShotF105 === "Yes" &&
      seenShotF106 === "Yes" &&
      platformGroup &&
      !oldPlatformGroup &&
      platformF92 &&
      platformF105 &&
      platformF106 &&
      platformCopy &&
      f92Label === "MacOS Arm" &&
      f105Label === "MacOS x86" &&
      f106Label === "Windows – in development" &&
      featureLabelFontMatch &&
      seenShotDescFontMatch &&
      seenShotPriceFontMatch &&
      Boolean(descriptionRow) &&
      Boolean(lastRow) &&
      seenShotFirst &&
      seenShotDescription === "Fast, Free, Secure Screenshots in Agentic Era" &&
      zightDescription === "Capture-and-share" &&
      blurDataDescription === "Desktop redaction" &&
      seenShotPrice.trim() === expectedSeenShotPrice &&
      !seenShotPriceHasMember &&
      seenShotCapture === "Yes" &&
      zightCapture === "Yes" &&
      blurDataCapture === "No" &&
      redactedCapture === "No" &&
      seenShotScroll === "No" &&
      seenShotF03 === "Yes" &&
      seenShotF23 === "Yes" &&
      seenShotF24 === "Yes" &&
      zightScroll === "Yes" &&
      compareBeforePricing &&
      !hasVolumeHeader &&
      !compareSemicolon &&
      compareBannedHits.length === 0
    ) {
      console.log(
        "SeenShot site: compare table ok heading=" + expectedHeading +
          " products=9 features=46 first=Description second=Price third=f01 last=f93 groups=13 lastGroup=Platform platform=f92,f105,f106 order=Capture,Auto Blur,AI Agents,Offline autoBlur=yes offline=f77 agents=f103,f104 seenShotDash=no emptyGroups=no recording=no commercial=no mdm=no videoExport=no seenShotF89=Yes seenShotF90=Yes seenShotF91=Yes seenShotF92=Yes seenShotF105=Yes seenShotF106=Yes seenShotF93=Yes seenShotPrice=Free, $29/year, Lifetime $87 noMember=yes featureLabelFont=price seenShotDescFont=zightDesc seenShotPriceFont=zightDesc noSemicolon=yes blurCapture=No beforePricing=yes note=no"
      );
    } else {
      console.error(
        "SeenShot site: compare table failed heading=" + (compareHeading ? compareHeading.textContent : "") +
          " products=" + compareApps.join(",") +
          " featureCount=" + compareFeatures.length +
          " firstFeature=" + (compareFeatures[0] || "") +
          " secondFeature=" + (compareFeatures[1] || "") +
          " lastFeature=" + (compareFeatures[compareFeatures.length - 1] || "") +
          " groups=" + compareGroups.length +
          " seenShotDescription=" + seenShotDescription +
          " zightDescription=" + zightDescription +
          " blurDataDescription=" + blurDataDescription +
          " seenShotPrice=" + seenShotPrice +
          " seenShotCapture=" + seenShotCapture +
          " zightCapture=" + zightCapture +
          " blurDataCapture=" + blurDataCapture +
          " redactedCapture=" + redactedCapture +
          " seenShotScroll=" + seenShotScroll +
          " seenShotF03=" + seenShotF03 +
          " seenShotF23=" + seenShotF23 +
          " seenShotF24=" + seenShotF24 +
          " zightScroll=" + zightScroll +
          " beforePricing=" + String(compareBeforePricing) +
          " volumeHeader=" + String(hasVolumeHeader) +
          " semicolon=" + String(compareSemicolon) +
          " notePresent=" + Boolean(compareNote) +
          " recordingGroup=" + recordingGroup +
          " recordingRows=" + recordingRows.join(",") +
          " recordingCopy=" + recordingCopy +
          " commercialGroup=" + commercialGroup +
          " commercialRows=" + commercialRows.join(",") +
          " commercialCopy=" + commercialCopy +
          " mdmRow=" + mdmRow +
          " mdmCopy=" + mdmCopy +
          " seenShotF89=" + seenShotF89 +
          " seenShotF90=" + seenShotF90 +
          " seenShotF91=" + seenShotF91 +
          " seenShotF93=" + seenShotF93 +
          " platformGroup=" + platformGroup +
          " oldPlatformGroup=" + oldPlatformGroup +
          " seenShotF92=" + seenShotF92 +
          " seenShotF105=" + seenShotF105 +
          " seenShotF106=" + seenShotF106 +
          " f92Label=" + f92Label +
          " f105Label=" + f105Label +
          " f106Label=" + f106Label +
          " videoExportRow=" + videoExportRow +
          " videoExportCopy=" + videoExportCopy +
          " autoBlurGroup=" + autoBlurGroup +
          " autoBlurRows=" + autoBlurRows.join(",") +
          " autoBlurCopy=" + autoBlurCopy +
          " seenShotAutoBlurYes=" + seenShotAutoBlurYes +
          " offlineGroup=" + offlineGroup +
          " offlineRow=" + offlineRow +
          " offlineCopy=" + offlineCopy +
          " oldOfflineCopy=" + oldOfflineCopy +
          " seenShotOffline=" + seenShotOffline +
          " agentsGroup=" + agentsGroup +
          " agentsF103=" + agentsF103 +
          " agentsF104=" + agentsF104 +
          " agentsCopy=" + agentsCopy +
          " seenShotF103=" + seenShotF103 +
          " seenShotF104=" + seenShotF104 +
          " seenShotF104Label=" + seenShotF104Label +
          " seenShotF104Marks=" + seenShotF104Marks +
          " shareBentoMarks=" + shareBentoMarks +
          " seenShotDashHits=" + seenShotDashHits.join(",") +
          " emptySeenShotGroupHits=" + emptySeenShotGroupHits.join(",") +
          " featureLabelFontMatch=" + featureLabelFontMatch +
          " seenShotDescFontMatch=" + seenShotDescFontMatch +
          " seenShotPriceFontMatch=" + seenShotPriceFontMatch +
          " bannedHits=" + compareBannedHits.join(",")
      );
    }
    }
    // ─── Ariadne's Thread [AT-0460] ─────────────────────
    // What: Log every landing img loading= and every video preload=
    // Why:  Native lazy media must leave an English trail on first paint
    // Date: 2026-09-03
    // Related: [AT-0459] components/LandingMain.tsx:.hero-shot, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
    // ─────────────────────────────────────────────────────
    const mediaImgs = document.querySelectorAll("img");
    let lazyCount = 0;
    let eagerCount = 0;
    let unsetCount = 0;
    mediaImgs.forEach(function (img, index) {
      const loading = img.getAttribute("loading") || "";
      if (loading === "lazy") {
        lazyCount += 1;
      } else if (loading === "eager") {
        eagerCount += 1;
      } else {
        unsetCount += 1;
      }
      console.log(
        "SeenShot site: media img[" + index + "] src=" + (img.getAttribute("src") || "") +
          " loading=" + loading +
          " decoding=" + (img.getAttribute("decoding") || "") +
          " complete=" + String(img.complete)
      );
    });
    const mediaVideos = document.querySelectorAll("video");
    mediaVideos.forEach(function (video, index) {
      console.log(
        "SeenShot site: media video[" + index + "] preload=" + (video.getAttribute("preload") || "") +
          " poster=" + (video.getAttribute("poster") || "") +
          " autoplay=" + String(video.autoplay) +
          " paused=" + String(video.paused)
      );
    });
    console.log(
      "SeenShot site: media imgs=" + mediaImgs.length +
        " lazy=" + lazyCount +
        " eager=" + eagerCount +
        " unset=" + unsetCount +
        " videos=" + mediaVideos.length
    );
    // ─── Ariadne's Thread [AT-0245] ─────────────────────
    // What: Log Free and Member pricing cards and their list lengths
    // Why:  Landing Pricing must be visible in the same site console trail
    // Date: 2026-08-27
    // Related: [AT-0243] public/index.html, [AT-0013] public/js/releases.js
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0271] ─────────────────────
    // What: Log whether each pricing card still has a download/sign-in button
    // Why:  Member card no longer has Sign In; Free still has Download
    // Date: 2026-08-27
    // Related: [AT-0270] public/index.html, [AT-0245] public/js/releases.js
    // ─────────────────────────────────────────────────────
    const pricingCards = document.querySelectorAll(".pricing-card");
    const freeCard = Array.prototype.find.call(pricingCards, function (card) {
      const title = card.querySelector("h3");
      return title && title.textContent === "Free";
    });
    // ─── Ariadne's Thread [AT-0559] ─────────────────────
    // What: Log whether a Free pricing card is present
    // Why:  /pricing no longer renders Free; landing Compare still names Free
    // Date: 2026-09-05
    // Related: [AT-0559] components/PricingCards.tsx, [AT-0245] lib/client/releases.ts:pricingCards
    // ─────────────────────────────────────────────────────
    console.log(
      "SeenShot site: pricing cards=" + pricingCards.length +
        " freeCard=" + Boolean(freeCard) +
        " path=" + location.pathname
    );
    pricingCards.forEach(function (card, index) {
      const title = card.querySelector("h3");
      const price = card.querySelector(".pricing-price");
      const items = card.querySelectorAll("li");
      const download = card.querySelector(".download");
      const contact = card.querySelector(".corporate-contact");
      const apple = download ? download.querySelector(".download-apple") : null;
      const box = download ? download.getBoundingClientRect() : null;
      const contactBox = contact ? contact.getBoundingClientRect() : null;
      console.log(
        "SeenShot site: pricing[" + index + "] title=" + (title ? title.textContent : "") +
          " price=" + (price ? price.textContent : "") +
          " items=" + items.length +
          " download=" + (download ? (download.textContent || "").trim() : "none") +
          " downloadId=" + (download ? download.id : "") +
          " hasApple=" + Boolean(apple) +
          " downloadWidth=" + (box ? Math.round(box.width) : 0) +
          " contact=" + (contact ? (contact.textContent || "").trim() : "none") +
          " contactId=" + (contact ? contact.id : "") +
          " contactHref=" + (contact ? (contact.getAttribute("href") || "") : "") +
          " contactWidth=" + (contactBox ? Math.round(contactBox.width) : 0)
      );
      items.forEach(function (item, itemIndex) {
        console.log(
          "SeenShot site: pricing[" + index + "] li[" + itemIndex + "]=" + (item.textContent || "")
        );
      });
      // ─── Ariadne's Thread [AT-0467] ─────────────────────
      // What: Validate the Corporate Contact Me LinkedIn CTA
      // Why:  Corporate must not be rewritten into a GitHub download link
      // Date: 2026-09-03
      // Related: [AT-0465] components/LandingMain.tsx:#pricing-corporate-contact, [AT-0466] app/site.css:.corporate-contact
      // ─────────────────────────────────────────────────────
      if (title && title.textContent === "Corporate") {
        const contactText = contact ? (contact.textContent || "").trim() : "";
        const contactHref = contact ? (contact.getAttribute("href") || "") : "";
        const validContact = contactText === "Contact Me" && contactHref === "https://www.linkedin.com/in/ignalex/";
        const expectedFeatures = [
          "Everything in Free.",
          "Buy an unlimited number of seats",
          "Connect your own storage",
          "Connect your own domain",
          "Manage users",
        ];
        const corporateFeatures = Array.prototype.map.call(items, function (item) {
          return (item.textContent || "").trim();
        });
        const validFeatures =
          corporateFeatures.length === expectedFeatures.length &&
          expectedFeatures.every(function (feature, featureIndex) {
            return corporateFeatures[featureIndex] === feature;
          });
        console.log(
          "SeenShot site: corporate contactText=" + contactText +
            " contactHref=" + contactHref +
            " valid=" + String(validContact) +
            " hasDownloadClass=" + String(Boolean(contact && contact.classList.contains("download"))) +
            " featureCount=" + corporateFeatures.length +
            " features=" + corporateFeatures.join(" | ") +
            " validFeatures=" + String(validFeatures)
        );
        if (!validContact) {
          console.error("SeenShot site: Corporate Contact Me CTA is missing or invalid");
        }
        if (!validFeatures) {
          console.error("SeenShot site: Corporate feature list is missing or out of order");
        }
      }
      // ─── Ariadne's Thread [AT-0453] ─────────────────────
      // What: Log Free pricing Blur Sensitive data row
      // Why:  Free list must match Features Blur Sensitive data, not Blur zone
      // Date: 2026-09-03
      // Related: [AT-0453] components/LandingMain.tsx:.pricing-card ul, [AT-0443] components/LandingMain.tsx:.bento-card h3
      // ─────────────────────────────────────────────────────
      if (title && title.textContent === "Free") {
        const blurLi = Array.prototype.find.call(items, function (item) {
          return (item.textContent || "").indexOf("Blur") !== -1;
        });
        console.log("SeenShot site: pricing blur=" + (blurLi ? blurLi.textContent.trim() : ""));
      }
      // ─── Ariadne's Thread [AT-0412] ─────────────────────
      // What: Log Member Screenshots without watermarks as its own list row
      // Why:  Watermarks must not live on the Everything in Free line
      // Date: 2026-09-01
      // Related: [AT-0372] public/index.html, [AT-0245] public/js/releases.js
      // ─────────────────────────────────────────────────────
      // ─── Ariadne's Thread [AT-0489] ─────────────────────
      // What: Log Lifetime .pricing-price is $87
      // Why:  Lifetime must show $87, not $179
      // Date: 2026-09-04
      // Related: [AT-0489] components/LandingMain.tsx:.pricing-price, [AT-0450] components/LandingMain.tsx:.pricing-card
      // ─────────────────────────────────────────────────────
      if (title && title.textContent === "Lifetime") {
        const lifetimePrice = price ? (price.textContent || "").trim() : "";
        const validLifetimePrice = lifetimePrice === "$87";
        const pay = card.querySelector("#pricing-pay-lifetime");
        const payLabel = pay ? (pay.textContent || "").trim() : "";
        const payProduct = pay ? (pay.getAttribute("data-product") || "") : "";
        const validPay = payLabel === "Buy $87" && payProduct === "lifetime";
        console.log(
          "SeenShot site: lifetime price=" + lifetimePrice +
            " valid=" + String(validLifetimePrice) +
            " payLabel=" + payLabel +
            " payProduct=" + payProduct +
            " validPay=" + String(validPay) +
            " payTag=" + (pay ? pay.tagName : "")
        );
        if (!validLifetimePrice) {
          console.error("SeenShot site: Lifetime price is missing or not $87");
        }
        if (!validPay) {
          console.error("SeenShot site: Lifetime Buy CTA is missing or invalid");
        }
      }
      if (title && title.textContent === "Member") {
        // ─── Ariadne's Thread [AT-0690] ─────────────────────
        // What: Log Member rows that moved off the removed Free card
        // Why:  $29 / year must list Free tools and must not list 10 MB storage
        // Date: 2026-10-02
        // Related: [AT-0690] components/PricingCards.tsx, [AT-0412] lib/client/releases.ts
        // ─────────────────────────────────────────────────────
        const memberTexts = Array.prototype.map.call(items, function (item) {
          return (item.textContent || "").trim()
        })
        const memberHasInstant = memberTexts.some(function (text) {
          return text.indexOf("Instant sharing with:") === 0
        })
        const memberHasTenMb = memberTexts.some(function (text) {
          return text.indexOf("10 MB screenshot storage") !== -1
        })
        const memberHasEverythingInFree = memberTexts.some(function (text) {
          return text === "Everything in Free."
        })
        console.log(
          "SeenShot site: memberMovedFeatures count=" + memberTexts.length +
            " hasInstant=" + String(memberHasInstant) +
            " hasTenMb=" + String(memberHasTenMb) +
            " hasEverythingInFree=" + String(memberHasEverythingInFree) +
            " features=" + memberTexts.join(" | ")
        )
        if (!memberHasInstant) {
          console.error("SeenShot site: Member list missing Instant sharing with")
        }
        if (memberHasTenMb) {
          console.error("SeenShot site: Member list must not include 10 MB screenshot storage")
        }
        if (memberHasEverythingInFree) {
          console.error("SeenShot site: Member list still says Everything in Free")
        }
        const first = items[0] ? (items[0].textContent || "") : "";
        let noWatermarkLi = "";
        let hasNoWatermark = false;
        items.forEach(function (item) {
          const text = item.textContent || "";
          if (text.indexOf("without watermarks") !== -1) {
            noWatermarkLi = text;
            hasNoWatermark = true;
          }
        });
        const pay = card.querySelector("#pricing-pay-member");
        const payLabel = pay ? (pay.textContent || "").trim() : "";
        const payProduct = pay ? (pay.getAttribute("data-product") || "") : "";
        const validPay = payLabel === "Buy $29 / year" && payProduct === "member";
        console.log(
          "SeenShot site: memberFirstLi=" + first +
            " memberNoWatermarkLi=" + noWatermarkLi +
            " hasNoWatermark=" + String(hasNoWatermark) +
            " ownRow=" + String(noWatermarkLi === "Screenshots without watermarks") +
            " payLabel=" + payLabel +
            " payProduct=" + payProduct +
            " validPay=" + String(validPay) +
            " payTag=" + (pay ? pay.tagName : "")
        );
        if (!hasNoWatermark) {
          console.error("SeenShot site: Member list missing Screenshots without watermarks");
        }
        if (!validPay) {
          console.error("SeenShot site: Member Buy CTA is missing or invalid");
        }
      }
      // ─── Ariadne's Thread [AT-0456] ─────────────────────
      // What: Log Free No corporate usage, Watermarked screenshots, and 10 MB last
      // Why:  Free must list the corporate restriction before storage; last row stays 10 MB
      // Date: 2026-09-03
      // Related: [AT-0455] lib/client/releases.ts:freeLastLi, [AT-0456] components/LandingMain.tsx:.pricing-card ul
      // ─────────────────────────────────────────────────────
      if (title && title.textContent === "Free") {
        const last = items.length ? (items[items.length - 1].textContent || "").trim() : "";
        const secondLast = items.length > 1 ? (items[items.length - 2].textContent || "").trim() : "";
        let hasCorporate = false;
        let hasWatermarked = false;
        items.forEach(function (item) {
          const text = (item.textContent || "").trim();
          if (text === "No corporate usage") {
            hasCorporate = true;
          }
          if (text === "Watermarked screenshots") {
            hasWatermarked = true;
          }
        });
        const lastIsStorage = last === "10 MB screenshot storage";
        const corporateBeforeStorage = secondLast === "No corporate usage";
        console.log(
          "SeenShot site: freeSecondLastLi=" + secondLast +
            " freeLastLi=" + last +
            " hasWatermarked=" + String(hasWatermarked) +
            " hasCorporate=" + String(hasCorporate) +
            " corporateBeforeStorage=" + String(corporateBeforeStorage) +
            " lastIsStorage=" + String(lastIsStorage)
        );
        if (!hasWatermarked) {
          console.error("SeenShot site: Free list missing Watermarked screenshots");
        }
        if (!hasCorporate) {
          console.error("SeenShot site: Free list missing No corporate usage");
        }
        if (!lastIsStorage) {
          console.error("SeenShot site: Free last li missing 10 MB screenshot storage");
        }
      }
    });
    // ─── Ariadne's Thread [AT-0565] ─────────────────────
    // What: Log landing FAQ details, summaries, answers, and corporate Contact Me
    // Why:  Homepage FAQ must stay after Pricing with the selected nine questions
    // Date: 2026-09-05
    // Related: [AT-0565] components/LandingFaq.tsx, [AT-0562] components/LandingMain.tsx:#pricing
    // ─────────────────────────────────────────────────────
    const faqSection = document.querySelector("section.faq");
    const faqHeading = document.getElementById("faq");
    const faqItems = document.querySelectorAll("section.faq details");
    const pricingBlock = document.querySelector("main.landing .pricing");
    const faqAfterPricing = Boolean(
      pricingBlock && faqSection && pricingBlock.nextElementSibling === faqSection
    );
    const onLandingHome = Boolean(document.querySelector("main.landing .hero"));
    const expectedFaq = [
      "What platforms does it run on?",
      "Can I download the app without the App Store?",
      "What do I need to start taking screenshots?",
      "What tools does the app have besides screenshots?",
      "How about performance?",
      "Does it blur sensitive data?",
      "Is there a corporate licence?",
      "Do I need API keys or a cloud to blur data?"
    ]
    const faqCs = faqItems[0] ? getComputedStyle(faqItems[0]) : null;
    console.log(
      "SeenShot site: faq section=" + Boolean(faqSection) +
        " heading=" + (faqHeading ? (faqHeading.textContent || "").trim() : "") +
        " items=" + faqItems.length +
        " afterPricing=" + String(faqAfterPricing) +
        " onLandingHome=" + String(onLandingHome) +
        " path=" + location.pathname +
        " firstBg=" + (faqCs ? faqCs.backgroundColor : "") +
        " firstBorder=" + (faqCs ? faqCs.border : "")
    );
    const faqSummaries = [];
    faqItems.forEach(function (item, index) {
      const summary = item.querySelector("summary");
      const summaryText = summary ? (summary.textContent || "").trim() : "";
      faqSummaries.push(summaryText);
      const paras = item.querySelectorAll("p");
      console.log(
        "SeenShot site: faq[" + index + "] id=" + (item.id || "") +
          " name=" + (item.getAttribute("name") || "") +
          " open=" + String(item.open) +
          " summary=" + summaryText +
          " paragraphs=" + paras.length +
          " expected=" + (expectedFaq[index] || "") +
          " match=" + String(summaryText === expectedFaq[index])
      );
      paras.forEach(function (paragraph, paragraphIndex) {
        console.log(
          "SeenShot site: faq[" + index + "] p[" + paragraphIndex + "]=" +
            (paragraph.textContent || "").trim()
        );
      });
      item.addEventListener("toggle", function () {
        console.log(
          "SeenShot site: faq toggle index=" + index +
            " id=" + (item.id || "") +
            " open=" + String(item.open) +
            " summary=" + summaryText
        );
      });
    });
    const faqContact = document.getElementById("faq-corporate-contact");
    const faqContactHref = faqContact ? (faqContact.getAttribute("href") || "") : "";
    const faqContactText = faqContact ? (faqContact.textContent || "").trim() : "";
    const validFaqContact =
      faqContactText === "Contact Me" && faqContactHref === "https://www.linkedin.com/in/ignalex/";
    console.log(
      "SeenShot site: faq first=" + (faqSummaries[0] || "") +
        " last=" + (faqSummaries[faqSummaries.length - 1] || "") +
        " contact=" + faqContactText +
        " contactHref=" + faqContactHref +
        " validContact=" + String(validFaqContact)
    );
    if (onLandingHome && faqItems.length !== 8) {
      console.error("SeenShot site: FAQ count expected 8 got=" + faqItems.length)
    }
    if (onLandingHome && !faqAfterPricing) {
      console.error("SeenShot site: FAQ is not immediately after Pricing");
    }
    if (onLandingHome && !validFaqContact) {
      console.error("SeenShot site: FAQ corporate Contact Me is missing or invalid");
    }
    expectedFaq.forEach(function (question, index) {
      if (onLandingHome && faqSummaries[index] !== question) {
        console.error(
          "SeenShot site: FAQ summary mismatch index=" + index +
            " expected=" + question +
            " got=" + (faqSummaries[index] || "")
        );
      }
    });
    // ─── Ariadne's Thread [AT-0566] ─────────────────────
    // What: Log and validate the FAQ JSON-LD FAQPage script
    // Why:  The visible FAQ block must ship parseable schema.org Question nodes
    // Date: 2026-09-05
    // Related: [AT-0566] components/LandingFaq.tsx:#faq-jsonld, [AT-0565] lib/client/releases.ts:faq, https://schema.org/FAQPage
    // ─────────────────────────────────────────────────────
    const faqJsonLdNode = document.getElementById("faq-jsonld");
    const faqJsonLdType = faqJsonLdNode ? (faqJsonLdNode.getAttribute("type") || "") : "";
    const faqJsonLdRaw = faqJsonLdNode ? (faqJsonLdNode.textContent || "") : "";
    let faqJsonLd = null;
    let faqJsonLdParseError = "";
    if (faqJsonLdRaw) {
      try {
        faqJsonLd = JSON.parse(faqJsonLdRaw);
      } catch (error) {
        faqJsonLdParseError = error && error.message ? error.message : String(error);
        console.error("SeenShot site: FAQ JSON-LD parse failed", error);
      }
    }
    const faqJsonLdEntity = faqJsonLd && Array.isArray(faqJsonLd.mainEntity) ? faqJsonLd.mainEntity : [];
    const faqJsonLdTypeOk = Boolean(faqJsonLd && faqJsonLd["@type"] === "FAQPage");
    const faqJsonLdContextOk = Boolean(faqJsonLd && faqJsonLd["@context"] === "https://schema.org");
    const faqJsonLdCountOk = faqJsonLdEntity.length === faqItems.length;
    console.log(
      "SeenShot site: faq jsonld found=" + Boolean(faqJsonLdNode) +
        " scriptType=" + faqJsonLdType +
        " chars=" + faqJsonLdRaw.length +
        " parseError=" + faqJsonLdParseError +
        " context=" + (faqJsonLd ? faqJsonLd["@context"] : "") +
        " type=" + (faqJsonLd ? faqJsonLd["@type"] : "") +
        " id=" + (faqJsonLd ? faqJsonLd["@id"] : "") +
        " name=" + (faqJsonLd ? faqJsonLd.name : "") +
        " questions=" + faqJsonLdEntity.length +
        " typeOk=" + String(faqJsonLdTypeOk) +
        " contextOk=" + String(faqJsonLdContextOk) +
        " countOk=" + String(faqJsonLdCountOk)
    );
    faqJsonLdEntity.forEach(function (entity, index) {
      const answer = entity && entity.acceptedAnswer ? entity.acceptedAnswer : null;
      const visibleParas = faqItems[index] ? faqItems[index].querySelectorAll("p") : [];
      const visibleText = Array.prototype.map.call(visibleParas, function (paragraph) {
        return (paragraph.textContent || "").trim();
      }).join(" ");
      const nameMatch = Boolean(entity && entity.name === expectedFaq[index]);
      const answerMatch = Boolean(answer && answer.text === visibleText);
      console.log(
        "SeenShot site: faq jsonld[" + index + "] type=" + (entity ? entity["@type"] : "") +
          " name=" + (entity ? entity.name : "") +
          " url=" + (entity ? entity.url : "") +
          " answerType=" + (answer ? answer["@type"] : "") +
          " answerChars=" + (answer && answer.text ? answer.text.length : 0) +
          " nameMatch=" + String(nameMatch) +
          " answerMatch=" + String(answerMatch)
      );
      if (onLandingHome && (!entity || entity["@type"] !== "Question" || !nameMatch)) {
        console.error("SeenShot site: FAQ JSON-LD question mismatch index=" + index);
      }
      if (onLandingHome && (!answer || answer["@type"] !== "Answer" || !answerMatch)) {
        console.error("SeenShot site: FAQ JSON-LD answer mismatch index=" + index);
      }
    });
    if (onLandingHome && (faqJsonLdType !== "application/ld+json" || !faqJsonLdTypeOk || !faqJsonLdContextOk || !faqJsonLdCountOk)) {
      console.error("SeenShot site: FAQ JSON-LD FAQPage is missing or invalid");
    }
    // ─── Ariadne's Thread [AT-0572] ─────────────────────
    // What: Log and validate the landing SoftwareApplication JSON-LD graph
    // Why:  Homepage must expose the macOS app, Person author, and free Offer
    // Date: 2026-09-05
    // Related: [AT-0568] content/site-jsonld.ts:landingAppJsonLd, [AT-0569] components/JsonLdScript.tsx:#app-jsonld, https://schema.org/SoftwareApplication
    // ─────────────────────────────────────────────────────
    const appJsonLd = readJsonLdScript("app-jsonld");
    const appPerson = jsonLdNodeByType(appJsonLd.graph, "Person");
    const appSoftware = jsonLdNodeByType(appJsonLd.graph, "SoftwareApplication");
    const appOffer = appSoftware && appSoftware.offers ? appSoftware.offers : null;
    const appPersonName = appPerson && appPerson.name ? String(appPerson.name) : "";
    const appOs = appSoftware && appSoftware.operatingSystem ? String(appSoftware.operatingSystem) : "";
    const appCategory = appSoftware && appSoftware.applicationCategory ? String(appSoftware.applicationCategory) : "";
    const appPrice = appOffer && appOffer.price !== undefined && appOffer.price !== null ? appOffer.price : "";
    const appDownload = appSoftware && appSoftware.downloadUrl ? String(appSoftware.downloadUrl) : "";
    const appJsonLdOk = Boolean(
      appJsonLd.scriptType === "application/ld+json" &&
        appJsonLd.parsed &&
        appJsonLd.parsed["@context"] === "https://schema.org" &&
        appSoftware &&
        appSoftware["@type"] === "SoftwareApplication" &&
        appPersonName === "Alex Ign" &&
        appOs === "macOS" &&
        appCategory === "UtilitiesApplication" &&
        Number(appPrice) === 0 &&
        appDownload === "https://seenshot.app/download/arm64"
    );
    console.log(
      "SeenShot site: app jsonld ok=" + String(appJsonLdOk) +
        " person=" + appPersonName +
        " personUrl=" + (appPerson && appPerson.url ? appPerson.url : "") +
        " software=" + (appSoftware && appSoftware.name ? appSoftware.name : "") +
        " os=" + appOs +
        " category=" + appCategory +
        " price=" + String(appPrice) +
        " downloadUrl=" + appDownload +
        " help=" + (appSoftware && appSoftware.softwareHelp ? JSON.stringify(appSoftware.softwareHelp) : "")
    );
    if (onLandingHome && !appJsonLdOk) {
      console.error("SeenShot site: app JSON-LD SoftwareApplication is missing or invalid");
    }
    const footLinks = document.querySelectorAll(".site-foot a");
    const firstFoot = footLinks[0];
    const footerRefunds = document.querySelector('.site-foot a[href="/refund/"]');
    const footerAcceptableUse = document.querySelector('.site-foot a[href="/acceptable-use/"]');
    const footerCopyright = document.querySelector('.site-foot a[href="/copyright/"]');
    const pricingRefunds = document.getElementById("pricing-refunds");
    console.log(
      "SeenShot site: footer legal links=" + footLinks.length +
        " color=" + (firstFoot ? getComputedStyle(firstFoot).color : "") +
        " footerRefunds=" + Boolean(footerRefunds) +
        " footerAcceptableUse=" + Boolean(footerAcceptableUse) +
        " footerCopyright=" + Boolean(footerCopyright) +
        " pricingRefunds=" + Boolean(pricingRefunds) +
        " pricingRefundsHref=" + (pricingRefunds ? (pricingRefunds.getAttribute("href") || "") : "")
    );

    function detectMacArchSync() {
      if (typeof navigator === "undefined" || navigator.platform.indexOf("Mac") === -1) {
        console.log("SeenShot site: detectMacArchSync default=arm non-mac platform=" + (navigator && navigator.platform));
        return "arm";
      }
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        const debugInfo = gl && gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_INFO) || "");
          console.log("SeenShot site: detectMacArchSync renderer=" + renderer);
          if (renderer.indexOf("Apple M") !== -1) {
            return "arm";
          }
          if (renderer.indexOf("Intel") !== -1 || renderer.indexOf("AMD") !== -1) {
            return "x86";
          }
        }
      } catch (err) {
        console.warn("SeenShot site: detectMacArchSync failed", err);
      }
      console.log("SeenShot site: detectMacArchSync fallback=arm");
      return "arm";
    }

    // ─── Ariadne's Thread [AT-0516] ─────────────────────
    // What: Detect Mac chip then point Download pills at /download/arm64 or /download/x86_64
    // Why:  CTA must start the matching latest-release DMG, not open GitHub Releases
    // Date: 2026-09-05
    // Related: [AT-0515] backend→lib/site.ts:redirectLatestMacDmg, [AT-0390] docs/index.html:detectMacArch
    // ─────────────────────────────────────────────────────
    function detectMacArch() {
      if (typeof navigator === "undefined" || navigator.platform.indexOf("Mac") === -1) {
        console.log("SeenShot site: detectMacArch default=arm non-mac platform=" + (navigator && navigator.platform));
        return Promise.resolve("arm");
      }
      if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
        return navigator.userAgentData.getHighEntropyValues(["architecture"]).then(function (hints) {
          const arch = hints && hints.architecture;
          console.log("SeenShot site: detectMacArch userAgentData.architecture=" + arch);
          if (arch === "arm") {
            return "arm";
          }
          if (arch === "x86") {
            return "x86";
          }
          return detectMacArchSync();
        }).catch(function (err) {
          console.warn("SeenShot site: detectMacArch userAgentData failed", err);
          return detectMacArchSync();
        });
      }
      return Promise.resolve(detectMacArchSync());
    }

    function macDownloadHref(arch) {
      const href = arch === "x86" ? "/download/x86_64" : "/download/arm64";
      console.log("SeenShot site: macDownloadHref arch=" + arch + " href=" + href);
      return href;
    }

    function paintDownloadArch(arch) {
      const label = arch === "x86" ? "Intel (x86_64)" : "Apple Silicon (arm64)"
      const nodes = document.querySelectorAll(".download-arch")
      console.log("SeenShot site: paintDownloadArch count=" + nodes.length + " label=" + label)
      nodes.forEach(function (el) {
        // ─── Ariadne's Thread [AT-0627] ─────────────────────
        // What: Skip .download-arch nodes that set data-arch
        // Why:  Unique landings keep macOS 14 or later instead of the detected chip line
        // Date: 2026-09-06
        // Related: [AT-0627] components/DownloadPill.tsx:DownloadWrap, [AT-0397] lib/client/releases.ts:paintDownloadArch
        // ─────────────────────────────────────────────────────
        const locked = el.getAttribute("data-arch")
        if (locked) {
          console.log("SeenShot site: paintDownloadArch skip locked=" + locked)
          return
        }
        el.textContent = label
        console.log("SeenShot site: paintDownloadArch set label=" + label)
      })
    }

    function applyMacDownload(arch) {
      const chip = arch === "x86" ? "x86" : "arm";
      heroArch = chip;
      const href = macDownloadHref(chip);
      setLatestDownloadHref(href);
      paintDownloadArch(chip);
      console.log(
        "SeenShot site: applyMacDownload arch=" + chip +
          " href=" + href +
          " cached=" + cachedPublished.length
      );
      if (cachedPublished.length) {
        const latest = cachedPublished[0];
        const asset = downloadAsset(latest, chip);
        const latestMeta = document.getElementById("latest-meta");
        const assetDownloads =
          asset && typeof asset.download_count === "number" ? asset.download_count : null;
        paintLatestMeta(latestMeta, assetDownloads);
        console.log(
          "SeenShot site: applyMacDownload recount arch=" + chip +
            " name=" + ((asset && asset.name) || "none") +
            " download_count=" + (assetDownloads === null ? "none" : assetDownloads)
        );
      }
    }

    // ─── Ariadne's Thread [AT-0481] ─────────────────────
    // What: Pick a GitHub DMG by arm64 or x86_64 in the asset name
    // Why:  /releases/ tabs must not reuse the first .dmg when both chips exist
    // Date: 2026-09-04
    // Related: [AT-0013] lib/client/releases.ts:downloadAsset, https://docs.github.com/en/rest/releases/assets
    // ─────────────────────────────────────────────────────
    function assetArch(name) {
      const n = String(name || "").toLowerCase();
      if (n.indexOf("x86_64") !== -1 || n.indexOf("x86") !== -1) {
        return "x86";
      }
      if (n.indexOf("arm64") !== -1 || n.indexOf("aarch64") !== -1) {
        return "arm";
      }
      console.log("SeenShot site: assetArch default arm name=" + name);
      return "arm";
    }

    function downloadAsset(release, arch) {
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const files = assets.filter(function (asset) {
        return typeof asset.name === "string" && (
          asset.name.indexOf(".dmg") !== -1 || asset.name.indexOf(".zip") !== -1
        );
      });
      const wanted = arch === "x86" ? "x86" : (arch === "arm" ? "arm" : "");
      if (wanted) {
        const match = files.find(function (asset) {
          return assetArch(asset.name) === wanted;
        }) || null;
        console.log(
          "SeenShot site: downloadAsset arch=" + wanted +
            " tag=" + (release.tag_name || "") +
            " name=" + ((match && match.name) || "none") +
            " files=" + files.length
        );
        return match;
      }
      const arm = files.find(function (asset) {
        return assetArch(asset.name) === "arm";
      });
      if (arm) {
        console.log(
          "SeenShot site: downloadAsset prefer arm tag=" + (release.tag_name || "") +
            " name=" + arm.name
        );
        return arm;
      }
      const first = files[0] || null;
      console.log(
        "SeenShot site: downloadAsset fallback tag=" + (release.tag_name || "") +
          " name=" + ((first && first.name) || "none")
      );
      return first;
    }

    function paintReleaseList(list, published, arch) {
      const chip = arch === "x86" ? "x86" : "arm64";
      const matched = published.filter(function (release) {
        return Boolean(downloadAsset(release, arch === "x86" ? "x86" : "arm"));
      });
      console.log(
        "SeenShot site: paintReleaseList arch=" + chip +
          " published=" + published.length +
          " matched=" + matched.length
      );
      list.innerHTML = "";
      if (matched.length === 0) {
        list.innerHTML =
          '<p class="empty">No ' + chip + ' builds yet. See <a href="' + FALLBACK + '">GitHub Releases</a>.</p>';
        logReleaseCardColors(list);
        return;
      }
      matched.forEach(function (release) {
        list.appendChild(releaseCard(release, arch === "x86" ? "x86" : "arm"));
      });
      logReleaseCardColors(list);
    }

    function archFromLocation() {
      const value = new URLSearchParams(location.search).get("arch");
      const arch = value === "x86" ? "x86" : "arm";
      console.log("SeenShot site: releases archFromLocation raw=" + value + " arch=" + arch + " href=" + location.href);
      return arch;
    }

    function archHref(arch) {
      return arch === "x86" ? "/releases/?arch=x86" : "/releases/?arch=arm64";
    }

    function bindReleasesArchTabs() {
      const tablist = document.querySelector(".releases-arch");
      const list = document.getElementById("releases");
      if (!tablist || !list) {
        console.log("SeenShot site: releases-arch tabs skip tablist=" + Boolean(tablist) + " list=" + Boolean(list));
        return;
      }
      const tabs = tablist.querySelectorAll('[role="tab"]');
      function selectArch(arch, focusTab, pushUrl) {
        const next = arch === "x86" ? "x86" : "arm";
        listArch = next;
        tabs.forEach(function (tab) {
          const on = tab.getAttribute("data-arch") === next;
          tab.setAttribute("aria-selected", on ? "true" : "false");
          tab.tabIndex = on ? 0 : -1;
          if (on && focusTab) {
            tab.focus();
          }
        });
        const selected = tablist.querySelector('[role="tab"][aria-selected="true"]');
        list.setAttribute("aria-labelledby", selected ? selected.id : "releases-arch-arm");
        const href = archHref(next);
        if (pushUrl) {
          const nextUrl = new URL(href, location.origin);
          if (location.pathname !== nextUrl.pathname || location.search !== nextUrl.search) {
            history.pushState({ releasesArch: next }, "", nextUrl.pathname + nextUrl.search);
            console.log("SeenShot site: releases arch url=" + nextUrl.pathname + nextUrl.search);
          }
        }
        console.log("SeenShot site: releases arch=" + listArch + " cached=" + cachedPublished.length + " pushUrl=" + Boolean(pushUrl));
        if (cachedPublished.length) {
          paintReleaseList(list, cachedPublished, listArch);
        }
      }
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function (event) {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) {
            console.log("SeenShot site: releases arch native navigation arch=" + tab.getAttribute("data-arch"));
            return;
          }
          event.preventDefault();
          selectArch(tab.getAttribute("data-arch") || "arm", false, true);
        });
      });
      tablist.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }
        event.preventDefault();
        const current = listArch === "x86" ? 1 : 0;
        const next = event.key === "ArrowRight" ? (current + 1) % tabs.length : (current + tabs.length - 1) % tabs.length;
        const tab = tabs[next];
        selectArch(tab ? tab.getAttribute("data-arch") : "arm", true, true);
      });
      window.addEventListener("popstate", function () {
        const arch = archFromLocation();
        console.log("SeenShot site: releases arch popstate=" + arch);
        selectArch(arch, false, false);
      });
      selectArch(archFromLocation(), false, false);
      console.log("SeenShot site: releases-arch tabs bound count=" + tabs.length + " hrefs=" + tabs.length);
    }

    // ─── Ariadne's Thread [AT-0390] ─────────────────────
    // What: Format GitHub asset download_count as 1 download / N downloads
    // Why:  Landing #latest-meta and /releases/ cards share one GitHub count label
    // Date: 2026-08-31
    // Related: [AT-0389] public/js/releases.js:paintLatestMeta, [AT-0390] public/js/releases.js:releaseCard, https://docs.github.com/en/rest/releases/assets
    // ─────────────────────────────────────────────────────
    function formatDownloadCountLabel(downloads) {
      if (typeof downloads !== "number" || !Number.isFinite(downloads) || downloads < 0) {
        console.log("SeenShot site: download_count label skipped n=" + downloads);
        return "";
      }
      const formatted = new Intl.NumberFormat("en").format(downloads);
      const label = downloads === 1 ? "1 download" : formatted + " downloads";
      console.log("SeenShot site: download_count label=" + label + " n=" + downloads);
      return label;
    }

    function formatDate(iso) {
      if (!iso) {
        return "";
      }
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }

    // ─── Ariadne's Thread [AT-0340] ─────────────────────
    // What: Stop wiring GitHub href onto #keys-download and drop bindKeysModal
    // Why:  Landing no longer has #latest-keys or #keys-dialog
    // Date: 2026-08-28
    // Related: [AT-0339] public/index.html, [AT-0242] public/js/releases.js:setLatestDownloadHref
    // ─────────────────────────────────────────────────────
    function setLatestDownloadHref(href) {
      const links = document.querySelectorAll(".download-wrap a.download");
      const navDownload = document.getElementById("nav-download");
      const cabinetDownload = document.getElementById("cabinet-download");
      if (links.length === 0 && !navDownload && !cabinetDownload) {
        console.warn("SeenShot site: no download-wrap anchors href=" + href);
        return;
      }
      links.forEach(function (link) {
        link.href = href;
        console.log(
          "SeenShot site: download href id=" + (link.id || "") +
            " href=" + href +
            " label=" + (link.textContent || "").trim()
        );
      });
      // ─── Ariadne's Thread [AT-0525] ─────────────────────
      // What: Point #nav-download at the same /download/arm64 or /download/x86_64 href as the pills
      // Why:  Header Download must not keep a second download path after chip detect
      // Date: 2026-09-05
      // Related: [AT-0525] components/SiteChrome.tsx:#nav-download, [AT-0517] components/DownloadPill.tsx
      // ─────────────────────────────────────────────────────
      function paintDownloadHref(link) {
        if (!link) {
          return
        }
        link.setAttribute("href", href)
        const apple = link.querySelector(".download-apple")
        const label = link.querySelector(".download-label")
        if (link.id === "cabinet-download") {
          console.log(
            "SeenShot site: cabinet-download href=" + href +
              " label=" + (label ? (label.textContent || "").trim() : "") +
              " hidden=" + String(link.hidden)
          )
        }
        console.log(
          "SeenShot site: download href id=" + (link.id || "") +
            " href=" + href +
            " label=" + (label ? (label.textContent || "").trim() : (link.textContent || "").trim()) +
            " hasApple=" + Boolean(apple)
        )
      }
      paintDownloadHref(navDownload)
      // ─── Ariadne's Thread [AT-0685] ─────────────────────
      // What: Point #cabinet-download at the same arch DMG as the empty-card pill
      // Why:  Signed-in cabinet Download must follow chip detect after public CTAs stopped serving the file
      // Date: 2026-10-02
      // Related: [AT-0685] components/SpaceMain.tsx:#cabinet-download, [AT-0525] lib/client/releases.ts:setLatestDownloadHref
      // ─────────────────────────────────────────────────────
      paintDownloadHref(cabinetDownload)
    }

    function latestDownloadLabel(latestLink, fallback) {
      const custom = latestLink.getAttribute("data-label");
      if (custom) {
        console.log("SeenShot site: latest-download keep label=" + custom + " fallback=" + fallback);
        return custom;
      }
      console.log("SeenShot site: latest-download label=" + fallback);
      return fallback;
    }

    // ─── Ariadne's Thread [AT-0377] ─────────────────────
    // What: Paint Apple download pills as Download Free for macOS, not Download {version}
    // Why:  Hero and pricing CTAs must keep the Apple mark and not show the GitHub tag
    // Date: 2026-09-01
    // Related: [AT-0397] public/index.html:#latest-download, [AT-0347] public/js/releases.js:paintLatestDownloadLabel
    // ─────────────────────────────────────────────────────
    function paintLatestDownloadLabel(latestLink, fallback) {
      const apple = latestLink.querySelector(".download-apple");
      const labelFallback = apple ? MAC_DOWNLOAD_LABEL : fallback;
      const label = latestDownloadLabel(latestLink, labelFallback);
      const text = latestLink.querySelector(".download-label");
      if (text) {
        text.textContent = label;
        console.log(
          "SeenShot site: download painted id=" + (latestLink.id || "") +
            " label=" + label +
            " fallback=" + fallback +
            " via=download-label" +
            " hasApple=" + Boolean(apple)
        );
      } else {
        latestLink.textContent = label;
        console.log(
          "SeenShot site: download painted id=" + (latestLink.id || "") +
            " label=" + label +
            " fallback=" + fallback +
            " via=textContent" +
            " hasApple=" + Boolean(apple)
        );
      }
      return label;
    }

    function paintDownloadAnchors(fallback) {
      const links = document.querySelectorAll(".download-wrap a.download");
      console.log("SeenShot site: paint download anchors=" + links.length + " fallback=" + fallback);
      links.forEach(function (link) {
        paintLatestDownloadLabel(link, fallback);
      });
    }

    // ─── Ariadne's Thread [AT-0370] ─────────────────────
    // What: Log computed .release fill, ink, and download link color after paint
    // Why:  /releases/ cards must not keep landing #2448d6 under .legal ink text
    // Date: 2026-08-28
    // Related: [AT-0370] public/css/site.css:article.legal.card .release, [AT-0357] public/js/releases.js:render
    // ─────────────────────────────────────────────────────
    function logReleaseCardColors(list) {
      if (!list) {
        console.warn("SeenShot site: logReleaseCardColors skipped, no list");
        return;
      }
      const card = list.querySelector(".release, .error, .empty");
      if (!card) {
        console.warn("SeenShot site: logReleaseCardColors skipped, no card");
        return;
      }
      const cs = getComputedStyle(card);
      const link = card.querySelector("a");
      const notes = card.querySelector(".notes");
      const linkCs = link ? getComputedStyle(link) : null;
      const notesCs = notes ? getComputedStyle(notes) : null;
      const fill = cs.backgroundColor;
      const stillLandingBlue = fill === "rgb(36, 72, 214)" || fill === "rgb(29, 59, 184)";
      console.log(
        "SeenShot site: release card class=" + card.className +
          " background=" + fill +
          " color=" + cs.color +
          " linkColor=" + (linkCs ? linkCs.color : "") +
          " notesColor=" + (notesCs ? notesCs.color : "")
      );
      if (stillLandingBlue) {
        console.error("SeenShot site: release card still uses landing blue fill background=" + fill);
      }
    }

    // ─── Ariadne's Thread [AT-0390] ─────────────────────
    // What: Show GitHub download_count on the right of each /releases/ card
    // Why:  Each DMG row must show how many times that asset was downloaded
    // Date: 2026-08-31
    // Related: [AT-0390] public/js/releases.js:formatDownloadCountLabel, [AT-0013] public/js/releases.js:downloadAsset
    // ─────────────────────────────────────────────────────
    function releaseCard(release, arch) {
      const asset = downloadAsset(release, arch);
      const item = document.createElement("article");
      item.className = "release";
      const tag = release.tag_name || release.name || "release";
      const date = formatDate(release.published_at);
      const badge = release.prerelease ? " · Pre-release" : "";
      const href = asset && asset.browser_download_url ? asset.browser_download_url : (release.html_url || FALLBACK);
      const label = asset ? "Download " + (asset.name || "dmg") : "Open on GitHub";
      const notes = typeof release.body === "string" ? release.body.trim() : "";
      const downloads = asset && typeof asset.download_count === "number" ? asset.download_count : null;
      const downloadsLabel = formatDownloadCountLabel(downloads);
      const top = document.createElement("div");
      top.className = "release-top";
      const strong = document.createElement("strong");
      strong.textContent = tag + badge;
      const aside = document.createElement("span");
      aside.className = "release-top-aside";
      const dateEl = document.createElement("span");
      dateEl.textContent = date;
      aside.appendChild(dateEl);
      if (downloadsLabel) {
        const countEl = document.createElement("span");
        countEl.className = "release-downloads";
        countEl.textContent = downloadsLabel;
        aside.appendChild(countEl);
      }
      top.appendChild(strong);
      top.appendChild(aside);
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      item.appendChild(top);
      item.appendChild(link);
      if (notes) {
        const notesEl = document.createElement("p");
        notesEl.className = "notes";
        notesEl.textContent = notes;
        item.appendChild(notesEl);
      }
      console.log(
        "SeenShot site: release card tag=" + tag +
          " arch=" + (arch || "default") +
          " date=" + date +
          " prerelease=" + Boolean(release.prerelease) +
          " hasAsset=" + Boolean(asset) +
          " assetName=" + ((asset && asset.name) || "") +
          " download_count=" + (downloads === null ? "none" : downloads) +
          " downloadsLabel=" + downloadsLabel +
          " notesChars=" + notes.length
      );
      return item;
    }

    // ─── Ariadne's Thread [AT-0396] ─────────────────────
    // What: Paint #latest-meta only when GitHub download_count is at least 1000
    // Why:  A single-digit count under Download is evidence against the product
    // Date: 2026-09-01
    // Related: [AT-0390] public/js/releases.js:formatDownloadCountLabel, [AT-0396] public/index.html:#latest-meta
    // ─────────────────────────────────────────────────────
    function paintLatestMeta(meta, downloads) {
      if (!meta) {
        console.log("SeenShot site: latest-meta missing downloads=" + downloads);
        return;
      }
      meta.textContent = "";
      meta.classList.remove("latest-meta-row");
      const n = typeof downloads === "number" && Number.isFinite(downloads) ? downloads : null;
      if (n === null || n < DOWNLOAD_COUNT_HERO_MIN) {
        meta.hidden = true;
        console.log(
          "SeenShot site: latest-meta hidden download_count=" + (n === null ? "none" : n) +
            " min=" + DOWNLOAD_COUNT_HERO_MIN
        );
        return;
      }
      const downloadsLabel = formatDownloadCountLabel(n);
      if (!downloadsLabel) {
        meta.hidden = true;
        console.log("SeenShot site: latest-meta hidden empty label n=" + n);
        return;
      }
      meta.hidden = false;
      meta.textContent = downloadsLabel;
      const box = meta.getBoundingClientRect();
      console.log(
        "SeenShot site: latest-meta downloads=" + n +
          " label=" + downloadsLabel +
          " width=" + Math.round(box.width)
      );
    }

    // ─── Ariadne's Thread [AT-0396] ─────────────────────
    // What: Paint the latest GitHub tag into #site-version
    // Why:  Version starting with 0 must leave the hero CTA and live in the footer
    // Date: 2026-09-01
    // Related: [AT-0396] public/index.html:#site-version, [AT-0013] public/js/releases.js:render
    // ─────────────────────────────────────────────────────
    function paintFooterVersion(version) {
      const el = document.getElementById("site-version")
      if (!el) {
        console.log("SeenShot site: site-version missing version=" + version)
        return
      }
      const text = typeof version === "string" ? version.trim() : ""
      if (!text) {
        el.hidden = true
        el.textContent = ""
        console.log("SeenShot site: site-version hidden empty")
        return
      }
      el.hidden = false
      el.textContent = text
      const parent = el.parentElement
      console.log(
        "SeenShot site: site-version=" + text +
          " parent=" + (parent ? parent.tagName : "") +
          " href=" + (parent && parent.getAttribute ? parent.getAttribute("href") : "")
      )
    }

    // ─── Ariadne's Thread [AT-0357] ─────────────────────
    // What: Render the GitHub release list on /releases/ without a landing fold
    // Why:  Previous releases left the homepage; latest Download still uses this fetch
    // Date: 2026-08-28
    // Related: [AT-0357] public/releases/index.html, [AT-0013] public/js/releases.js:releaseCard
    // ─────────────────────────────────────────────────────
    function render(releases) {
      const published = releases.filter(function (release) {
        return !release.draft;
      });
      cachedPublished = published;
      const list = document.getElementById("releases");
      const latestLink = document.getElementById("latest-download");
      const latestMeta = document.getElementById("latest-meta");
      const downloadCount = document.querySelectorAll(".download-wrap a.download").length;
      console.log(
        "SeenShot site: published releases=" + published.length +
          " path=" + location.pathname +
          " hasList=" + Boolean(list) +
          " hasLatest=" + Boolean(latestLink) +
          " downloadAnchors=" + downloadCount +
          " listArch=" + listArch +
          " heroArch=" + heroArch
      );
      if (!latestLink && !list) {
        console.log("SeenShot site: skip render, no latest-download and no #releases");
        return;
      }
      if (published.length === 0) {
        if (list) {
          list.innerHTML = '<p class="empty">No published releases yet. See <a href="' + FALLBACK + '">GitHub Releases</a>.</p>';
        }
        paintLatestMeta(latestMeta, null);
        paintFooterVersion("");
        applyMacDownload(heroArch);
        paintDownloadAnchors("Download");
        console.warn("SeenShot site: no published releases, keep /download href");
        return;
      }
      const latest = published[0];
      const latestAsset = downloadAsset(latest, heroArch);
      const version = latest.tag_name || latest.name || "latest";
      const assetDownloads =
        latestAsset && typeof latestAsset.download_count === "number" ? latestAsset.download_count : null;
      paintLatestMeta(latestMeta, assetDownloads);
      paintFooterVersion(version);
      applyMacDownload(heroArch);
      console.log(
        "SeenShot site: stable version=" + version +
          " prerelease=" + Boolean(latest.prerelease) +
          " hasAsset=" + Boolean(latestAsset && latestAsset.browser_download_url) +
          " download_count=" + (assetDownloads === null ? "none" : assetDownloads) +
          " heroCountMin=" + DOWNLOAD_COUNT_HERO_MIN +
          " heroArch=" + heroArch +
          " assetName=" + ((latestAsset && latestAsset.name) || "")
      );
      if (latestAsset && latestAsset.browser_download_url) {
        paintDownloadAnchors("Download " + version);
        console.log("SeenShot site: latest asset name=" + latestAsset.name + " href=" + macDownloadHref(heroArch));
      } else {
        paintDownloadAnchors("Download " + version);
        console.warn("SeenShot site: latest release has no dmg asset tag=" + version + " arch=" + heroArch);
      }
      if (!list) {
        console.log("SeenShot site: latest download only, skip release list");
        return;
      }
      paintReleaseList(list, published, listArch);
      console.log(
        "SeenShot site: release list cards painted arch=" + listArch +
          " current=" + version +
          " notesChars=" + ((latest.body && String(latest.body).trim().length) || 0)
      );
    }

    function showError(message) {
      console.error("SeenShot site: " + message);
      const latestMeta = document.getElementById("latest-meta");
      const list = document.getElementById("releases");
      paintLatestMeta(latestMeta, null);
      paintFooterVersion("");
      if (list) {
        list.innerHTML =
          '<p class="error">' + message + ' <a href="' + FALLBACK + '">GitHub Releases</a></p>';
        logReleaseCardColors(list);
      }
      applyMacDownload(heroArch);
      paintDownloadAnchors("Download");
    }

    applyMacDownload("arm");
    detectMacArch().then(function (arch) {
      console.log("SeenShot site: detectMacArch resolved=" + arch);
      applyMacDownload(arch === "x86" ? "x86" : "arm");
    });
    bindReleasesArchTabs();
    fetch(RELEASES_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(function (response) {
      console.log("SeenShot site: GitHub releases status=" + response.status);
      if (!response.ok) {
        throw new Error("GitHub Releases HTTP " + response.status);
      }
      return response.json();
    }).then(function (data) {
      if (!Array.isArray(data)) {
        throw new Error("GitHub Releases payload is not an array");
      }
      render(data);
    }).catch(function (error) {
      showError(error && error.message ? error.message : "GitHub Releases request failed.");
    });

}
