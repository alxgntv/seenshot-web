/* ─── Ariadne's Thread [AT-0053] ─────────────────────
   What: Poll GET /public/{id}.png with native <progress> 0-100 then show the shot
   Why:  Share opens the page before confirm; wait 0-90 then XHR download 90-100
   Date: 2026-08-27
   Related: [AT-0052] src/html.ts:sharePage, [AT-0050] src/index.ts:publicPng
─────────────────────────────────────────────────────── */
(function (global) {
  const WAIT_CAP = 90;
  const WAIT_MS = 12000;
  const TIMEOUT_MS = 120000;
  const POLL_MS = 400;
  let startInFlight = false;

  function setBar(bar, label, percent) {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    bar.value = value;
    label.textContent = value + "%";
    console.log("SeenShot screenshot-upload: percent=" + value);
  }

  function start(publicId, imageUrl, pageUrl) {
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
    const report = document.getElementById("report");
    if (!bar || !label || !img || !wait || !status) {
      console.error(
        "SeenShot screenshot-upload: missing elements bar=" + Boolean(bar) + " label=" + Boolean(label) +
          " img=" + Boolean(img) + " wait=" + Boolean(wait) + " status=" + Boolean(status) +
          " publicId=" + publicId,
      );
      startInFlight = false;
      return;
    }
    const started = Date.now();
    let attempt = 0;
    let downloading = false;
    let timedOut = false;
    let xhr = null;
    let pollTimer = 0;
    console.log(
      "SeenShot screenshot-upload: start publicId=" + publicId + " imageUrl=" + imageUrl + " pageUrl=" + pageUrl,
    );

    function tickWait() {
      if (downloading || timedOut) {
        return;
      }
      const elapsed = Date.now() - started;
      const pct = Math.min(WAIT_CAP, (elapsed / WAIT_MS) * WAIT_CAP);
      setBar(bar, label, pct);
    }

    const waitTimer = setInterval(tickWait, 100);
    tickWait();

    function finishGone() {
      timedOut = true;
      downloading = false;
      clearInterval(waitTimer);
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
      if (report) {
        report.hidden = true;
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
      clearInterval(waitTimer);
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = 0;
      }
      setBar(bar, label, 100);
      img.src = URL.createObjectURL(blob);
      img.hidden = false;
      wait.hidden = true;
      status.hidden = true;
      if (report) {
        report.hidden = false;
      }
      history.replaceState({}, "", pageUrl);
      startInFlight = false;
      console.log(
        "SeenShot screenshot-upload: shown publicId=" + publicId + " blobBytes=" + blob.size +
          " elapsedMs=" + (Date.now() - started) + " attempts=" + attempt,
      );
    }

    function schedulePoll() {
      if (timedOut || downloading) {
        return;
      }
      pollTimer = setTimeout(poll, POLL_MS);
    }

    function poll() {
      pollTimer = 0;
      if (timedOut) {
        console.warn("SeenShot screenshot-upload: poll skipped after timeout publicId=" + publicId);
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
      attempt += 1;
      console.log(
        "SeenShot screenshot-upload: poll attempt=" + attempt + " url=" + imageUrl + " elapsedMs=" + elapsed,
      );
      xhr = new XMLHttpRequest();
      const pollUrl = imageUrl + (imageUrl.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
      console.log("SeenShot screenshot-upload: poll GET " + pollUrl + " attempt=" + attempt);
      xhr.open("GET", pollUrl);
      xhr.responseType = "blob";
      xhr.onprogress = function (event) {
        if (timedOut) {
          return;
        }
        if (xhr.status !== 200) {
          return;
        }
        if (!downloading) {
          downloading = true;
          clearInterval(waitTimer);
          console.log(
            "SeenShot screenshot-upload: download start attempt=" + attempt + " publicId=" + publicId +
              " lengthComputable=" + event.lengthComputable + " total=" + event.total,
          );
        }
        if (event.lengthComputable && event.total > 0) {
          const downloaded = WAIT_CAP + (event.loaded / event.total) * (100 - WAIT_CAP);
          setBar(bar, label, downloaded);
          console.log(
            "SeenShot screenshot-upload: download loaded=" + event.loaded + " total=" + event.total +
              " attempt=" + attempt,
          );
        }
      };
      xhr.onload = function () {
        const statusCode = xhr.status;
        const size = xhr.response ? xhr.response.size : 0;
        console.log(
          "SeenShot screenshot-upload: poll status=" + statusCode + " attempt=" + attempt +
            " bytes=" + size + " publicId=" + publicId,
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
        if (statusCode === 200) {
          console.warn("SeenShot screenshot-upload: empty 200 publicId=" + publicId + " attempt=" + attempt);
        }
        downloading = false;
        xhr = null;
        schedulePoll();
      };
      xhr.onerror = function () {
        console.warn("SeenShot screenshot-upload: poll error attempt=" + attempt + " publicId=" + publicId);
        downloading = false;
        xhr = null;
        if (!timedOut) {
          schedulePoll();
        }
      };
      xhr.onabort = function () {
        console.log("SeenShot screenshot-upload: poll abort attempt=" + attempt + " publicId=" + publicId);
      };
      xhr.send();
    }

    poll();
  }

  global.SeenShotScreenshotUpload = { start: start };
})(window);
