// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0296] ─────────────────────
   What: Bind Dark | Light buttons to html[data-theme] and localStorage
   Why:  Share viewer theme must persist without a second theme stack
   Date: 2026-08-27
   Related: [AT-0295] src/html.ts:shareBarHtml, [AT-0063] src/html.ts:shareBarCss
─────────────────────────────────────────────────────── */

let started = false;
export function startShareTheme() {
  if (started) {
    console.warn("SeenShot share-theme: start ignored, already started");
    return;
  }
  started = true;

    const STORAGE_KEY = "seenshot-share-theme";
    let bound = false;

    function currentTheme() {
      const value = document.documentElement.getAttribute("data-theme");
      if (value === "light") {
        return "light";
      }
      return "dark";
    }

    function applyTheme(theme) {
      const next = theme === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
        console.log("SeenShot share-theme: stored theme=" + next + " key=" + STORAGE_KEY);
      } catch (error) {
        console.warn("SeenShot share-theme: storage write failed theme=" + next, error);
      }
      const buttons = document.querySelectorAll(".share-theme button[data-theme]");
      for (let i = 0; i < buttons.length; i += 1) {
        const pressed = buttons[i].getAttribute("data-theme") === next;
        buttons[i].setAttribute("aria-pressed", pressed ? "true" : "false");
        console.log(
          "SeenShot share-theme: button theme=" + buttons[i].getAttribute("data-theme") +
            " pressed=" + pressed,
        );
      }
      const bg = getComputedStyle(document.documentElement).backgroundColor;
      const scheme = getComputedStyle(document.documentElement).colorScheme;
      console.log(
        "SeenShot share-theme: apply theme=" + next +
          " buttons=" + buttons.length +
          " bg=" + bg +
          " color-scheme=" + scheme,
      );
    }

    // ─── Ariadne's Thread [AT-0309] ─────────────────────
    // What: Replace moon/sun data-lucide nodes via official lucide.createIcons
    // Why:  Share theme toggle is Lucide icons, not Dark|Light text; do not recreate icons on click
    // Date: 2026-08-28
    // Related: [AT-0308] src/html.ts:shareBarHtml, [AT-0310] src/html.ts:shareLucideScript, https://lucide.dev/guide/lucide/getting-started
    // ─────────────────────────────────────────────────────
    function paintLucideIcons(root) {
      const lucide = window.lucide;
      if (!lucide) {
        console.error("SeenShot share-theme: lucide missing");
        return;
      }
      if (typeof lucide.createIcons !== "function") {
        console.error("SeenShot share-theme: lucide.createIcons missing");
        return;
      }
      const hasMoon = Boolean(lucide.Moon);
      const hasSun = Boolean(lucide.Sun);
      const hasLink = Boolean(lucide.Link);
      const hasCheck = Boolean(lucide.Check);
      const hasIconsMap = Boolean(lucide.icons);
      console.log(
        "SeenShot share-theme: lucide paint hasMoon=" + hasMoon +
          " hasSun=" + hasSun +
          " hasLink=" + hasLink +
          " hasCheck=" + hasCheck +
          " hasIconsMap=" + hasIconsMap +
          " data-lucide=" + document.querySelectorAll("[data-lucide]").length,
      );
      const icons = {};
      if (hasMoon) {
        icons.Moon = lucide.Moon;
      }
      if (hasSun) {
        icons.Sun = lucide.Sun;
      }
      if (hasLink) {
        icons.Link = lucide.Link;
      }
      // ─── Ariadne's Thread [AT-0319] ─────────────────────
      // What: Pass lucide.Check into createIcons with Moon/Sun/Link
      // Why:  Copy-link success state needs the official Check glyph already in the 1.35.0 UMD pack
      // Date: 2026-08-28
      // Related: [AT-0317] src/html.ts:shareSocialCss, [AT-0309] public/js/share-theme.js:paintLucideIcons, https://lucide.dev/icons/check
      // ─────────────────────────────────────────────────────
      if (hasCheck) {
        icons.Check = lucide.Check;
      }
      const pack = Object.keys(icons).length ? icons : lucide.icons;
      if (!pack || !Object.keys(pack).length) {
        console.error("SeenShot share-theme: lucide icons empty");
        return;
      }
      try {
        lucide.createIcons({
          icons: pack,
        });
        console.log("SeenShot share-theme: lucide createIcons iconCount=" + Object.keys(pack).length);
      } catch (error) {
        console.error("SeenShot share-theme: lucide createIcons failed", error);
        return;
      }
      const svgs = document.querySelectorAll(".share-theme svg, .share-social-copy svg");
      const leftoverI = document.querySelectorAll("i[data-lucide]");
      console.log(
        "SeenShot share-theme: lucide svgs=" + svgs.length +
          " leftover-i=" + leftoverI.length,
      );
    }

    function bind() {
      if (bound) {
        console.warn("SeenShot share-theme: bind ignored, already bound");
        return;
      }
      const root = document.querySelector(".share-theme");
      if (!root) {
        console.error("SeenShot share-theme: missing .share-theme");
        return;
      }
      bound = true;
      const initial = currentTheme();
      console.log("SeenShot share-theme: bind initial=" + initial);
      paintLucideIcons(root);
      applyTheme(initial);
      root.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-theme]");
        if (!button || !root.contains(button)) {
          return;
        }
        const theme = button.getAttribute("data-theme");
        const current = currentTheme();
        console.log("SeenShot share-theme: click theme=" + theme + " current=" + current);
        if (theme !== "light" && theme !== "dark") {
          console.warn("SeenShot share-theme: unknown theme=" + theme);
          return;
        }
        if (theme === current) {
          console.log("SeenShot share-theme: already theme=" + theme);
          return;
        }
        applyTheme(theme);
      });
    }

    bind();

}
