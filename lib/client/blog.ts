// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0350] ─────────────────────
   What: Log /blog/ index and /blog/{slug}/ article pages
   Why:  Blog list and first article must leave an English console trail
   Date: 2026-08-28
   Related: [AT-0349] public/blog/index.html, [AT-0253] public/js/legal.js
─────────────────────────────────────────────────────── */

import { jsonLdNodeByType, readJsonLdScript } from "@/lib/client/jsonld";

let started = false;

// ─── Ariadne's Thread [AT-0497] ─────────────────────
// What: Log the Keenable report page without Share Report chrome
// Why:  The SELECT top bar is gone; leftover share bind would error on missing nodes
// Date: 2026-09-04
// Related: [AT-0496] lib/client/blog.ts:startKeenableReport, [AT-0495] content/blog-screenshot-visual-privacy-apps.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0498] ─────────────────────
// What: Log that the Keenable SELECT footer is absent from the hosted report
// Why:  Run your own research chrome was stripped; leftover footer nodes would mean the HTML export regressed
// Date: 2026-09-04
// Related: [AT-0497] content/blog-screenshot-visual-privacy-apps.ts, [AT-0496] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0499] ─────────────────────
// What: Log Medium-style report voice plus asked/lede copy on the hosted article
// Why:  Confirm the SELECT auto-report voice was replaced without dropping asked/lede blocks
// Date: 2026-09-04
// Related: [AT-0499] content/blog-screenshot-visual-privacy-apps.ts, [AT-0496] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0500] ─────────────────────
// What: Log that SeenShot is present in the hosted feature-map article
// Why:  The original scrape omitted it; a missing heading means the inventory block dropped
// Date: 2026-09-04
// Related: [AT-0500] content/blog-screenshot-visual-privacy-apps.ts, [AT-0499] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0501] ─────────────────────
// What: Log that the hosted report h1 is Screenshot apps landscape at 2026
// Why:  Tab and h1 must stay on the landscape-at-year format
// Date: 2026-09-04
// Related: [AT-0501] content/blog-screenshot-visual-privacy-apps.ts, [AT-0499] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0502] ─────────────────────
// What: Log the landing founder card at the start of the hosted report wrap
// Why:  A missing aside.founder means the article no longer names who wrote it
// Date: 2026-09-04
// Related: [AT-0502] content/blog-screenshot-visual-privacy-apps.ts, [AT-0263] components/LandingMain.tsx:.founder
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0503] ─────────────────────
// What: Log that the Keenable SELECT plaque is absent from the hosted report
// Why:  Made with Keenable SELECT chrome was stripped; leftover plaque nodes would mean the HTML export regressed
// Date: 2026-09-04
// Related: [AT-0498] lib/client/blog.ts:startKeenableReport, [AT-0503] content/blog-screenshot-visual-privacy-apps.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0504] ─────────────────────
// What: Log hosted report wrap padding-top after the top inset
// Why:  A 56px wrap pad means the founder card is still tight against .topnav
// Date: 2026-09-04
// Related: [AT-0504] app/site.css:main.keenable-report .wrap, [AT-0503] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0505] ─────────────────────
// What: Log that p.method and the Keenable legal disclaimer are absent
// Why:  Leftover method or legal nodes would mean the HTML export regressed
// Date: 2026-09-04
// Related: [AT-0505] content/blog-screenshot-visual-privacy-apps.ts, [AT-0503] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0506] ─────────────────────
// What: Log the expanded SeenShot inventory list count and both table rows
// Why:  A short list means Features/Pricing lines dropped off the dual-shelf inventory
// Date: 2026-09-04
// Related: [AT-0506] content/blog-screenshot-visual-privacy-apps.ts, [AT-0505] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0507] ─────────────────────
// What: Log the Privacy & redaction products note and first table row as SeenShot
// Why:  A CaseGuard-first privacy table means the blur-shelf listing is not visible at that heading
// Date: 2026-09-04
// Related: [AT-0507] content/blog-screenshot-visual-privacy-apps.ts, [AT-0506] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0508] ─────────────────────
// What: Log SeenShot Feature mentions as 30 matching the seenshot.app inventory
// Why:  An n/a cell means the Top tables still treat SeenShot as missing from the count
// Date: 2026-09-04
// Related: [AT-0508] content/blog-screenshot-visual-privacy-apps.ts, [AT-0506] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0509] ─────────────────────
// What: Log the privacy volume table last row as SeenShot with Feature mentions 30
// Why:  tblwrap[3] tr[16] n/a meant the last privacy row still looked like a scrape miss
// Date: 2026-09-04
// Related: [AT-0509] content/blog-screenshot-visual-privacy-apps.ts, [AT-0508] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0510] ─────────────────────
// What: Log that volume tables and the 96-feature grid are macOS-only
// Why:  A leftover Windows, Linux, iOS, Android, or browser-only row means the Mac filter dropped
// Date: 2026-09-05
// Related: [AT-0510] content/blog-screenshot-visual-privacy-apps.ts, [AT-0509] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0511] ─────────────────────
// What: Log that .asked is the modern-macOS-screenshot-app brief
// Why:  Leftover collect-all-features wording means the Keenable prompt came back
// Date: 2026-09-05
// Related: [AT-0511] content/blog-screenshot-visual-privacy-apps.ts, [AT-0510] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0512] ─────────────────────
// What: Log that .lede is the unsexy-niche plus LLM-volume line
// Why:  Leftover feature-list lede means the 2026 LLM brief dropped
// Date: 2026-09-05
// Related: [AT-0512] content/blog-screenshot-visual-privacy-apps.ts, [AT-0511] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0513] ─────────────────────
// What: Log that the two intro method paragraphs continue the LLM-niche narrative
// Why:  A scrape-only open means the 2026 job dropped between lede and the heatmap
// Date: 2026-09-05
// Related: [AT-0513] content/blog-screenshot-visual-privacy-apps.ts, [AT-0512] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0514] ─────────────────────
// What: Log 60 market products and 800,000 monthly queries in the first intro paragraph
// Why:  A missing search-demand line means the forgotten-niche claim has no size
// Date: 2026-09-05
// Related: [AT-0514] content/blog-screenshot-visual-privacy-apps.ts, [AT-0513] lib/client/blog.ts:startKeenableReport
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0572] ─────────────────────
// What: Log Blog and BlogPosting JSON-LD on /blog/ and article pages
// Why:  Personal-blog nesting must expose Person, Blog, and BlogPosting in the graph
// Date: 2026-09-05
// Related: [AT-0568] content/site-jsonld.ts:blogIndexJsonLd, [AT-0569] components/JsonLdScript.tsx, https://schema.org/Blog
// ─────────────────────────────────────────────────────
function logBlogJsonLd() {
  const path = location.pathname;
  const isIndex = path === "/blog" || path === "/blog/";
  const scriptId = isIndex ? "blog-jsonld" : "article-jsonld";
  const jsonLd = readJsonLdScript(scriptId);
  const person = jsonLdNodeByType(jsonLd.graph, "Person");
  const blog = jsonLdNodeByType(jsonLd.graph, "Blog");
  const posting = jsonLdNodeByType(jsonLd.graph, "BlogPosting");
  const collection = jsonLdNodeByType(jsonLd.graph, "CollectionPage");
  const software = jsonLdNodeByType(jsonLd.graph, "SoftwareApplication");
  const personName = person && person.name ? String(person.name) : "";
  const personUrl = person && person.url ? String(person.url) : "";
  const blogPosts = blog && Array.isArray(blog.blogPost) ? blog.blogPost : [];
  const postingHeadline = posting && posting.headline ? String(posting.headline) : "";
  const postingAuthor = posting && Array.isArray(posting.author) ? posting.author[0] : posting && posting.author;
  const postingAuthorName = postingAuthor && postingAuthor.name ? String(postingAuthor.name) : "";
  const h1 = document.querySelector("h1");
  const h1Text = h1 ? (h1.textContent || "").trim() : "";
  console.log(
    "SeenShot blog: jsonld path=" + path +
      " scriptId=" + scriptId +
      " person=" + personName +
      " personUrl=" + personUrl +
      " blogPosts=" + blogPosts.length +
      " collection=" + Boolean(collection) +
      " softwareOs=" + (software && software.operatingSystem ? software.operatingSystem : "") +
      " postingHeadline=" + postingHeadline +
      " postingAuthor=" + postingAuthorName +
      " h1=" + h1Text
  );
  blogPosts.forEach(function (post, index) {
    console.log(
      "SeenShot blog: jsonld blogPost[" + index + "] type=" + (post ? post["@type"] : "") +
        " id=" + (post ? post["@id"] : "") +
        " headline=" + (post ? post.headline : "") +
        " datePublished=" + (post ? post.datePublished : "")
    );
  });
  const personOk = personName === "Alex Ign" && personUrl === "https://www.linkedin.com/in/ignalex/";
  if (isIndex) {
    const indexOk = Boolean(
      jsonLd.scriptType === "application/ld+json" &&
        jsonLd.parsed &&
        jsonLd.parsed["@context"] === "https://schema.org" &&
        blog &&
        blog["@type"] === "Blog" &&
        blogPosts.length === 2 &&
        collection &&
        personOk
    );
    console.log("SeenShot blog: jsonld indexOk=" + String(indexOk));
    if (!indexOk) {
      console.error("SeenShot blog: Blog JSON-LD is missing or invalid");
    }
    return;
  }
  const articleOk = Boolean(
    jsonLd.scriptType === "application/ld+json" &&
      jsonLd.parsed &&
      jsonLd.parsed["@context"] === "https://schema.org" &&
      posting &&
      posting["@type"] === "BlogPosting" &&
      postingHeadline === h1Text &&
      postingAuthorName === "Alex Ign" &&
      personOk
  );
  console.log("SeenShot blog: jsonld articleOk=" + String(articleOk));
  if (!articleOk) {
    console.error("SeenShot blog: BlogPosting JSON-LD is missing or invalid");
  }
}

function startKeenableReport(report) {
  const path = location.pathname;
  const h1 = report.querySelector("h1");
  const heat = report.querySelector("#heat");
  const headings = report.querySelectorAll("h1, h2, h3, h4");
  const pills = report.querySelectorAll(".pill");
  const tables = report.querySelectorAll("table");
  const findings = report.querySelectorAll(".findings > div");
  const bar = report.querySelector("[data-keenable-bar]");
  const footer = report.querySelector("[data-keenable-footer]");
  const plaque = report.querySelector("[data-keenable-plaque]");
  const track = report.querySelector("[data-keenable-track]");
  const method = report.querySelector("p.method");
  const legal = report.querySelector("[data-keenable-legal]");
  const asked = report.querySelector(".asked");
  const lede = report.querySelector(".lede");
  const storyP1 = lede && lede.nextElementSibling && lede.nextElementSibling.tagName === "P" ? lede.nextElementSibling : null;
  const storyP2 = storyP1 && storyP1.nextElementSibling && storyP1.nextElementSibling.tagName === "P" ? storyP1.nextElementSibling : null;
  const storyP1Text = storyP1 ? storyP1.textContent : "";
  const storyP2Text = storyP2 ? storyP2.textContent : "";
  const founder = report.querySelector("aside.founder");
  const founderName = founder ? founder.querySelector(".founder-name") : null;
  const founderHandle = founder ? founder.querySelector(".founder-handle") : null;
  const founderImg = founder ? founder.querySelector("img") : null;
  const wrapFirst = report.querySelector(".wrap") ? report.querySelector(".wrap").firstElementChild : null;
  const seenshotHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent === "What SeenShot ships today";
  });
  let seenshotLis = 0;
  if (seenshotHeading) {
    let node = seenshotHeading.nextElementSibling;
    while (node && node.tagName !== "H2") {
      seenshotLis += node.querySelectorAll("li").length;
      node = node.nextElementSibling;
    }
  }
  const seenshotRows = Array.prototype.filter.call(report.querySelectorAll("table tr"), function (row) {
    const cell = row.querySelector("td");
    return cell && cell.textContent === "SeenShot";
  });
  const seenshotRow = seenshotRows[0] || null;
  const seenshotMentions = Array.prototype.map.call(seenshotRows, function (row) {
    return row.cells[1] ? row.cells[1].textContent : "";
  }).join(",");
  const privacyHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent === "Privacy & redaction products";
  });
  const privacyNote = privacyHeading && privacyHeading.nextElementSibling && privacyHeading.nextElementSibling.tagName === "P"
    ? privacyHeading.nextElementSibling
    : null;
  const privacyTableWrap = privacyNote ? privacyNote.nextElementSibling : (privacyHeading ? privacyHeading.nextElementSibling : null);
  const privacyRows = privacyTableWrap ? privacyTableWrap.querySelectorAll("tr") : [];
  const privacyLastRow = privacyRows.length ? privacyRows[privacyRows.length - 1] : null;
  const privacyLastApp = privacyLastRow && privacyLastRow.cells[0] ? privacyLastRow.cells[0].textContent : "";
  const privacyLastMentions = privacyLastRow && privacyLastRow.cells[1] ? privacyLastRow.cells[1].textContent : "";
  const gridLis = report.querySelectorAll(".grid li").length;
  const heatHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent === "10 products on 18 pillars";
  });
  const featuresHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent === "96 features, 18 pillars";
  });
  const shapesHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent === "Three shapes in the market";
  });
  const overlayHeading = Array.prototype.find.call(headings, function (heading) {
    return heading.textContent.indexOf("Browser overlays") !== -1;
  });
  const volumePlatforms = [];
  Array.prototype.forEach.call(tables, function (table) {
    const th = table.querySelector("th");
    if (!th || th.textContent !== "App") {
      return;
    }
    Array.prototype.forEach.call(table.querySelectorAll("tr"), function (row) {
      if (!row.cells[0] || row.cells[0].tagName === "TH" || !row.cells[2]) {
        return;
      }
      volumePlatforms.push((row.cells[0].textContent || "") + ":" + (row.cells[2].textContent || ""));
    });
  });
  const nonMacPlatforms = volumePlatforms.filter(function (row) {
    const plat = row.split(":")[1].toLowerCase();
    return plat.indexOf("mac") === -1 && plat.indexOf("apple silicon") === -1;
  });
  const bannedNames = ["Snagit", "ShareX", "PicPick", "Flameshot", "CaseGuard", "Screenpresso", "Xnapper"];
  const bannedHits = bannedNames.filter(function (name) {
    return report.textContent.indexOf(name) !== -1;
  });
  const iosBlurData = report.textContent.indexOf("iOS version for redacting") !== -1;
  const wrapStyle = report.querySelector(".wrap") ? getComputedStyle(report.querySelector(".wrap")) : null;
  const reportStyle = getComputedStyle(report);
  const askedStyle = asked ? getComputedStyle(asked) : null;
  console.log(
    "SeenShot blog: keenableReport path=" + path +
      " voice=mediumProductArticle" +
      " title=" + document.title +
      " h1=" + (h1 ? h1.textContent : "") +
      " headings=" + headings.length +
      " pills=" + pills.length +
      " tables=" + tables.length +
      " findings=" + findings.length +
      " seenshotHeading=" + (seenshotHeading ? "yes" : "no") +
      " seenshotLis=" + seenshotLis +
      " seenshotRow=" + (seenshotRow ? "yes" : "no") +
      " seenshotRows=" + seenshotRows.length +
      " seenshotMentions=" + seenshotMentions +
      " privacyNote=" + (privacyNote ? "yes" : "no") +
      " privacyLastApp=" + privacyLastApp +
      " privacyLastMentions=" + privacyLastMentions +
      " gridLis=" + gridLis +
      " heatHeading=" + (heatHeading ? "yes" : "no") +
      " featuresHeading=" + (featuresHeading ? "yes" : "no") +
      " shapesHeading=" + (shapesHeading ? "yes" : "no") +
      " overlayHeading=" + (overlayHeading ? "yes" : "no") +
      " volumePlatforms=" + volumePlatforms.join("|") +
      " nonMacPlatforms=" + nonMacPlatforms.length +
      " bannedHits=" + bannedHits.join(",") +
      " iosBlurData=" + String(iosBlurData) +
      " asked=" + (asked ? "yes" : "no") +
      " founder=" + (founder ? "yes" : "no") +
      " founderFirst=" + (wrapFirst && wrapFirst.classList.contains("founder") ? "yes" : "no") +
      " founderName=" + (founderName ? founderName.textContent : "") +
      " founderHandle=" + (founderHandle ? founderHandle.textContent : "") +
      " founderHref=" + (founderHandle ? founderHandle.getAttribute("href") : "") +
      " founderImg=" + (founderImg ? founderImg.getAttribute("src") : "") +
      " ledeChars=" + (lede ? lede.textContent.length : 0) +
      " storyP1=" + (storyP1 ? "yes" : "no") +
      " storyP2=" + (storyP2 ? "yes" : "no") +
      " storyP1Chars=" + storyP1Text.length +
      " storyP1Market=" + String(storyP1Text.indexOf("60 screenshot products on the market") !== -1) +
      " storyP1Search=" + String(storyP1Text.indexOf("800,000 queries a month") !== -1) +
      " storyP2Chars=" + storyP2Text.length +
      " heatChildren=" + (heat ? heat.childElementCount : -1) +
      " heatEmpty=" + (heat ? String(heat.childElementCount === 0) : "missing") +
      " bar=" + (bar ? "yes" : "no") +
      " footer=" + (footer ? "yes" : "no") +
      " plaque=" + (plaque ? "yes" : "no") +
      " track=" + (track ? "yes" : "no") +
      " method=" + (method ? "yes" : "no") +
      " legal=" + (legal ? "yes" : "no") +
      " bg=" + reportStyle.backgroundColor +
      " color=" + reportStyle.color +
      " font=" + reportStyle.fontFamily +
      " wrapMax=" + (wrapStyle ? wrapStyle.maxWidth : "") +
      " wrapPadTop=" + (wrapStyle ? wrapStyle.paddingTop : "") +
      " askedBg=" + (askedStyle ? askedStyle.backgroundColor : "")
  );
  if (h1 && h1.textContent === "Screenshot apps landscape at 2026") {
    console.log("SeenShot blog: keenableReport landscape title present");
  } else {
    console.error("SeenShot blog: keenableReport landscape title missing h1=" + (h1 ? h1.textContent : ""));
  }
  if (wrapStyle) {
    console.log(
      "SeenShot blog: keenableReport wrap padding-top=" + wrapStyle.paddingTop +
        " padding-right=" + wrapStyle.paddingRight +
        " padding-bottom=" + wrapStyle.paddingBottom +
        " padding-left=" + wrapStyle.paddingLeft
    );
  } else {
    console.error("SeenShot blog: keenableReport wrap missing");
  }
  if (founder && wrapFirst && wrapFirst.classList.contains("founder") && founderName && founderName.textContent === "Alex Ign") {
    console.log(
      "SeenShot blog: keenableReport founder card present name=" + founderName.textContent +
        " handle=" + (founderHandle ? founderHandle.textContent : "") +
        " href=" + (founderHandle ? founderHandle.getAttribute("href") : "") +
        " img=" + (founderImg ? founderImg.getAttribute("src") : "")
    );
  } else {
    console.error("SeenShot blog: keenableReport founder card missing at wrap start");
  }
  console.log("SeenShot blog: keenableReport askedText=" + (asked ? asked.textContent : ""));
  const askedBrief =
    "I set out to build a modern macOS screenshot app. To do that I had to map what already ships on the market and which challenges in 2026 are still unsolved in this space.";
  const askedHasOldCollect = asked ? asked.textContent.indexOf("I need collect all features") !== -1 : false;
  if (asked && asked.textContent.indexOf(askedBrief) !== -1 && !askedHasOldCollect) {
    console.log(
      "SeenShot blog: keenableReport asked brief ok macOS=yes year=2026 collectPrompt=" + String(askedHasOldCollect)
    );
  } else {
    console.error(
      "SeenShot blog: keenableReport asked brief failed text=" + (asked ? asked.textContent : "") +
        " collectPrompt=" + String(askedHasOldCollect)
    );
  }
  console.log("SeenShot blog: keenableReport ledeText=" + (lede ? lede.textContent : ""));
  const ledeLine =
    "macOS screenshot apps are an unsexy niche people almost forgot. In 2026 we send hundreds of screenshots to our LLMs.";
  const ledeHasOldFeatureList = lede ? lede.textContent.indexOf("I needed a feature list") !== -1 : false;
  if (lede && lede.textContent === ledeLine && !ledeHasOldFeatureList) {
    console.log(
      "SeenShot blog: keenableReport lede ok niche=unsexy year=2026 llms=yes hundreds=yes oldFeatureList=" +
        String(ledeHasOldFeatureList)
    );
  } else {
    console.error(
      "SeenShot blog: keenableReport lede failed text=" + (lede ? lede.textContent : "") +
        " oldFeatureList=" + String(ledeHasOldFeatureList)
    );
  }
  console.log("SeenShot blog: keenableReport storyP1Text=" + storyP1Text);
  console.log("SeenShot blog: keenableReport storyP2Text=" + storyP2Text);
  const storyP1HasJob = storyP1Text.indexOf("That is the job now: a screenshot into an LLM") !== -1;
  const storyP1HasMarket = storyP1Text.indexOf("60 screenshot products on the market") !== -1;
  const storyP1HasSearch = storyP1Text.indexOf("800,000 queries a month") !== -1;
  const storyP1HasCounts =
    storyP1Text.indexOf("1,672") !== -1 &&
    storyP1Text.indexOf("8,541") !== -1 &&
    storyP1Text.indexOf("60 products") !== -1 &&
    storyP1Text.indexOf("1,489") !== -1 &&
    storyP1Text.indexOf("5,469") !== -1;
  const storyP1HasOpen = storyP1Text.indexOf("what is still open") !== -1;
  const storyP2HasUnsolved = storyP2Text.indexOf("challenges that are still unsolved when we send hundreds of shots to LLMs") !== -1;
  const storyP2HasCutoff = storyP2Text.indexOf("Cutoff is 2026-09-04") !== -1 && storyP2Text.indexOf("96 macOS features") !== -1 && storyP2Text.indexOf("BlurData's own 19") !== -1;
  if (storyP1HasJob && storyP1HasMarket && storyP1HasSearch && storyP1HasCounts && storyP1HasOpen && storyP2HasUnsolved && storyP2HasCutoff) {
    console.log(
      "SeenShot blog: keenableReport story paras ok job=llm market=60 search=800000 counts=yes unsolved=yes cutoff=2026-09-04 features=96 blurdata=19"
    );
  } else {
    console.error(
      "SeenShot blog: keenableReport story paras failed job=" + String(storyP1HasJob) +
        " market=" + String(storyP1HasMarket) +
        " search=" + String(storyP1HasSearch) +
        " counts=" + String(storyP1HasCounts) +
        " open=" + String(storyP1HasOpen) +
        " unsolved=" + String(storyP2HasUnsolved) +
        " cutoff=" + String(storyP2HasCutoff)
    );
  }
  if (seenshotHeading) {
    console.log("SeenShot blog: keenableReport seenshot inventory heading present lis=" + seenshotLis);
  } else {
    console.error("SeenShot blog: keenableReport SeenShot inventory heading missing");
  }
  if (seenshotLis < 20) {
    console.error("SeenShot blog: keenableReport SeenShot inventory too short lis=" + seenshotLis);
  }
  if (seenshotRows.length === 2) {
    console.log(
      "SeenShot blog: keenableReport seenshot table rows=" + seenshotRows.length +
        " platform=" + (seenshotRow && seenshotRow.cells[2] ? seenshotRow.cells[2].textContent : "") +
        " mentions=" + seenshotMentions
    );
  } else {
    console.error("SeenShot blog: keenableReport SeenShot table rows expected 2 got=" + seenshotRows.length);
  }
  if (seenshotMentions === "30,30") {
    console.log("SeenShot blog: keenableReport seenshot feature mentions=30,30");
  } else {
    console.error("SeenShot blog: keenableReport seenshot feature mentions expected 30,30 got=" + seenshotMentions);
  }
  if (privacyNote && privacyNote.textContent.indexOf("Auto Blur Sensitive data") !== -1) {
    console.log("SeenShot blog: keenableReport privacy products note present text=" + privacyNote.textContent);
  } else {
    console.error("SeenShot blog: keenableReport privacy products note missing");
  }
  if (privacyLastApp === "SeenShot" && privacyLastMentions === "30") {
    console.log("SeenShot blog: keenableReport privacy products last row app=" + privacyLastApp + " mentions=" + privacyLastMentions);
  } else {
    console.error("SeenShot blog: keenableReport privacy products last row app=" + privacyLastApp + " mentions=" + privacyLastMentions);
  }
  if (gridLis === 96 && heatHeading && featuresHeading && shapesHeading && !overlayHeading && nonMacPlatforms.length === 0 && bannedHits.length === 0 && !iosBlurData) {
    console.log(
      "SeenShot blog: keenableReport macos filter ok gridLis=" + gridLis +
        " volume=" + volumePlatforms.join("|")
    );
  } else {
    console.error(
      "SeenShot blog: keenableReport macos filter failed gridLis=" + gridLis +
        " heatHeading=" + (heatHeading ? "yes" : "no") +
        " featuresHeading=" + (featuresHeading ? "yes" : "no") +
        " shapesHeading=" + (shapesHeading ? "yes" : "no") +
        " overlayHeading=" + (overlayHeading ? "yes" : "no") +
        " nonMacPlatforms=" + nonMacPlatforms.join("|") +
        " bannedHits=" + bannedHits.join(",") +
        " iosBlurData=" + String(iosBlurData)
    );
  }
  headings.forEach(function (heading) {
    console.log("SeenShot blog: keenable heading=" + heading.tagName + " text=" + heading.textContent);
  });
  if (bar) {
    console.error("SeenShot blog: keenable SELECT bar still in DOM");
  } else {
    console.log("SeenShot blog: keenable SELECT bar removed");
  }
  if (footer) {
    console.error("SeenShot blog: keenable SELECT footer still in DOM");
  } else {
    console.log("SeenShot blog: keenable SELECT footer removed");
  }
  if (plaque || track) {
    console.error("SeenShot blog: keenable SELECT plaque still in DOM");
  } else {
    console.log("SeenShot blog: keenable SELECT plaque removed");
  }
  if (method) {
    console.error("SeenShot blog: keenable method paragraph still in DOM");
  } else {
    console.log("SeenShot blog: keenable method paragraph removed");
  }
  if (legal) {
    console.error("SeenShot blog: keenable legal disclaimer still in DOM");
  } else {
    console.log("SeenShot blog: keenable legal disclaimer removed");
  }
  if (!heat) {
    console.error("SeenShot blog: keenable heatmap missing #heat");
  } else if (heat.childElementCount === 0) {
    console.warn("SeenShot blog: keenable heatmap empty, source page had no injected cell data");
  }
  logBlogJsonLd();
}

export function startBlog() {
  if (started) {
    console.warn("SeenShot startBlog: start ignored, already started");
    return;
  }
  started = true;

    const path = location.pathname;
    const report = document.querySelector("main.keenable-report");
    if (report) {
      startKeenableReport(report);
      return;
    }
    const article = document.querySelector("main.legal-page article.legal");
    const articleStyle = article ? getComputedStyle(article) : null;
    const h1 = article ? article.querySelector("h1") : null;
    const indexLinks = document.querySelectorAll(".blog-index a[href^='/blog/']");
    const headings = article ? article.querySelectorAll("h1, h2, h3") : [];
    const shots = article ? article.querySelectorAll("figure.tool-shot img") : [];
    // ─── Ariadne's Thread [AT-0360] ─────────────────────
    // What: Log article.legal.card computed background and color
    // Why:  Blog article body must paint #fff with ink text
    // Date: 2026-08-28
    // Related: [AT-0360] public/css/site.css:article.legal.card, [AT-0350] public/js/blog.js
    // ─────────────────────────────────────────────────────
    const authorMeta = document.querySelector('meta[name="author"]');
    const founder = document.querySelector("article.legal.card aside.founder");
    const founderName = founder ? founder.querySelector(".founder-name") : null;
    const founderHandle = founder ? founder.querySelector(".founder-handle") : null;
    const founderPhoto = founder ? founder.querySelector("img") : null;
    const founderBody = founder ? founder.querySelector(".founder-copy p:last-child") : null;
    const founderStyle = founder ? getComputedStyle(founder) : null;
    // ─── Ariadne's Thread [AT-0366] ─────────────────────
    // What: Log article p.meta including the Alex Ign byline
    // Why:  Blog date line must show the author after a period
    // Date: 2026-08-28
    // Related: [AT-0366] public/blog/best-screenshot-apps-2026/index.html, [AT-0350] public/js/blog.js
    // ─────────────────────────────────────────────────────
    const articleMeta = article ? article.querySelector("p.meta") : null;
    console.log(
      "SeenShot blog: path=" + path +
        " title=" + document.title +
        " h1=" + (h1 ? h1.textContent : "") +
        " meta=" + (articleMeta ? articleMeta.textContent : "") +
        " indexLinks=" + indexLinks.length +
        " headings=" + headings.length +
        " toolShots=" + shots.length +
        " articleBg=" + (articleStyle ? articleStyle.backgroundColor : "") +
        " articleColor=" + (articleStyle ? articleStyle.color : "")
    );
    // ─── Ariadne's Thread [AT-0580] ─────────────────────
    // What: Log that /blog/ h1 and By Alex Ign share one flex row
    // Why:  A wrapped or stacked byline means the index title is not one line
    // Date: 2026-09-05
    // Related: [AT-0580] content/blog-index.ts, [AT-0380] app/site.css:.pricing-head
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0581] ─────────────────────
    // What: Log that /blog/ title is left and By Alex Ign is right
    // Why:  space-between must pin the byline to the card edge
    // Date: 2026-09-05
    // Related: [AT-0581] app/site.css:.blog-index-head, [AT-0580] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const indexHead = document.querySelector(".blog-index-head");
    const indexHeadH1 = indexHead ? indexHead.querySelector("h1") : null;
    const indexHeadMeta = indexHead ? indexHead.querySelector("p.meta") : null;
    const indexHeadCs = indexHead ? getComputedStyle(indexHead) : null;
    const indexHeadH1Box = indexHeadH1 ? indexHeadH1.getBoundingClientRect() : null;
    const indexHeadMetaBox = indexHeadMeta ? indexHeadMeta.getBoundingClientRect() : null;
    const indexHeadBox = indexHead ? indexHead.getBoundingClientRect() : null;
    const indexHeadOneLine = Boolean(
      indexHeadH1Box &&
        indexHeadMetaBox &&
        Math.abs(indexHeadH1Box.top - indexHeadMetaBox.top) < 8
    );
    const indexHeadJustify = indexHeadCs ? indexHeadCs.justifyContent : "";
    const indexHeadSplit = Boolean(
      indexHeadBox &&
        indexHeadH1Box &&
        indexHeadMetaBox &&
        indexHeadH1Box.left <= indexHeadBox.left + 2 &&
        Math.abs(indexHeadMetaBox.right - indexHeadBox.right) < 4
    );
    const isBlogIndex = path === "/blog" || path === "/blog/";
    console.log(
      "SeenShot blog: indexHead=" + Boolean(indexHead) +
        " display=" + (indexHeadCs ? indexHeadCs.display : "") +
        " flexDir=" + (indexHeadCs ? indexHeadCs.flexDirection : "") +
        " wrap=" + (indexHeadCs ? indexHeadCs.flexWrap : "") +
        " justify=" + indexHeadJustify +
        " h1=" + (indexHeadH1 ? indexHeadH1.textContent : "") +
        " meta=" + (indexHeadMeta ? indexHeadMeta.textContent : "") +
        " oneLine=" + String(indexHeadOneLine) +
        " split=" + String(indexHeadSplit) +
        " width=" + (indexHeadBox ? Math.round(indexHeadBox.width) : "")
    );
    if (isBlogIndex && (!indexHead || indexHeadCs.display !== "flex" || !indexHeadOneLine)) {
      console.error(
        "SeenShot blog: /blog/ title and byline are not one line display=" +
          (indexHeadCs ? indexHeadCs.display : "") +
          " oneLine=" + String(indexHeadOneLine)
      );
    }
    if (isBlogIndex && (indexHeadJustify !== "space-between" || !indexHeadSplit)) {
      console.error(
        "SeenShot blog: /blog/ title is not justify-between justify=" +
          indexHeadJustify +
          " split=" + String(indexHeadSplit)
      );
    }
    // ─── Ariadne's Thread [AT-0622] ─────────────────────
    // What: Log the /blog/ Landings card after the article index
    // Why:  The second legal card must list landing titles with the same blog-index block
    // Date: 2026-09-06
    // Related: [AT-0622] components/BlogLandings.tsx:BlogLandings, [AT-0350] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const landingsCard = document.querySelector("article.blog-landings")
    const landingsHead = landingsCard ? landingsCard.querySelector(".blog-index-head") : null
    const landingsH1 = landingsHead ? landingsHead.querySelector("h1") : null
    const landingsLinks = landingsCard ? landingsCard.querySelectorAll(".blog-index a") : []
    console.log(
      "SeenShot blog: landingsCard=" + Boolean(landingsCard) +
        " landingsH1=" + (landingsH1 ? landingsH1.textContent : "") +
        " landingsLinks=" + landingsLinks.length
    )
    if (isBlogIndex && !landingsCard) {
      console.error("SeenShot blog: /blog/ missing landings card")
    }
    if (isBlogIndex && landingsLinks.length === 0) {
      console.error("SeenShot blog: /blog/ landings list empty")
    }
    landingsLinks.forEach(function (link, index) {
      console.log(
        "SeenShot blog: landings[" + index + "]" +
          " href=" + (link.getAttribute("href") || "") +
          " text=" + (link.textContent || "").trim()
      )
    })
    // ─── Ariadne's Thread [AT-0363] ─────────────────────
    // What: Log article author meta and aside.founder on the blog post
    // Why:  Best ScreenShot Apps 2026 must show Alex Ign as the writer
    // Date: 2026-08-28
    // Related: [AT-0363] public/blog/best-screenshot-apps-2026/index.html, [AT-0265] public/js/releases.js
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0365] ─────────────────────
    // What: Log that aside.founder is the last child of the article
    // Why:  Author card must sit at the end of Best ScreenShot Apps 2026
    // Date: 2026-08-28
    // Related: [AT-0365] public/blog/best-screenshot-apps-2026/index.html, [AT-0363] public/js/blog.js
    // ─────────────────────────────────────────────────────
    const founderLast = article && founder ? article.lastElementChild === founder : false;
    console.log(
      "SeenShot blog: authorMeta=" + (authorMeta ? authorMeta.getAttribute("content") : "") +
        " founder=" + (founder ? "yes" : "no") +
        " founderLast=" + String(founderLast) +
        " lastChild=" + (article && article.lastElementChild ? article.lastElementChild.tagName + "." + (article.lastElementChild.className || "") : "") +
        " name=" + (founderName ? founderName.textContent : "") +
        " handle=" + (founderHandle ? founderHandle.textContent : "") +
        " handleColor=" + (founderHandle ? getComputedStyle(founderHandle).color : "") +
        " founderBg=" + (founderStyle ? founderStyle.backgroundColor : "") +
        " founderColor=" + (founderStyle ? founderStyle.color : "") +
        " photo=" + (founderPhoto ? founderPhoto.getAttribute("src") : "") +
        " photoComplete=" + (founderPhoto ? String(founderPhoto.complete) : "none") +
        " photoLoading=" + (founderPhoto ? (founderPhoto.getAttribute("loading") || "") : "none") +
        " body=" + (founderBody ? founderBody.textContent : "") +
        " chars=" + (founderBody ? String(founderBody.textContent.length) : "0")
    );
    if (founderPhoto) {
      founderPhoto.addEventListener("load", function () {
        console.log(
          "SeenShot blog: founder photo loaded natural=" +
            founderPhoto.naturalWidth + "x" + founderPhoto.naturalHeight +
            " src=" + (founderPhoto.getAttribute("src") || "") +
            " loading=" + (founderPhoto.getAttribute("loading") || "")
        );
      });
      founderPhoto.addEventListener("error", function () {
        console.error("SeenShot blog: founder photo missing src=" + (founderPhoto.getAttribute("src") || ""));
      });
    }
    indexLinks.forEach(function (link, i) {
      console.log(
        "SeenShot blog: index[" + i + "] href=" + (link.getAttribute("href") || "") +
          " text=" + (link.textContent || "")
      );
    });
    headings.forEach(function (heading) {
      console.log("SeenShot blog: heading=" + heading.tagName + " text=" + heading.textContent);
    });
    // ─── Ariadne's Thread [AT-0574] ─────────────────────
    // What: Log the three AI-agent narrative paragraphs under the first 2026 article h2
    // Why:  The outdated-apps and agent-privacy copy must stay in the opening block
    // Date: 2026-09-05
    // Related: [AT-0573] content/blog-best-screenshot-apps-2026.ts, [AT-0350] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const firstH2 = article ? article.querySelector("h2") : null;
    const narrative1 = firstH2 ? firstH2.nextElementSibling : null;
    const narrative2 = narrative1 ? narrative1.nextElementSibling : null;
    const narrative3 = narrative2 ? narrative2.nextElementSibling : null;
    const narrative1Text = narrative1 && narrative1.tagName === "P" ? (narrative1.textContent || "").trim() : "";
    const narrative2Text = narrative2 && narrative2.tagName === "P" ? (narrative2.textContent || "").trim() : "";
    const narrative3Text = narrative3 && narrative3.tagName === "P" ? (narrative3.textContent || "").trim() : "";
    const isBest2026 = path.indexOf("/blog/best-screenshot-apps-2026") === 0;
    const narrative1Ok = narrative1Text.indexOf("hopelessly outdated") !== -1 && narrative1Text.indexOf("AI agents") !== -1;
    const narrative2Ok = narrative2Text.indexOf("colleagues") !== -1 && narrative2Text.indexOf("passwords") !== -1;
    const narrative3Ok = narrative3Text.indexOf("products on the market") !== -1;
    console.log(
      "SeenShot blog: narrative h2=" + (firstH2 ? firstH2.textContent : "") +
        " p1chars=" + String(narrative1Text.length) +
        " p2chars=" + String(narrative2Text.length) +
        " p3chars=" + String(narrative3Text.length) +
        " p1=" + narrative1Text +
        " p2=" + narrative2Text +
        " p3=" + narrative3Text +
        " p1Ok=" + String(narrative1Ok) +
        " p2Ok=" + String(narrative2Ok) +
        " p3Ok=" + String(narrative3Ok)
    );
    if (isBest2026 && (!narrative1Ok || !narrative2Ok || !narrative3Ok)) {
      console.error(
        "SeenShot blog: 2026 article AI-agent narrative missing p1Ok=" + String(narrative1Ok) +
          " p2Ok=" + String(narrative2Ok) +
          " p3Ok=" + String(narrative3Ok)
      );
    }
    // ─── Ariadne's Thread [AT-0575] ─────────────────────
    // What: Log that the basic-vs-professional features heading is gone
    // Why:  Leftover copy would mean the dropped section returned
    // Date: 2026-09-05
    // Related: [AT-0575] content/blog-best-screenshot-apps-2026.ts, [AT-0574] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const droppedFeaturesHeading = article ? Array.prototype.some.call(headings, function (heading) {
      return (heading.textContent || "").indexOf("The features that separate basic tools from professional tools") !== -1;
    }) : false;
    let seenshotPickH2 = null;
    if (article) {
      const allH2 = article.querySelectorAll("h2");
      allH2.forEach(function (heading) {
        if ((heading.textContent || "").trim() === "SeenShot is a strong lightweight pick for Mac users") {
          seenshotPickH2 = heading;
        }
      });
    }
    console.log(
      "SeenShot blog: droppedFeaturesHeading=" + String(droppedFeaturesHeading) +
        " seenshotPick=" + (seenshotPickH2 ? (seenshotPickH2.textContent || "") : "")
    );
    if (isBest2026 && droppedFeaturesHeading) {
      console.error("SeenShot blog: 2026 article still has basic-vs-professional features section");
    }
    if (isBest2026 && !seenshotPickH2) {
      console.error("SeenShot blog: 2026 article missing SeenShot pick heading after shortlist");
    }
    // ─── Ariadne's Thread [AT-0576] ─────────────────────
    // What: Log that the speed-angle SeenShot paragraph is gone
    // Why:  Leftover copy would mean the dropped paragraph returned
    // Date: 2026-09-05
    // Related: [AT-0576] content/blog-best-screenshot-apps-2026.ts, [AT-0575] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const articleText = article ? (article.textContent || "") : "";
    const speedAnglePresent = articleText.indexOf("The speed angle matters") !== -1;
    console.log(
      "SeenShot blog: speedAnglePresent=" + String(speedAnglePresent) +
        " articleChars=" + String(articleText.length)
    );
    if (isBest2026 && speedAnglePresent) {
      console.error("SeenShot blog: 2026 article still has speed-angle paragraph");
    }
    // ─── Ariadne's Thread [AT-0577] ─────────────────────
    // What: Log that the local-and-online SeenShot paragraph is gone
    // Why:  Leftover copy would mean the dropped paragraph returned
    // Date: 2026-09-05
    // Related: [AT-0577] content/blog-best-screenshot-apps-2026.ts, [AT-0576] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const localOnlinePresent = articleText.indexOf("SeenShot is also practical because it supports both local and online workflows") !== -1;
    console.log("SeenShot blog: localOnlinePresent=" + String(localOnlinePresent));
    if (isBest2026 && localOnlinePresent) {
      console.error("SeenShot blog: 2026 article still has local-and-online paragraph");
    }
    // ─── Ariadne's Thread [AT-0578] ─────────────────────
    // What: Log Auto Blur Sensitive data and one-click share to AI agents in the SeenShot list
    // Why:  Those two agent-sharing lines must stay in the SeenShot feature list
    // Date: 2026-09-05
    // Related: [AT-0578] content/blog-best-screenshot-apps-2026.ts, [AT-0565] content/landing-faq.ts
    // ─────────────────────────────────────────────────────
    const seenshotFeatureIntro = article
      ? Array.prototype.find.call(article.querySelectorAll("p"), function (p) {
          return (p.textContent || "").indexOf("key features include") !== -1;
        })
      : null;
    const seenshotList =
      seenshotFeatureIntro &&
      seenshotFeatureIntro.nextElementSibling &&
      seenshotFeatureIntro.nextElementSibling.tagName === "UL"
        ? seenshotFeatureIntro.nextElementSibling
        : null;
    const seenshotItems = seenshotList ? seenshotList.querySelectorAll("li") : [];
    const seenshotItemTexts = [];
    seenshotItems.forEach(function (item) {
      seenshotItemTexts.push((item.textContent || "").trim());
    });
    const autoBlurItem = seenshotItemTexts.filter(function (text) {
      return text.indexOf("Auto Blur Sensitive data") !== -1 && text.indexOf("AI agents") !== -1;
    })[0] || "";
    const agentShareItem = seenshotItemTexts.filter(function (text) {
      return text.indexOf("One-click share to AI agents") !== -1 && text.indexOf("10+") !== -1;
    })[0] || "";
    console.log(
      "SeenShot blog: seenshotFeatures=" + seenshotItems.length +
        " autoBlur=" + autoBlurItem +
        " agentShare=" + agentShareItem
    );
    seenshotItemTexts.forEach(function (text, index) {
      console.log("SeenShot blog: seenshotFeature[" + index + "]=" + text);
    });
    if (isBest2026 && (!autoBlurItem || !agentShareItem)) {
      console.error(
        "SeenShot blog: 2026 SeenShot list missing agent features autoBlur=" + Boolean(autoBlurItem) +
          " agentShare=" + Boolean(agentShareItem)
      );
    }
    // ─── Ariadne's Thread [AT-0579] ─────────────────────
    // What: Log that the Snipping Tool starting-point paragraph is gone
    // Why:  Leftover copy would mean the dropped Windows writeup returned
    // Date: 2026-09-05
    // Related: [AT-0579] content/blog-best-screenshot-apps-2026.ts, [AT-0578] lib/client/blog.ts:startBlog
    // ─────────────────────────────────────────────────────
    const snippingStartPresent = articleText.indexOf("Snipping Tool is the simplest starting point") !== -1;
    const microsoftSupportLink = article ? article.querySelector('a[href*="support.microsoft.com"]') : null;
    console.log(
      "SeenShot blog: snippingStartPresent=" + String(snippingStartPresent) +
        " microsoftSupportLink=" + (microsoftSupportLink ? microsoftSupportLink.getAttribute("href") : "")
    );
    if (isBest2026 && snippingStartPresent) {
      console.error("SeenShot blog: 2026 article still has Snipping Tool starting-point paragraph");
    }
    // ─── Ariadne's Thread [AT-0356] ─────────────────────
    // What: Log each figure.tool-shot src, caption, and load size
    // Why:  Homepage captures must be present next to the matching tool writeup
    // Date: 2026-08-28
    // Related: [AT-0356] public/css/site.css:.legal figure.tool-shot, [AT-0349] public/blog/best-screenshot-apps-2026/index.html
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0359] ─────────────────────
    // What: Stop logging figure.tool-shot figcaption
    // Why:  Blog tool screenshots have no visible homepage captions
    // Date: 2026-08-28
    // Related: [AT-0356] public/js/blog.js, [AT-0359] public/blog/best-screenshot-apps-2026/index.html
    // ─────────────────────────────────────────────────────
    shots.forEach(function (img, i) {
      console.log(
        "SeenShot blog: toolShot[" + i + "] src=" + (img.getAttribute("src") || "") +
          " alt=" + (img.getAttribute("alt") || "") +
          " loading=" + (img.getAttribute("loading") || "") +
          " decoding=" + (img.getAttribute("decoding") || "") +
          " captions=" + String(document.querySelectorAll("figure.tool-shot figcaption").length) +
          " complete=" + String(img.complete) +
          " natural=" + img.naturalWidth + "x" + img.naturalHeight
      );
      img.addEventListener("load", function () {
        console.log(
          "SeenShot blog: toolShot loaded src=" + (img.getAttribute("src") || "") +
            " natural=" + img.naturalWidth + "x" + img.naturalHeight
        );
      });
      img.addEventListener("error", function () {
        console.error("SeenShot blog: toolShot failed src=" + (img.getAttribute("src") || ""));
      });
    });
    logBlogJsonLd();

}
