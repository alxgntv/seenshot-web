/* ─── Ariadne's Thread [AT-0011] ─────────────────────
   What: Pinterest masonry of the signed-in user's D1+R2 shots
   Why:  Cabinet is the cloud folder from the Mac app
   Date: 2026-08-26
   Related: [AT-0007] src/index.ts:listShots, [AT-0008] auth.js
─────────────────────────────────────────────────────── */
(function () {
  const feed = document.getElementById("feed");
  const emptyWrap = document.getElementById("empty-wrap");
  const latestDownload = document.getElementById("latest-download");
  let loadInFlight = false;
  let blobUrls = [];

  function setEmptyVisible(visible) {
    emptyWrap.hidden = !visible;
    if (latestDownload) {
      latestDownload.hidden = !visible;
    }
    console.log("SeenShot cabinet: emptyVisible=" + visible + " downloadHidden=" + (latestDownload ? latestDownload.hidden : "none"));
  }

  function revokeBlobs() {
    blobUrls.forEach(function (url) {
      URL.revokeObjectURL(url);
    });
    console.log("SeenShot cabinet: revoked blobUrls=" + blobUrls.length);
    blobUrls = [];
  }

  async function loadImage(shot) {
    const response = await SeenShotAuth.api("/api/shots/" + encodeURIComponent(shot.shot_id) + "/image", {
      headers: {},
    });
    console.log(
      "SeenShot cabinet: image shot=" + shot.shot_id +
        " status=" + response.status +
        " type=" + (response.headers.get("content-type") || "")
    );
    if (!response.ok) {
      throw new Error("UNKNOWN_ERROR");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    blobUrls.push(url);
    return url;
  }

  async function render(shots) {
    revokeBlobs();
    feed.innerHTML = "";
    if (shots.length === 0) {
      setEmptyVisible(true);
      console.log("SeenShot cabinet: empty feed, show capture hint");
      return;
    }
    setEmptyVisible(false);
    console.log("SeenShot cabinet: render count=" + shots.length);
    for (let i = 0; i < shots.length; i += 1) {
      const shot = shots[i];
      const pin = document.createElement("article");
      pin.className = "pin";
      const link = document.createElement("a");
      link.href = shot.pagePath;
      const img = document.createElement("img");
      img.alt = "Screenshot";
      link.appendChild(img);
      pin.appendChild(link);
      feed.appendChild(pin);
      try {
        img.src = await loadImage(shot);
        console.log(
          "SeenShot cabinet: pin[" + i + "] shot=" + shot.shot_id +
            " visibility=" + shot.visibility +
            " source=" + shot.source +
            " page=" + shot.pagePath
        );
      } catch (error) {
        console.error("SeenShot cabinet: pin image failed shot=" + shot.shot_id, error);
        pin.remove();
      }
    }
  }

  async function load() {
    if (loadInFlight) {
      console.warn("SeenShot cabinet: load ignored, already in flight");
      return;
    }
    loadInFlight = true;
    try {
      await SeenShotAuth.ensureIdToken();
      const response = await SeenShotAuth.api("/api/shots");
      if (response.status === 401) {
        console.warn("SeenShot cabinet: unauthorized, go signin");
        location.href = "/signin";
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
      await render(shots);
    } catch (error) {
      const code = error && error.message ? error.message : "UNKNOWN_ERROR";
      console.error("SeenShot cabinet: load failed code=" + code, error);
      if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED" || code === "AUTH_DISPOSABLE_EMAIL") {
        location.href = "/signin";
        return;
      }
      feed.innerHTML = "";
      setEmptyVisible(false);
      console.warn("SeenShot cabinet: load failed, empty hint hidden");
    } finally {
      loadInFlight = false;
    }
  }

  window.addEventListener("beforeunload", revokeBlobs);
  load();
})();
