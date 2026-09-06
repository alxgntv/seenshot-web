// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0056] ─────────────────────
   What: Wait bar follows PUT bytes from /upload-progress/{id}, then one GET of the PNG
   Why:  Fake 12s climb to 90% hid real upload speed
   Date: 2026-08-27
   Related: [AT-0055] src/index.ts:uploadProgress, [AT-0211] backend→index.ts:putInbox
─────────────────────────────────────────────────────── */

  const TIMEOUT_MS = 120000;
  const POLL_MS = 200;
  let startInFlight = false;

  function start(publicId, imageUrl, pageUrl, progressUrl) {
    if (startInFlight) {
      console.warn("SeenShot screenshot-upload: start ignored, already in flight publicId=" + publicId);
      return;
    }
    startInFlight = true;
    const bar = document.getElementById("upload-progress");
    const label = document.getElementById("upload-percent");
    const img = document.getElementById("shot");
    const wait = document.getElementById("upload-wait");
    const status = document.getElementById("status");
    // ─── Ariadne's Thread [AT-0077] ─────────────────────
    // What: Wait page reveals #share-foot after PNG GET, hides it on gone
    // Why:  html|react|css|link must not copy until public/{id}.png exists
    // Date: 2026-08-27
    // Related: [AT-0056] public/js/screenshot-upload.js:start, [AT-0075] src/html.ts:shareFootHtml
    // ─────────────────────────────────────────────────────
    const foot = document.getElementById("share-foot");
    const social = document.querySelector(".share-social");
    const shotSlot = document.querySelector(".share-shot");
    if (!bar || !label || !img || !wait || !status || !shotSlot) {
      console.error(
        "SeenShot screenshot-upload: missing elements bar=" + Boolean(bar) + " label=" + Boolean(label) +
          " img=" + Boolean(img) + " wait=" + Boolean(wait) + " status=" + Boolean(status) +
          " foot=" + Boolean(foot) + " social=" + Boolean(social) +
          " shotSlot=" + Boolean(shotSlot) + " publicId=" + publicId,
      );
      startInFlight = false;
      return;
    }
    const started = Date.now();
    let attempt = 0;
    let shownPercent = 0;
    let putDone = false;
    let downloading = false;
    let timedOut = false;
    let xhr = null;
    let pollTimer = 0;
    const progressPath = progressUrl || "/upload-progress/" + encodeURIComponent(publicId);
    console.log(
      "SeenShot screenshot-upload: start publicId=" + publicId + " imageUrl=" + imageUrl +
        " pageUrl=" + pageUrl + " progressUrl=" + progressPath +
        " share-shot-w=" + Math.round(shotSlot.getBoundingClientRect().width) +
        " share-shot-h=" + Math.round(shotSlot.getBoundingClientRect().height),
    );

    function setBar(percent) {
      const value = Math.max(shownPercent, Math.min(100, Math.round(percent)));
      shownPercent = value;
      bar.value = value;
      label.textContent = value + "%";
      console.log("SeenShot screenshot-upload: percent=" + value + " publicId=" + publicId);
    }

    function finishGone() {
      timedOut = true;
      downloading = false;
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = 0;
      }
      if (xhr) {
        xhr.abort();
        xhr = null;
      }
      wait.hidden = true;
      img.hidden = true;
      shotSlot.hidden = true;
      console.log("SeenShot screenshot-upload: share-shot hidden gone publicId=" + publicId);
      if (foot) {
        foot.hidden = true;
      }
      // ─── Ariadne's Thread [AT-0313] ─────────────────────
      // What: Hide .share-social when the wait page becomes gone
      // Why:  Network share icons must not sit over a missing screenshot
      // Date: 2026-08-28
      // Related: [AT-0311] src/html.ts:shareSocialHtml, [AT-0077] public/js/screenshot-upload.js:start
      // ─────────────────────────────────────────────────────
      if (social) {
        social.hidden = true;
        console.log("SeenShot screenshot-upload: share-social hidden gone publicId=" + publicId);
      }
      status.hidden = false;
      status.textContent = "This screenshot is gone. The link is expired, unpublished, or was removed.";
      startInFlight = false;
      console.warn(
        "SeenShot screenshot-upload: gone publicId=" + publicId + " attempts=" + attempt +
          " elapsedMs=" + (Date.now() - started),
      );
    }

    function showImage(blob) {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = 0;
      }
      setBar(100);
      wait.hidden = true;
      img.src = URL.createObjectURL(blob);
      img.hidden = false;
      status.hidden = true;
      if (foot) {
        foot.hidden = false;
        console.log("SeenShot screenshot-upload: share-foot shown publicId=" + publicId + " logo=" + Boolean(foot.querySelector(".share-logo")));
      }
      history.replaceState({}, "", pageUrl);
      startInFlight = false;
      console.log(
        "SeenShot screenshot-upload: shown publicId=" + publicId + " blobBytes=" + blob.size +
          " elapsedMs=" + (Date.now() - started) + " attempts=" + attempt +
          " loading=" + (img.getAttribute("loading") || "") +
          " decoding=" + (img.getAttribute("decoding") || ""),
      );
    }

    function schedulePoll() {
      if (timedOut || downloading) {
        return;
      }
      pollTimer = setTimeout(tick, POLL_MS);
    }

    function readProgress(done) {
      const url = progressPath + (progressPath.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.responseType = "text";
      req.onload = function () {
        console.log(
          "SeenShot screenshot-upload: progress status=" + req.status + " attempt=" + attempt +
            " publicId=" + publicId,
        );
        if (timedOut) {
          return;
        }
        if (req.status !== 200) {
          done(null);
          return;
        }
        let parsed = null;
        try {
          parsed = JSON.parse(req.responseText);
        } catch (error) {
          console.warn("SeenShot screenshot-upload: progress JSON failed publicId=" + publicId, error);
          done(null);
          return;
        }
        const sent = Number(parsed && parsed.sent);
        const total = Number(parsed && parsed.total);
        const finished = Boolean(parsed && parsed.done);
        console.log(
          "SeenShot screenshot-upload: progress sent=" + sent + " total=" + total + " done=" + finished +
            " publicId=" + publicId,
        );
        done({ sent: sent, total: total, done: finished });
      };
      req.onerror = function () {
        console.warn("SeenShot screenshot-upload: progress error attempt=" + attempt + " publicId=" + publicId);
        done(null);
      };
      req.send();
    }

    function getPng() {
      if (downloading || timedOut) {
        return;
      }
      attempt += 1;
      const pollUrl = imageUrl + (imageUrl.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
      console.log("SeenShot screenshot-upload: png GET " + pollUrl + " attempt=" + attempt);
      xhr = new XMLHttpRequest();
      xhr.open("GET", pollUrl);
      xhr.responseType = "blob";
      xhr.onprogress = function (event) {
        if (timedOut || xhr.status !== 200) {
          return;
        }
        downloading = true;
        if (event.lengthComputable && event.total > 0) {
          setBar((event.loaded / event.total) * 100);
          console.log(
            "SeenShot screenshot-upload: png loaded=" + event.loaded + " total=" + event.total +
              " attempt=" + attempt,
          );
        }
      };
      xhr.onload = function () {
        const statusCode = xhr.status;
        const size = xhr.response ? xhr.response.size : 0;
        console.log(
          "SeenShot screenshot-upload: png status=" + statusCode + " bytes=" + size + " attempt=" + attempt +
            " publicId=" + publicId,
        );
        if (timedOut) {
          return;
        }
        if (statusCode === 200 && xhr.response && xhr.response.size > 0) {
          downloading = true;
          showImage(xhr.response);
          xhr = null;
          return;
        }
        downloading = false;
        xhr = null;
        schedulePoll();
      };
      xhr.onerror = function () {
        console.warn("SeenShot screenshot-upload: png error attempt=" + attempt + " publicId=" + publicId);
        downloading = false;
        xhr = null;
        if (!timedOut) {
          schedulePoll();
        }
      };
      xhr.onabort = function () {
        console.log("SeenShot screenshot-upload: png abort attempt=" + attempt + " publicId=" + publicId);
      };
      xhr.send();
    }

    function tick() {
      pollTimer = 0;
      if (timedOut) {
        return;
      }
      const elapsed = Date.now() - started;
      if (elapsed > TIMEOUT_MS) {
        console.warn(
          "SeenShot screenshot-upload: timeout publicId=" + publicId + " attempts=" + attempt +
            " elapsedMs=" + elapsed,
        );
        finishGone();
        return;
      }
      readProgress(function (progress) {
        if (timedOut) {
          return;
        }
        if (progress && progress.total > 0) {
          setBar((progress.sent / progress.total) * 100);
          if (progress.done || progress.sent >= progress.total) {
            putDone = true;
          }
        }
        getPng();
      });
    }

    setBar(0);
    tick();
  }

  window.SeenShotScreenshotUpload = { start: start };

export function startScreenshotUpload(publicId: string, imageUrl: string, pageUrl: string, progressUrl: string) {
  return start(publicId, imageUrl, pageUrl, progressUrl);
}
