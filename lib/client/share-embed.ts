// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0076] ─────────────────────
   What: Copy html | react | css | link snippets for the public PNG
   Why:  Share page under Report must paste the image into other sites
   Date: 2026-08-27
   Related: [AT-0075] src/html.ts:shareFootHtml, [AT-0012] public/js/shot.js
─────────────────────────────────────────────────────── */

  let copyInFlight = false;
  let restoreTimer = 0;
  let bound = false;

  function snippet(kind, imageUrl) {
    // ─── Ariadne's Thread [AT-0459] ─────────────────────
    // What: Put loading=lazy decoding=async on HTML and React embed <img> snippets
    // Why:  Copied embeds must lazy-load the screenshot like the rest of site media
    // Date: 2026-09-03
    // Related: [AT-0459] components/share/ShareView.tsx, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading
    // ─────────────────────────────────────────────────────
    if (kind === "html") {
      return "<img src=" + JSON.stringify(imageUrl) + ' alt="Screenshot" loading="lazy" decoding="async">';
    }
    if (kind === "react") {
      return "<img src=" + JSON.stringify(imageUrl) + ' alt="Screenshot" loading="lazy" decoding="async" />';
    }
    if (kind === "css") {
      return "background-image: url(" + JSON.stringify(imageUrl) + ");";
    }
    if (kind === "link") {
      return imageUrl;
    }
    return "";
  }

  function restoreButtons(root) {
    const buttons = root.querySelectorAll("button[data-embed]");
    for (let i = 0; i < buttons.length; i += 1) {
      buttons[i].textContent = buttons[i].getAttribute("data-embed");
    }
  }

  function bind(imageUrl) {
    if (bound) {
      console.warn("SeenShot share-embed: bind ignored, already bound imageUrl=" + imageUrl);
      return;
    }
    const root = document.querySelector(".share-embed");
    if (!root) {
      console.error("SeenShot share-embed: missing .share-embed imageUrl=" + imageUrl);
      return;
    }
    if (!imageUrl) {
      console.error("SeenShot share-embed: empty imageUrl");
      return;
    }
    bound = true;
    const logo = document.querySelector("#share-foot .share-logo");
    const download = document.querySelector("#share-foot .share-download");
    const name = root.querySelector(".share-embed-name");
    const prefix = root.querySelector(".share-embed-prefix");
    const buttons = root.querySelectorAll("button[data-embed]");
    // ─── Ariadne's Thread [AT-0293] ─────────────────────
    // What: Log share & insert name, insert as prefix, and embed kinds
    // Why:  Share footer copy row must leave an English trail for the new labels
    // Date: 2026-08-27
    // Related: [AT-0292] src/html.ts:shareFootHtml, [AT-0076] public/js/share-embed.js:bind
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0307] ─────────────────────
    // What: Log and click-trace #share-foot .share-download
    // Why:  Footer Download must save the public PNG, not the Mac app
    // Date: 2026-08-28
    // Related: [AT-0306] src/html.ts:shareFootHtml, [AT-0076] public/js/share-embed.js:bind
    // ─────────────────────────────────────────────────────
    console.log(
      "SeenShot share-embed: bind imageUrl=" + imageUrl +
        " logo=" + Boolean(logo) +
        " downloadHref=" + (download ? download.getAttribute("href") || "" : "") +
        " downloadName=" + (download ? download.getAttribute("download") || "" : "") +
        " name=" + (name ? name.textContent || "" : "") +
        " prefix=" + (prefix ? prefix.textContent || "" : "") +
        " kinds=" + buttons.length,
    );
    if (download) {
      download.addEventListener("click", function () {
        console.log(
          "SeenShot share-embed: download click href=" + download.href +
            " name=" + (download.getAttribute("download") || "") +
            " imageUrl=" + imageUrl,
        );
      });
    }
    root.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-embed]");
      if (!button || !root.contains(button)) {
        return;
      }
      const kind = button.getAttribute("data-embed");
      const text = snippet(kind, imageUrl);
      console.log(
        "SeenShot share-embed: click kind=" + kind + " inFlight=" + copyInFlight + " bytes=" + text.length,
      );
      if (!text) {
        console.warn("SeenShot share-embed: unknown kind=" + kind);
        return;
      }
      if (copyInFlight) {
        console.warn("SeenShot share-embed: copy ignored, in flight kind=" + kind);
        return;
      }
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        console.error("SeenShot share-embed: clipboard API missing kind=" + kind);
        restoreButtons(root);
        button.textContent = "Copy failed";
        return;
      }
      copyInFlight = true;
      navigator.clipboard.writeText(text).then(function () {
        copyInFlight = false;
        restoreButtons(root);
        button.textContent = "Copied";
        console.log("SeenShot share-embed: copied kind=" + kind + " bytes=" + text.length);
        if (restoreTimer) {
          clearTimeout(restoreTimer);
        }
        restoreTimer = setTimeout(function () {
          restoreButtons(root);
          restoreTimer = 0;
          console.log("SeenShot share-embed: restored labels after kind=" + kind);
        }, 1500);
      }).catch(function (error) {
        copyInFlight = false;
        restoreButtons(root);
        button.textContent = "Copy failed";
        console.error("SeenShot share-embed: copy failed kind=" + kind, error);
        if (restoreTimer) {
          clearTimeout(restoreTimer);
        }
        restoreTimer = setTimeout(function () {
          restoreButtons(root);
          restoreTimer = 0;
        }, 1500);
      });
    });
  }

  window.SeenShotShareEmbed = { bind: bind };

export function bindShareEmbed(imageUrl: string) {
  return bind(imageUrl);
}
