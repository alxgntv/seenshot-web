// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
/* ─── Ariadne's Thread [AT-0012] ─────────────────────
   What: Owner shot page loads the PNG with Bearer and copies the share URL
   Why:  Private shots stay behind Firebase; public shots copy /screenshot/{id}
   Date: 2026-08-26
   Related: [AT-0005] src/html.ts:ownerShotPage, [AT-0008] auth.js
─────────────────────────────────────────────────────── */

  let startInFlight = false;

  async function start(shotId) {
    if (startInFlight) {
      console.warn("SeenShot shot: start ignored, already in flight shotId=" + shotId);
      return;
    }
    startInFlight = true;
    const status = document.getElementById("status");
    const img = document.getElementById("shot");
    const copy = document.getElementById("copy-link");
    console.log("SeenShot shot: start shotId=" + shotId);
    try {
      await SeenShotAuth.ensureIdToken();
      const listResponse = await SeenShotAuth.api("/api/shots");
      if (listResponse.status === 401) {
        location.href = "/signin";
        return;
      }
      const data = await listResponse.json();
      const shots = Array.isArray(data.shots) ? data.shots : [];
      const shot = shots.filter(function (item) {
        return item.shot_id === shotId;
      })[0];
      console.log("SeenShot shot: found=" + Boolean(shot) + " total=" + shots.length);
      if (!shot) {
        status.className = "empty";
        status.textContent = "This screenshot is gone. The link is expired, unpublished, or was removed.";
        copy.hidden = true;
        return;
      }
      const imageResponse = await SeenShotAuth.api("/api/shots/" + encodeURIComponent(shotId) + "/image", {
        headers: {},
      });
      console.log("SeenShot shot: image status=" + imageResponse.status);
      if (!imageResponse.ok) {
        status.className = "error";
        status.textContent = "Could not load this screenshot. Try again.";
        return;
      }
      const blob = await imageResponse.blob();
      img.src = URL.createObjectURL(blob);
      img.hidden = false;
      status.hidden = true;
      console.log(
        "SeenShot shot: shown shotId=" + shotId +
          " blobBytes=" + blob.size +
          " loading=" + (img.getAttribute("loading") || "") +
          " decoding=" + (img.getAttribute("decoding") || "")
      );
      const shareUrl = location.origin + shot.pagePath;
      copy.addEventListener("click", function () {
        navigator.clipboard.writeText(shareUrl).then(function () {
          copy.textContent = "Copied";
          console.log("SeenShot shot: copied " + shareUrl + " visibility=" + shot.visibility);
        }).catch(function (error) {
          console.error("SeenShot shot: copy failed", error);
          copy.textContent = "Copy failed";
        });
      });
      if (shot.visibility !== "public") {
        copy.textContent = "Copy private link";
        console.log("SeenShot shot: private pagePath=" + shot.pagePath);
      }
    } catch (error) {
      const code = error && error.message ? error.message : "UNKNOWN_ERROR";
      console.error("SeenShot shot: failed code=" + code, error);
      if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED") {
        location.href = "/signin";
        return;
      }
      status.className = "error";
      status.textContent = "Could not load this screenshot. Try again.";
    } finally {
      startInFlight = false;
    }
  }

  window.SeenShotShot = { start: start };

export function startShot(shotId: string) {
  return start(shotId);
}
