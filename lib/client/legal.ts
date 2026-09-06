// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0253] ─────────────────────
   What: Log legal page path and footer hrefs
   Why:  Privacy, Terms, Cookies, Refunds, Contact must leave an English console trail
   Date: 2026-08-27
   Related: [AT-0250] public/privacy/index.html, [AT-0252] public/index.html
─────────────────────────────────────────────────────── */

let started = false;
export function startLegal() {
  if (started) {
    console.warn("SeenShot startLegal: start ignored, already started");
    return;
  }
  started = true;

    const links = document.querySelectorAll(".site-foot a");
    console.log("SeenShot legal: path=" + location.pathname + " title=" + document.title + " footerLinks=" + links.length);
    links.forEach(function (link) {
      console.log("SeenShot legal: footer href=" + (link.getAttribute("href") || "") + " text=" + (link.textContent || ""));
    });
    const headings = document.querySelectorAll(".legal h1, .legal h2");
    headings.forEach(function (heading) {
      console.log("SeenShot legal: heading=" + heading.tagName + " text=" + heading.textContent);
    });
    const articleLinks = document.querySelectorAll(".legal a");
    console.log("SeenShot legal: articleLinks=" + articleLinks.length);
    articleLinks.forEach(function (link) {
      console.log(
        "SeenShot legal: article href=" + (link.getAttribute("href") || "") +
          " text=" + (link.textContent || "") +
          " color=" + getComputedStyle(link).color
      );
    });
    const legalCard = document.querySelector("article.legal.card");
    // ─── Ariadne's Thread [AT-0368] ─────────────────────
    // What: Log mailto and https hosts on legal pages. Warn if code.market remains
    // Why:  Technical pages must show seenshot.app, not the code.market site
    // Date: 2026-08-28
    // Related: [AT-0368] public/contact/index.html, [AT-0253] public/js/legal.js
    // ─────────────────────────────────────────────────────
    const articleText = legalCard ? legalCard.textContent || "" : "";
    // ─── Ariadne's Thread [AT-0567] ─────────────────────
    // What: Require legal mailto links to be qa@seenshot.app
    // Why:  Support, abuse, GDPR, refunds, and copyright all use one mailbox
    // Date: 2026-09-05
    // Related: [AT-0567] content/contact.ts, [AT-0563] components/SupportChat.tsx, [AT-0368] lib/client/legal.ts
    // ─────────────────────────────────────────────────────
    const qaMailHref = "mailto:qa@seenshot.app";
    const mailLinks = document.querySelectorAll('.legal a[href^="mailto:"]');
    const qaMail = document.querySelector('.legal a[href="' + qaMailHref + '"]');
    let oldMailHref = "";
    mailLinks.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").trim();
      console.log("SeenShot legal: mailto href=" + href + " text=" + text);
      if (href !== qaMailHref || text !== "qa@seenshot.app") {
        oldMailHref = href + "|" + text;
      }
    });
    const hasOldSupport = articleText.indexOf("support@seenshot.app") !== -1;
    const hasOldAbuse = articleText.indexOf("abuse@seenshot.com") !== -1;
    const seenshotSite = document.querySelector('.legal a[href="https://seenshot.app"]');
    let codeMarketHref = false;
    articleLinks.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      if (href.indexOf("code.market") !== -1) {
        codeMarketHref = true;
      }
    });
    const codeMarketHits = articleText.indexOf("code.market") !== -1 || codeMarketHref;
    console.log(
      "SeenShot legal: qaMail=" + Boolean(qaMail) +
        " mailtoCount=" + mailLinks.length +
        " oldMailHref=" + (oldMailHref || "none") +
        " hasOldSupport=" + String(hasOldSupport) +
        " hasOldAbuse=" + String(hasOldAbuse) +
        " seenshotSite=" + Boolean(seenshotSite) +
        " codeMarketInArticle=" + String(codeMarketHits) +
        " codeMarketHref=" + String(codeMarketHref)
    );
    if (hasOldSupport || hasOldAbuse || oldMailHref) {
      console.error(
        "SeenShot legal: old contact mail still in article path=" + location.pathname +
          " oldMailHref=" + (oldMailHref || "none") +
          " hasOldSupport=" + String(hasOldSupport) +
          " hasOldAbuse=" + String(hasOldAbuse)
      );
    }
    if (codeMarketHits) {
      console.error("SeenShot legal: code.market still in article path=" + location.pathname);
    }
    // ─── Ariadne's Thread [AT-0369] ─────────────────────
    // What: Log Contact delete heading and paragraph. Warn if API paths remain
    // Why:  Contact must say delete account wipes service data, not GET/DELETE routes
    // Date: 2026-08-28
    // Related: [AT-0369] public/contact/index.html, [AT-0253] public/js/legal.js
    // ─────────────────────────────────────────────────────
    const contactDeleteH2 = Array.prototype.find.call(headings, function (heading) {
      return heading.tagName === "H2" && heading.textContent === "Delete your account";
    });
    const contactDeleteP = contactDeleteH2 && contactDeleteH2.nextElementSibling
      ? contactDeleteH2.nextElementSibling
      : null;
    const contactDeleteText = contactDeleteP ? (contactDeleteP.textContent || "").trim() : "";
    const contactHasAccountApi = articleText.indexOf("/v1/account") !== -1;
    console.log(
      "SeenShot legal: contactDeleteH2=" + Boolean(contactDeleteH2) +
        " contactDeleteP=" + Boolean(contactDeleteP) +
        " contactDeleteText=" + contactDeleteText +
        " contactHasAccountApi=" + String(contactHasAccountApi)
    );
    if (location.pathname.indexOf("/contact") === 0 && contactHasAccountApi) {
      console.error("SeenShot legal: Contact still lists account API or export path=" + location.pathname);
    }
    // ─── Ariadne's Thread [AT-0374] ─────────────────────
    // What: Treat vendor names and file formats as internals on legal copy
    // Why:  Technical pages must stay general. Polar, PNG, GitHub must not appear
    // Date: 2026-08-28
    // Related: [AT-0374] public/privacy/index.html, [AT-0371] public/js/legal.js
    // ─────────────────────────────────────────────────────
    const codeEls = document.querySelectorAll("article.legal code");
    console.log("SeenShot legal: codeTags=" + codeEls.length);
    let internalsHit = "";
    const needles = [
      "/v1/",
      "posthog_optout",
      "i.posthog.com",
      "private/{",
      "public/{",
      "QSettings",
      "seenshot://",
      "seenshot_id",
      "array.js",
      "Workers",
      "Firebase",
      "Polar",
      "PostHog",
      "Cloudflare",
      "GitHub",
      "PNG",
      "HTTPS",
      "DMG",
      "first-party",
      "pageviews",
      "user row",
      "takedown row"
    ];
    let needleIndex = 0;
    while (needleIndex < needles.length) {
      const needle = needles[needleIndex];
      if (articleText.indexOf(needle) !== -1) {
        internalsHit = needle;
        break;
      }
      needleIndex += 1;
    }
    codeEls.forEach(function (el) {
      const codeText = el.textContent || "";
      console.log("SeenShot legal: code=" + codeText);
    });
    console.log(
      "SeenShot legal: internalsHit=" + (internalsHit || "none") +
        " articleChars=" + articleText.length
    );
    const legalPaths = [
      "/privacy",
      "/terms",
      "/cookies",
      "/refund",
      "/acceptable-use",
      "/copyright",
      "/contact"
    ];
    let onLegal = false;
    let pathIndex = 0;
    while (pathIndex < legalPaths.length) {
      if (location.pathname.indexOf(legalPaths[pathIndex]) === 0) {
        onLegal = true;
        break;
      }
      pathIndex += 1;
    }
    if (onLegal && internalsHit) {
      console.error(
        "SeenShot legal: internals still in article path=" + location.pathname +
          " hit=" + internalsHit
      );
    }
    if (onLegal && mailLinks.length === 0) {
      console.error("SeenShot legal: qa@seenshot.app mailto missing path=" + location.pathname);
    }
    // ─── Ariadne's Thread [AT-0360] ─────────────────────
    // What: Log article.legal.card computed background and color
    // Why:  Legal and blog cards must paint #fff with ink text
    // Date: 2026-08-28
    // Related: [AT-0360] public/css/site.css:article.legal.card, [AT-0253] public/js/legal.js
    // ─────────────────────────────────────────────────────
    if (legalCard) {
      const cardCs = getComputedStyle(legalCard);
      console.log(
        "SeenShot legal: article.legal.card background=" + cardCs.backgroundColor +
          " color=" + cardCs.color +
          " width=" + Math.round(legalCard.getBoundingClientRect().width)
      );
    }
    // ─── Ariadne's Thread [AT-0291] ─────────────────────
    // What: Log .site-foot width next to .topnav
    // Why:  Cabinet footer must match the full-width header, not the 720px landing column
    // Date: 2026-08-27
    // Related: [AT-0290] public/css/site.css:.site-foot, [AT-0253] public/js/legal.js
    // ─────────────────────────────────────────────────────
    const foot = document.querySelector(".site-foot");
    const topnav = document.querySelector(".topnav");
    if (foot) {
      const footBox = foot.getBoundingClientRect();
      const navBox = topnav ? topnav.getBoundingClientRect() : null;
      const operator = foot.querySelector("p");
      const footNav = foot.querySelector("nav");
      const footCs = getComputedStyle(foot);
      const navCs = footNav ? getComputedStyle(footNav) : null;
      console.log(
        "SeenShot legal: footer width=" + Math.round(footBox.width) +
          " left=" + Math.round(footBox.left) +
          " top=" + Math.round(footBox.top) +
          " bottom=" + Math.round(footBox.bottom) +
          " vh=" + Math.round(window.innerHeight) +
          " pinned=" + (Math.round(footBox.bottom) >= Math.round(window.innerHeight) - 2) +
          " operatorP=" + Boolean(operator) +
          " topnavWidth=" + (navBox ? Math.round(navBox.width) : 0) +
          " match=" + (navBox ? Math.round(footBox.width) === Math.round(navBox.width) : false) +
          " justify=" + footCs.justifyContent +
          " navJustify=" + (navCs ? navCs.justifyContent : "") +
          " navWidth=" + (footNav ? Math.round(footNav.getBoundingClientRect().width) : 0)
      );
      const firstLink = foot.querySelector("a");
      if (firstLink) {
        console.log(
          "SeenShot legal: footer linkColor=" + getComputedStyle(firstLink).color +
            " href=" + (firstLink.getAttribute("href") || "")
        );
      }
      // ─── Ariadne's Thread [AT-0393] ─────────────────────
      // What: Log Code Market partners widget mount in .site-foot
      // Why:  widget.min.js hides the div until logos load; empty footer must be visible in console
      // Date: 2026-08-31
      // Related: [AT-0393] public/css/site.css:.site-foot [data-codemarket-widget], https://code.market/widget.min.js
      // ─────────────────────────────────────────────────────
      const partnersWidget = foot.querySelector("[data-codemarket-widget]");
      console.log(
        "SeenShot legal: partnersWidget=" +
          (partnersWidget ? (partnersWidget.getAttribute("data-codemarket-widget") || "") : "none") +
          " rendered=" +
          (partnersWidget ? (partnersWidget.getAttribute("data-widget-rendered") || "false") : "none") +
          " display=" +
          (partnersWidget ? getComputedStyle(partnersWidget).display : "none") +
          " childCount=" +
          (partnersWidget ? partnersWidget.childNodes.length : 0)
      );
      // ─── Ariadne's Thread [AT-0470] ─────────────────────
      // What: Log the benchmark.directory footer badge and badge-row layout
      // Why:  Verify the supplied badge sits beside Code Market with its exact link attributes
      // Date: 2026-09-03
      // Related: [AT-0468] components/SiteChrome.tsx:.site-badges, [AT-0469] app/site.css:.site-badges
      // ─────────────────────────────────────────────────────
      const badgeRow = foot.querySelector(".site-badges");
      const benchmarkBadge = foot.querySelector('a[href="https://benchmark.directory/tools/seenshot-app"]');
      const badgeRowBox = badgeRow ? badgeRow.getBoundingClientRect() : null;
      const benchmarkBox = benchmarkBadge ? benchmarkBadge.getBoundingClientRect() : null;
      console.log(
        "SeenShot legal: benchmarkBadge=" + Boolean(benchmarkBadge) +
          " href=" + (benchmarkBadge ? (benchmarkBadge.getAttribute("href") || "") : "") +
          " target=" + (benchmarkBadge ? (benchmarkBadge.getAttribute("target") || "") : "") +
          " rel=" + (benchmarkBadge ? (benchmarkBadge.getAttribute("rel") || "") : "") +
          " title=" + (benchmarkBadge ? (benchmarkBadge.getAttribute("title") || "") : "") +
          " text=" + (benchmarkBadge ? (benchmarkBadge.textContent || "").trim() : "") +
          " width=" + (benchmarkBox ? Math.round(benchmarkBox.width) : 0) +
          " height=" + (benchmarkBox ? Math.round(benchmarkBox.height) : 0) +
          " rowWidth=" + (badgeRowBox ? Math.round(badgeRowBox.width) : 0) +
          " rowDisplay=" + (badgeRow ? getComputedStyle(badgeRow).display : "none") +
          " rowChildren=" + (badgeRow ? badgeRow.children.length : 0)
      );
      if (!benchmarkBadge) {
        console.error("SeenShot legal: benchmark.directory footer badge missing");
      }
    } else {
      console.warn("SeenShot legal: footer missing");
    }
    const authMain = document.querySelector("main.page-auth");
    if (authMain) {
      const mainBox = authMain.getBoundingClientRect();
      const form = authMain.querySelector(".auth-form");
      const formBox = form ? form.getBoundingClientRect() : null;
      console.log(
        "SeenShot legal: page-auth h=" + Math.round(mainBox.height) +
          " top=" + Math.round(mainBox.top) +
          " bottom=" + Math.round(mainBox.bottom) +
          " vh=" + Math.round(window.innerHeight) +
          " formTop=" + (formBox ? Math.round(formBox.top) : 0) +
          " formH=" + (formBox ? Math.round(formBox.height) : 0),
      );
    }

}
