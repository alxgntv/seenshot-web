// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
/* ─── Ariadne's Thread [AT-0011] ─────────────────────
   What: Pinterest masonry of the signed-in user's D1+R2 shots
   Why:  Cabinet is the cloud folder from the Mac app
   Date: 2026-08-26
   Related: [AT-0007] src/index.ts:listShots, [AT-0008] auth.js
─────────────────────────────────────────────────────── */

let started = false;
export function startCabinet() {
  if (started) {
    console.warn("SeenShot startCabinet: start ignored, already started");
    return;
  }
  started = true;

    const feed = document.getElementById("feed");
    const emptyWrap = document.getElementById("empty-wrap");
    const latestDownload = document.getElementById("latest-download");
    let loadInFlight = false;
    let sessionReady = false;

    // ─── Ariadne's Thread [AT-0415] ─────────────────────
    // What: Toggle #empty-wrap; #latest-download is the first child of #empty
    // Why:  Download Free for macOS must sit inside the empty card, not above it
    // Date: 2026-09-03
    // Related: [AT-0415] public/space/index.html:#empty, [AT-0414] public/js/cabinet.js:setEmptyVisible
    // ─────────────────────────────────────────────────────
    function setEmptyVisible(visible) {
      emptyWrap.hidden = !visible;
      const empty = document.getElementById("empty");
      const wrap = latestDownload ? latestDownload.closest(".download-wrap") : null;
      console.log(
        "SeenShot cabinet: emptyVisible=" + visible +
          " emptyWrapHidden=" + emptyWrap.hidden +
          " downloadInEmpty=" + Boolean(empty && empty.contains(latestDownload)) +
          " emptyFirst=" + (empty && empty.firstElementChild ? empty.firstElementChild.className : "") +
          " downloadWrapDisplay=" + (wrap ? getComputedStyle(wrap).display : "none") +
          " downloadDisplay=" + (latestDownload ? getComputedStyle(latestDownload).display : "none") +
          " downloadColor=" + (latestDownload ? getComputedStyle(latestDownload).color : "none")
      );
      logActions();
    }

    // ─── Ariadne's Thread [AT-0287] ─────────────────────
    // What: Log .cabinet-actions width and which pills are hidden
    // Why:  Upgrade to Pro and Download must stay in one group after empty/quota paint
    // Date: 2026-08-27
    // Related: [AT-0285] public/space/index.html, [AT-0286] public/css/site.css:.cabinet-actions
    // ─────────────────────────────────────────────────────
    function logActions() {
      const group = document.querySelector(".cabinet-actions");
      if (!group) {
        console.warn("SeenShot cabinet: actions group missing");
      } else {
        const pills = group.querySelectorAll(".download");
        const parts = [];
        for (let i = 0; i < pills.length; i += 1) {
          const el = pills[i];
          parts.push(el.id + " hidden=" + el.hidden);
        }
        const box = group.getBoundingClientRect();
        console.log(
          "SeenShot cabinet: actions width=" + Math.round(box.width) +
            " left=" + Math.round(box.left) +
            " children=" + pills.length +
            " " + parts.join(" ")
        );
      }
      const empty = document.getElementById("empty");
      if (!emptyWrap || !latestDownload || !empty) {
        console.warn(
          "SeenShot cabinet: empty download missing emptyWrap=" + Boolean(emptyWrap) +
            " latestDownload=" + Boolean(latestDownload) +
            " empty=" + Boolean(empty)
        );
        return;
      }
      const first = empty.firstElementChild;
      const emptyBox = empty.getBoundingClientRect();
      const downloadBox = latestDownload.getBoundingClientRect();
      console.log(
        "SeenShot cabinet: empty hidden=" + emptyWrap.hidden +
          " emptyTag=" + empty.tagName +
          " first=" + (first ? first.className : "") +
          " downloadFirst=" + (first === latestDownload.parentElement) +
          " downloadInsideCard=" + (latestDownload.parentElement && empty.contains(latestDownload) && emptyBox.top <= downloadBox.top && downloadBox.bottom <= emptyBox.bottom + 1) +
          " cardTop=" + Math.round(emptyBox.top) +
          " cardLeft=" + Math.round(emptyBox.left) +
          " cardWidth=" + Math.round(emptyBox.width) +
          " downloadTop=" + Math.round(downloadBox.top) +
          " downloadLeft=" + Math.round(downloadBox.left) +
          " downloadWidth=" + Math.round(downloadBox.width) +
          " downloadColor=" + getComputedStyle(latestDownload).color
      );
    }

    // ─── Ariadne's Thread [AT-0069] ─────────────────────
    // What: Public pins use /public/{id}.png; first 8 pins loading=eager; CSS skeleton
    // Why:  Auth image + lazy on in-viewport pins + max-age=60 made the first row wait
    // Date: 2026-08-27
    // Related: [AT-0068] public/css/site.css:.pin, [AT-0050] src/index.ts:publicPng, [AT-0070] src/index.ts:shotImage
    // ─────────────────────────────────────────────────────
    function imageSrc(shot) {
      if (shot.visibility === "public" && shot.public_id) {
        const src = "/public/" + encodeURIComponent(shot.public_id) + ".png";
        console.log("SeenShot cabinet: imageSrc public shot=" + shot.shot_id + " src=" + src);
        return src;
      }
      const src = "/api/shots/" + encodeURIComponent(shot.shot_id) + "/image";
      console.log("SeenShot cabinet: imageSrc private shot=" + shot.shot_id + " src=" + src);
      return src;
    }

    // ─── Ariadne's Thread [AT-0083] ─────────────────────
    // What: Show shot.bytes under each cabinet pin as KB or MB
    // Why:  Feed imgs had no size; D1/R2 already return bytes on GET /api/shots
    // Date: 2026-08-27
    // Related: [AT-0007] src/index.ts:listShots, [AT-0069] public/js/cabinet.js:render
    // ─────────────────────────────────────────────────────
    function formatShotBytes(bytes) {
      const n = Number(bytes);
      if (!Number.isFinite(n) || n < 0) {
        console.warn("SeenShot cabinet: formatShotBytes invalid bytes=" + bytes);
        return "";
      }
      const kb = 1024;
      const mb = 1024 * 1024;
      let text = "";
      if (n >= mb) {
        text = new Intl.NumberFormat("en", { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(n / mb) + " MB";
      } else if (n >= kb) {
        text = new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n / kb) + " KB";
      } else {
        text = new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n) + " B";
      }
      console.log("SeenShot cabinet: formatShotBytes bytes=" + n + " text=" + text);
      return text;
    }

    function markPinLoaded(pin, img, shot, index) {
      pin.classList.add("is-loaded");
      console.log(
        "SeenShot cabinet: pin loaded[" + index + "] shot=" + shot.shot_id +
          " natural=" + img.naturalWidth + "x" + img.naturalHeight +
          " visibility=" + shot.visibility +
          " source=" + shot.source +
          " page=" + shot.pagePath +
          " src=" + img.currentSrc
      );
    }

    function render(shots) {
      feed.innerHTML = "";
      if (shots.length === 0) {
        setEmptyVisible(true);
        console.log("SeenShot cabinet: empty feed, show capture hint");
        return;
      }
      setEmptyVisible(false);
      console.log("SeenShot cabinet: render count=" + shots.length + " eagerFirst=8 skeleton=true");
      for (let i = 0; i < shots.length; i += 1) {
        const shot = shots[i];
        const pin = document.createElement("article");
        pin.className = "pin";
        const link = document.createElement("a");
        link.href = shot.pagePath;
        const img = document.createElement("img");
        img.alt = "Screenshot";
        img.loading = i < 8 ? "eager" : "lazy";
        img.decoding = "async";
        img.src = imageSrc(shot);
        img.addEventListener("load", function () {
          markPinLoaded(pin, img, shot, i);
        });
        img.addEventListener("error", function () {
          console.error(
            "SeenShot cabinet: pin image failed shot=" + shot.shot_id +
              " index=" + i + " src=" + img.src + " bytes=" + shot.bytes
          );
          pin.remove();
        });
        link.appendChild(img);
        pin.appendChild(link);
        const sizeText = formatShotBytes(shot.bytes);
        if (sizeText) {
          const size = document.createElement("p");
          size.className = "pin-bytes";
          size.textContent = sizeText;
          pin.appendChild(size);
        } else {
          console.warn("SeenShot cabinet: pin skip size[" + i + "] shot=" + shot.shot_id + " bytes=" + shot.bytes);
        }
        feed.appendChild(pin);
        if (img.complete && img.naturalWidth > 0) {
          markPinLoaded(pin, img, shot, i);
        }
        console.log(
          "SeenShot cabinet: pin mount[" + i + "] shot=" + shot.shot_id +
            " loading=" + img.loading + " complete=" + img.complete +
            " visibility=" + shot.visibility +
            " page=" + shot.pagePath +
            " bytes=" + shot.bytes +
            " sizeText=" + sizeText
        );
      }
    }

    function goSignIn() {
      const url = "/signin?next=" + encodeURIComponent("/space/");
      console.log("SeenShot cabinet: goSignIn href=" + url);
      location.href = url;
    }

    async function load() {
      if (loadInFlight) {
        console.warn("SeenShot cabinet: load ignored, already in flight");
        return;
      }
      loadInFlight = true;
      sessionReady = false;
      try {
        await SeenShotAuth.ensureIdToken();
        sessionReady = true;
        const response = await SeenShotAuth.api("/api/shots");
        if (response.status === 401) {
          console.warn("SeenShot cabinet: unauthorized, go signin");
          sessionReady = false;
          goSignIn();
          return;
        }
        if (!response.ok) {
          console.warn("SeenShot cabinet: shots status=" + response.status + " no status banner");
          feed.innerHTML = "";
          setEmptyVisible(false);
          return;
        }
        const data = await response.json();
        const shots = Array.isArray(data.shots) ? data.shots : [];
        console.log("SeenShot cabinet: shots=" + shots.length);
        render(shots);
      } catch (error) {
        const code = error && error.message ? error.message : "UNKNOWN_ERROR";
        console.error("SeenShot cabinet: load failed code=" + code, error);
        if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED" || code === "AUTH_DISPOSABLE_EMAIL") {
          sessionReady = false;
          goSignIn();
          return;
        }
        feed.innerHTML = "";
        setEmptyVisible(false);
        console.warn("SeenShot cabinet: load failed, empty hint hidden");
      } finally {
        loadInFlight = false;
      }
    }

    // ─── Ariadne's Thread [AT-0284] ─────────────────────
    // What: Upgrade to Pro POSTs /api/billing/checkout and opens Polar url
    // Why:  Cabinet must start the same Polar session as Mac Settings
    // Date: 2026-08-27
    // Related: [AT-0281] src/index.ts:billingCheckout, [AT-0277] backend→index.ts:checkout
    // ─────────────────────────────────────────────────────
    const upgrade = document.getElementById("upgrade-pro");
    if (upgrade) {
      upgrade.addEventListener("click", function () {
        startCheckout(upgrade);
      });
      console.log("SeenShot cabinet: upgrade button bound");
    } else {
      console.log("SeenShot cabinet: upgrade button missing");
    }

    async function startCheckout(button) {
      if (button.dataset.busy === "1") {
        console.warn("SeenShot cabinet: checkout ignored, already in flight");
        return;
      }
      button.dataset.busy = "1";
      button.disabled = true;
      console.log("SeenShot cabinet: checkout start");
      try {
        await SeenShotAuth.ensureIdToken();
        const response = await SeenShotAuth.api("/api/billing/checkout", {
          method: "POST",
          body: "{}",
        });
        const text = await response.text();
        console.log("SeenShot cabinet: checkout status=" + response.status + " bodyChars=" + text.length);
        let data = {};
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error("SeenShot cabinet: checkout JSON failed", error);
        }
        if (!response.ok || !data.url) {
          console.error("SeenShot cabinet: checkout failed code=" + (data.code || "") + " urlEmpty=" + !data.url);
          button.dataset.busy = "0";
          button.disabled = false;
          return;
        }
        console.log("SeenShot cabinet: checkout redirect urlChars=" + data.url.length);
        location.href = data.url;
      } catch (error) {
        console.error("SeenShot cabinet: checkout error", error);
        button.dataset.busy = "0";
        button.disabled = false;
      }
    }

    load();

    window.SeenShotCabinet = { logActions: logActions };
    logActions();

}
