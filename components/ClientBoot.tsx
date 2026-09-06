"use client";

import { useEffect } from "react";

// ─── Ariadne's Thread [AT-0430] ─────────────────────
// What: One root client boot for PostHog, product JS, share, and cabinet gate
// Why:  vinext SSR returns HTTP 500 when 'use client' sits in page trees; root PostHogInit already SSR'd
// Date: 2026-09-03
// Related: [AT-0423] components/SiteScripts.tsx, [AT-0425] components/share/ShareScripts.tsx
// ─────────────────────────────────────────────────────

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function loadCodeMarketWidget() {
  if (document.querySelector("script[data-seenshot-codemarket]")) {
    console.log("SeenShot site: Code Market widget already in document");
    return;
  }
  const script = document.createElement("script");
  script.src = "https://code.market/widget.min.js";
  script.async = true;
  script.dataset.seenshotCodemarket = "1";
  script.onload = () => {
    console.log("SeenShot site: Code Market widget loaded");
  };
  script.onerror = () => {
    console.error("SeenShot site: Code Market widget failed url=https://code.market/widget.min.js");
  };
  document.body.appendChild(script);
}

async function bootShare(el: HTMLElement) {
  const imageUrl = el.getAttribute("data-image-url") || "";
  const pageUrl = el.getAttribute("data-page-url") || "";
  const publicId = el.getAttribute("data-public-id") || "";
  const uploading = el.getAttribute("data-uploading") === "1";
  console.log(
    "SeenShot share: scripts publicId=" + publicId +
      " imageUrl=" + imageUrl +
      " pageUrl=" + pageUrl +
      " uploading=" + uploading,
  );
  const { startReleases } = await import("@/lib/client/releases");
  const { bindShareEmbed } = await import("@/lib/client/share-embed");
  const { bindShareSocial } = await import("@/lib/client/share-social");
  const { startShareTheme } = await import("@/lib/client/share-theme");
  const { startScreenshotUpload } = await import("@/lib/client/screenshot-upload");
  const lucide = document.createElement("script");
  lucide.src = "https://unpkg.com/lucide@1.35.0/dist/umd/lucide.min.js";
  lucide.onload = () => {
    console.log("SeenShot share: lucide CDN loaded url=" + lucide.src);
    startShareTheme();
    bindShareSocial();
  };
  lucide.onerror = () => {
    console.error("SeenShot share: lucide CDN failed url=https://unpkg.com/lucide@1.35.0/dist/umd/lucide.min.js");
    startShareTheme();
    bindShareSocial();
  };
  document.body.appendChild(lucide);
  bindShareEmbed(imageUrl);
  startReleases();
  const slot = document.querySelector(".share-shot");
  if (slot) {
    const box = slot.getBoundingClientRect();
    console.log(
      "SeenShot share: share-shot w=" + Math.round(box.width) +
        " h=" + Math.round(box.height),
    );
  } else {
    console.error("SeenShot share: missing share-shot");
  }
  if (uploading) {
    startScreenshotUpload(publicId, imageUrl, pageUrl, "/upload-progress/" + encodeURIComponent(publicId));
  } else if (new URLSearchParams(location.search).get("uploading") === "1") {
    history.replaceState({}, "", pageUrl);
    console.log("SeenShot share: stripped uploading query publicId=" + publicId);
  }
}

async function bootCabinetGate() {
  const { SeenShotAuth } = await import("@/lib/client/auth");
  const session = SeenShotAuth.readSession();
  console.log(
    "SeenShot cabinet: gate hasRefresh=" + Boolean(session.refreshToken) +
      " uid=" + (session.uid || ""),
  );
  if (session.refreshToken) {
    try {
      await SeenShotAuth.ensureIdToken();
      console.log("SeenShot cabinet: signed in, go /space/");
      location.replace("/space/");
      return;
    } catch (error) {
      console.warn("SeenShot cabinet: session failed", error);
    }
  }
  console.log("SeenShot cabinet: signed out, go /signin");
  location.replace("/signin");
}

export function ClientBoot() {
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const { startPosthog } = await import("@/lib/client/posthog");
      const { startSupport } = await import("@/lib/client/support");
      if (cancelled) {
        return;
      }
      startPosthog();
      startSupport();
      const path = normalizePath(location.pathname) || "/";
      console.log("SeenShot site: ClientBoot path=" + path);
      if (path.startsWith("/screenshot/")) {
        const shareBoot = document.getElementById("share-boot");
        if (shareBoot) {
          await bootShare(shareBoot);
        } else {
          console.log("SeenShot share: ClientBoot skip scripts, no #share-boot");
        }
        return;
      }
      if (path === "/cabinet") {
        await bootCabinetGate();
        return;
      }
      loadCodeMarketWidget();
      if (path === "/oauth/authorize") {
        const { startOauthAuthorize } = await import("@/lib/client/oauth-authorize");
        const { startLegal } = await import("@/lib/client/legal");
        startOauthAuthorize();
        startLegal();
        return;
      }
      const { startNav } = await import("@/lib/client/nav");
      startNav();
      const shotMatch = path.match(/^\/shot\/([^/]+)$/);
      if (shotMatch) {
        const { startShot } = await import("@/lib/client/shot");
        startShot(shotMatch[1]);
        return;
      }
      const { startLegal } = await import("@/lib/client/legal");
      if (path === "/") {
        // ─── Ariadne's Thread [AT-0618] ─────────────────────
        // What: Bind landing Member and Lifetime Buy to Polar checkout
        // Why:  Homepage paid cards now use #pricing-pay-member and #pricing-pay-lifetime
        // Date: 2026-09-05
        // Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0554] components/ClientBoot.tsx
        // ─────────────────────────────────────────────────────
        const { startReleases } = await import("@/lib/client/releases");
        const { startPricing } = await import("@/lib/client/pricing");
        startReleases();
        startPricing();
        startLegal();
        return;
      }
      if (path === "/signin" || path === "/signup") {
        const { startSignin } = await import("@/lib/client/signin");
        startSignin();
        startLegal();
        return;
      }
      if (path === "/pricing") {
        // ─── Ariadne's Thread [AT-0554] ─────────────────────
        // What: Boot /pricing with releases download hrefs and Polar Pay handlers
        // Why:  Pricing still needs startReleases for #nav-download arch and startPricing for checkout
        // Date: 2026-09-05
        // Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0430] components/ClientBoot.tsx
        // ─────────────────────────────────────────────────────
        const { startReleases } = await import("@/lib/client/releases");
        const { startPricing } = await import("@/lib/client/pricing");
        startReleases();
        startPricing();
        startLegal();
        return;
      }
      if (path === "/space") {
        const { startCabinet } = await import("@/lib/client/cabinet");
        const { startReleases } = await import("@/lib/client/releases");
        startCabinet();
        startReleases();
        startLegal();
        return;
      }
      if (path === "/space/redem") {
        const { startRedem } = await import("@/lib/client/redem");
        startRedem();
        startLegal();
        return;
      }
      if (path === "/releases") {
        const { startReleases } = await import("@/lib/client/releases");
        startReleases();
        startLegal();
        return;
      }
      if (path === "/blog" || path.startsWith("/blog/")) {
        const { startBlog } = await import("@/lib/client/blog");
        startLegal();
        startBlog();
        return;
      }
      // ─── Ariadne's Thread [AT-0618] ─────────────────────
      // What: Bind Polar Buy on SSR landing slugs that render PricingCards
      // Why:  Unique landings reuse Member and Lifetime checkout without a second billing client
      // Date: 2026-09-05
      // Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0589] components/LandingPageMain.tsx
      // ─────────────────────────────────────────────────────
      if (document.getElementById("pricing-pay-member") || document.getElementById("pricing-pay-lifetime")) {
        const { startPricing } = await import("@/lib/client/pricing");
        startPricing();
      }
      startLegal();
    }
    boot().catch((error) => {
      console.error("SeenShot site: ClientBoot failed", error);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
