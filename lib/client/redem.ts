// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
/* ─── Ariadne's Thread [AT-0385] ─────────────────────
   What: Redeem Polar AS-SEEN-XXXXX-XXXXX on /space/redem
   Why:  Member grant must use POST /api/billing/redeem, then GET /api/me must return plan=pro
   Date: 2026-08-31
   Related: [AT-0384] src/index.ts:billingRedeem, [AT-0385] public/space/redem/index.html:#redeem-form
─────────────────────────────────────────────────────── */

let started = false;
export function startRedem() {
  if (started) {
    console.warn("SeenShot startRedem: start ignored, already started");
    return;
  }
  started = true;

    const redeemForm = document.getElementById("redeem-form");
    const redeemInput = document.getElementById("redeem-code");
    const redeemSubmit = document.getElementById("redeem-submit");
    const redeemStatus = document.getElementById("redeem-status");
    const redeemOk = document.getElementById("redeem-ok");
    const redeemOkTitle = document.getElementById("redeem-ok-title");
    const redeemOkText = document.getElementById("redeem-ok-text");
    let redeemInFlight = false;

    function goSignIn() {
      const next = "/space/redem/";
      const url = "/signin?next=" + encodeURIComponent(next);
      console.log("SeenShot redem: goSignIn href=" + url);
      location.href = url;
    }

    function normalizeRedeemInput(raw) {
      const code = String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
      const ok = /^AS-SEEN-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code);
      console.log("SeenShot redem: normalizeRedeem chars=" + code.length + " ok=" + ok);
      return ok ? code : "";
    }

    function showRedeemStatus(code, isError) {
      if (!redeemStatus) {
        console.warn("SeenShot redem: status missing");
        return;
      }
      const text = SeenShotAuth.messageFor(code);
      redeemStatus.hidden = !text;
      redeemStatus.textContent = text;
      redeemStatus.className = isError ? "cabinet-redeem-status error" : "cabinet-redeem-status empty";
      console.log("SeenShot redem: status code=" + code + " error=" + Boolean(isError) + " chars=" + text.length);
    }

    function hideRedeemStatus() {
      if (!redeemStatus) {
        return;
      }
      redeemStatus.hidden = true;
      redeemStatus.textContent = "";
      console.log("SeenShot redem: status hidden");
    }

    function showRedeemOk(kind) {
      if (!redeemOk || !redeemOkTitle || !redeemOkText) {
        console.warn(
          "SeenShot redem: ok missing ok=" + Boolean(redeemOk) +
            " title=" + Boolean(redeemOkTitle) +
            " text=" + Boolean(redeemOkText)
        );
        return;
      }
      if (kind === "already") {
        redeemOkTitle.textContent = "Member";
        redeemOkText.textContent = SeenShotAuth.messageFor("REDEEM_ALREADY_MEMBER");
      } else {
        redeemOkTitle.textContent = "Success";
        redeemOkText.textContent = SeenShotAuth.messageFor("REDEEM_OK");
      }
      redeemOk.hidden = false;
      if (redeemForm) {
        redeemForm.hidden = true;
      }
      hideRedeemStatus();
      console.log("SeenShot redem: ok shown kind=" + kind);
    }

    async function readPlan() {
      const response = await SeenShotAuth.api("/api/me");
      const text = await response.text();
      console.log("SeenShot redem: me status=" + response.status + " bodyChars=" + text.length);
      if (!response.ok) {
        return "";
      }
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("SeenShot redem: me JSON failed", error);
        return "";
      }
      const plan = typeof data.plan === "string" ? data.plan : "";
      console.log("SeenShot redem: me plan=" + plan);
      return plan;
    }

    // ─── Ariadne's Thread [AT-0432] ─────────────────────
    // What: Mark #redeem-submit aria-busy while POST /api/billing/redeem runs
    // Why:  CSS ::after spinner must spin on the pill until the grant check finishes
    // Date: 2026-09-03
    // Related: [AT-0385] lib/client/redem.ts:submitRedeem, https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy
    // ─────────────────────────────────────────────────────
    function setRedeemBusy(busy) {
      redeemInFlight = busy;
      if (!redeemSubmit) {
        console.warn("SeenShot redem: submit missing busy=" + busy);
        return;
      }
      redeemSubmit.disabled = busy;
      if (busy) {
        redeemSubmit.setAttribute("aria-busy", "true");
      } else {
        redeemSubmit.removeAttribute("aria-busy");
      }
      console.log(
        "SeenShot redem: busy=" + busy +
          " disabled=" + redeemSubmit.disabled +
          " ariaBusy=" + (redeemSubmit.getAttribute("aria-busy") || "")
      );
    }

    async function submitRedeem() {
      if (redeemInFlight) {
        console.warn("SeenShot redem: submit ignored, already in flight");
        return;
      }
      const raw = redeemInput ? redeemInput.value : "";
      const normalized = normalizeRedeemInput(raw);
      if (!String(raw || "").trim()) {
        console.warn("SeenShot redem: empty code");
        showRedeemStatus("REDEEM_CODE_REQUIRED", true);
        return;
      }
      if (!normalized) {
        console.warn("SeenShot redem: invalid format");
        showRedeemStatus("REDEEM_INVALID", true);
        return;
      }
      if (redeemInput) {
        redeemInput.value = normalized;
      }
      setRedeemBusy(true);
      hideRedeemStatus();
      console.log("SeenShot redem: start chars=" + normalized.length + " last=" + normalized.slice(-4));
      try {
        await SeenShotAuth.ensureIdToken();
        const response = await SeenShotAuth.api("/api/billing/redeem", {
          method: "POST",
          body: JSON.stringify({ code: normalized }),
        });
        const text = await response.text();
        console.log("SeenShot redem: redeem status=" + response.status + " bodyChars=" + text.length);
        let data = {};
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error("SeenShot redem: redeem JSON failed", error);
        }
        if (!response.ok) {
          const errCode = data.code || "UNKNOWN_ERROR";
          console.error("SeenShot redem: redeem failed code=" + errCode);
          showRedeemStatus(errCode, true);
          return;
        }
        console.log("SeenShot redem: redeem http ok plan=" + (data.plan || ""));
        const plan = await readPlan();
        if (plan !== "pro") {
          console.error("SeenShot redem: plan not pro after redeem plan=" + plan);
          showRedeemStatus("REDEEM_PLAN_FAILED", true);
          return;
        }
        showRedeemOk("redeemed");
        if (window.SeenShotNav && typeof window.SeenShotNav.paint === "function") {
          window.SeenShotNav.paint();
        }
      } catch (error) {
        const errCode = error && error.message ? error.message : "UNKNOWN_ERROR";
        console.error("SeenShot redem: error code=" + errCode, error);
        if (errCode === "STORAGE_NEED_SIGN_IN" || errCode === "AUTH_REFRESH_FAILED" || errCode === "AUTH_DISPOSABLE_EMAIL") {
          goSignIn();
          return;
        }
        showRedeemStatus(errCode, true);
      } finally {
        if (redeemSubmit && redeemForm && !redeemForm.hidden) {
          setRedeemBusy(false);
        } else {
          redeemInFlight = false;
        }
        console.log("SeenShot redem: done inFlight=" + redeemInFlight);
      }
    }

    async function boot() {
      const session = SeenShotAuth.readSession();
      console.log(
        "SeenShot redem: boot path=" + location.pathname +
          " hasRefresh=" + Boolean(session.refreshToken) +
          " form=" + Boolean(redeemForm) +
          " input=" + Boolean(redeemInput) +
          " submit=" + Boolean(redeemSubmit)
      );
      if (!session.refreshToken) {
        goSignIn();
        return;
      }
      try {
        await SeenShotAuth.ensureIdToken();
      } catch (error) {
        const errCode = error && error.message ? error.message : "UNKNOWN_ERROR";
        console.error("SeenShot redem: ensure failed code=" + errCode, error);
        goSignIn();
        return;
      }
      const plan = await readPlan();
      if (plan === "pro") {
        showRedeemOk("already");
        if (window.SeenShotNav && typeof window.SeenShotNav.paint === "function") {
          window.SeenShotNav.paint();
        }
        return;
      }
      if (redeemForm) {
        redeemForm.hidden = false;
        console.log("SeenShot redem: form shown plan=" + plan);
      }
    }

    if (redeemForm && redeemInput && redeemSubmit) {
      redeemForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitRedeem();
      });
      console.log("SeenShot redem: form bound");
    } else {
      console.error(
        "SeenShot redem: form missing form=" + Boolean(redeemForm) +
          " input=" + Boolean(redeemInput) +
          " submit=" + Boolean(redeemSubmit)
      );
    }

    boot();

}
