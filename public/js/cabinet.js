/* ─── Ariadne's Thread [AT-0011] ─────────────────────
   What: Pinterest masonry of the signed-in user's D1+R2 shots
   Why:  Cabinet is the cloud folder from the Mac app
   Date: 2026-08-26
   Related: [AT-0007] src/index.ts:listShots, [AT-0008] auth.js
─────────────────────────────────────────────────────── */
(function () {
  const feed = document.getElementById("feed");
  const status = document.getElementById("status");
  const plan = document.getElementById("plan");
  const signOut = document.getElementById("sign-out");
  let loadInFlight = false;
  let blobUrls = [];

  function revokeBlobs() {
    blobUrls.forEach(function (url) {
      URL.revokeObjectURL(url);
    });
    console.log("SeenShot cabinet: revoked blobUrls=" + blobUrls.length);
    blobUrls = [];
  }

  function showEmpty(text, isError) {
    feed.innerHTML = "";
    status.hidden = false;
    status.className = isError ? "error" : "empty";
    status.textContent = text;
    console.log("SeenShot cabinet: empty error=" + Boolean(isError) + " text=" + text);
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
      showEmpty("No cloud screenshots yet. Capture in SeenShot for Mac and save to the cloud.", false);
      return;
    }
    status.hidden = true;
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
      const meResponse = await SeenShotAuth.api("/api/me");
      if (meResponse.ok) {
        const me = await meResponse.json();
        const usedMb = (Number(me.usedBytes || 0) / (1024 * 1024)).toFixed(2);
        plan.textContent = (me.plan || "free") + " · " + usedMb + " MB";
        console.log("SeenShot cabinet: me plan=" + me.plan + " usedBytes=" + me.usedBytes);
      } else {
        console.warn("SeenShot cabinet: me status=" + meResponse.status);
      }
      const response = await SeenShotAuth.api("/api/shots");
      if (response.status === 401) {
        console.warn("SeenShot cabinet: unauthorized, go signin");
        location.href = "/signin";
        return;
      }
      if (!response.ok) {
        throw new Error("UNKNOWN_ERROR");
      }
      const data = await response.json();
      const shots = Array.isArray(data.shots) ? data.shots : [];
      console.log("SeenShot cabinet: shots=" + shots.length);
      await render(shots);
    } catch (error) {
      const code = error && error.message ? error.message : "UNKNOWN_ERROR";
      console.error("SeenShot cabinet: load failed code=" + code, error);
      if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED") {
        location.href = "/signin";
        return;
      }
      showEmpty("Could not load your screenshots. Try again.", true);
    } finally {
      loadInFlight = false;
    }
  }

  signOut.addEventListener("click", function () {
    console.log("SeenShot cabinet: sign out");
    SeenShotAuth.clearSession();
    location.href = "/signin";
  });

  window.addEventListener("beforeunload", revokeBlobs);
  load();
})();
