// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0312] ─────────────────────
   What: Bind social intents and copy-link tooltip on .share-social
   Why:  Share stage copies the page URL with Copied + URL tooltip; networks use official intent links
   Date: 2026-08-28
   Related: [AT-0311] src/html.ts:shareSocialHtml, [AT-0076] public/js/share-embed.js
─────────────────────────────────────────────────────── */

  let bound = false;
  let copyInFlight = false;
  let hideTimer = 0;

  function bind() {
    if (bound) {
      console.warn("SeenShot share-social: bind ignored, already bound");
      return;
    }
    const root = document.querySelector(".share-social");
    if (!root) {
      console.error("SeenShot share-social: missing .share-social");
      return;
    }
    const copyButton = root.querySelector(".share-social-copy");
    const tip = root.querySelector(".share-social-tip");
    const tipUrl = root.querySelector(".share-social-tip-url");
    const networks = root.querySelectorAll("a[data-share]");
    if (!copyButton || !tip || !tipUrl) {
      console.error(
        "SeenShot share-social: missing copy ui copyButton=" + Boolean(copyButton) +
          " tip=" + Boolean(tip) +
          " tipUrl=" + Boolean(tipUrl),
      );
      return;
    }
    const pageUrl = copyButton.getAttribute("data-page-url") || "";
    bound = true;
    console.log(
      "SeenShot share-social: bind pageUrl=" + pageUrl +
        " networks=" + networks.length +
        " copyButton=" + Boolean(copyButton) +
        " hasCheck=" + Boolean(copyButton.querySelector(".share-social-copy-check")),
    );
    // ─── Ariadne's Thread [AT-0318] ─────────────────────
    // What: Toggle .is-copied so the copy button shows Lucide check after clipboard success
    // Why:  The link glyph must become a check only when writeText resolves
    // Date: 2026-08-28
    // Related: [AT-0317] src/html.ts:shareSocialCss, [AT-0312] public/js/share-social.js:bind
    // ─────────────────────────────────────────────────────
    function setCopied(copied) {
      copyButton.classList.toggle("is-copied", copied);
      copyButton.setAttribute("aria-label", copied ? "Copied" : "Copy link");
      console.log(
        "SeenShot share-social: copy icon copied=" + copied +
          " class=" + copyButton.className +
          " aria-label=" + copyButton.getAttribute("aria-label"),
      );
    }
    function scheduleHide(url) {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(function () {
        tip.hidden = true;
        hideTimer = 0;
        setCopied(false);
        console.log("SeenShot share-social: hid copy tooltip url=" + url);
      }, 2000);
    }
    root.addEventListener("click", function (event) {
      const link = event.target.closest("a[data-share]");
      if (link && root.contains(link)) {
        console.log(
          "SeenShot share-social: click network=" + link.getAttribute("data-share") +
            " href=" + link.href,
        );
      }
    });
    copyButton.addEventListener("click", function () {
      const url = copyButton.getAttribute("data-page-url") || "";
      console.log(
        "SeenShot share-social: copy click url=" + url +
          " inFlight=" + copyInFlight +
          " clipboard=" + Boolean(navigator.clipboard && navigator.clipboard.writeText),
      );
      if (!url) {
        console.error("SeenShot share-social: empty page url");
        return;
      }
      if (copyInFlight) {
        console.warn("SeenShot share-social: copy ignored, in flight url=" + url);
        return;
      }
      tipUrl.textContent = url;
      tip.hidden = false;
      scheduleHide(url);
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        console.error("SeenShot share-social: clipboard API missing url=" + url);
        return;
      }
      copyInFlight = true;
      navigator.clipboard.writeText(url).then(function () {
        copyInFlight = false;
        setCopied(true);
        tip.hidden = false;
        scheduleHide(url);
        console.log("SeenShot share-social: copied url=" + url + " bytes=" + url.length);
      }).catch(function (error) {
        copyInFlight = false;
        setCopied(false);
        console.error("SeenShot share-social: copy failed url=" + url, error);
      });
    });
  }

  window.SeenShotShareSocial = { bind: bind };

export function bindShareSocial() {
  return bind();
}
