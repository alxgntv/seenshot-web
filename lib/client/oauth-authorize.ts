// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
/* ─── Ariadne's Thread [AT-0043] ─────────────────────
   What: Consent Continue posts /oauth/authorize then redirects seenshot://oauth
   Why:  ASWebAuthenticationSession intercepts the custom-scheme redirect
   Date: 2026-08-27
   Related: [AT-0042] public/oauth/authorize.html, [AT-0040] src/oauth.ts:handleAuthorizePost
─────────────────────────────────────────────────────── */

let started = false;
export function startOauthAuthorize() {
  if (started) {
    console.warn("SeenShot startOauthAuthorize: start ignored, already started");
    return;
  }
  started = true;

    const continueBtn = document.getElementById("continue");
    const cancelBtn = document.getElementById("cancel");
    const status = document.getElementById("status");
    const copy = document.getElementById("consent-copy");
    let inFlight = false;

    function show(code, isError) {
      status.textContent = SeenShotAuth.messageFor(code);
      status.className = isError ? "error" : "empty";
      console.log("SeenShot oauth: status code=" + code + " error=" + Boolean(isError));
    }

    function params() {
      return new URLSearchParams(location.search);
    }

    function emailFromCookie() {
      const parts = document.cookie.split(";");
      for (let i = 0; i < parts.length; i += 1) {
        const trimmed = parts[i].trim();
        if (trimmed.indexOf("seenshot_id=") !== 0) {
          continue;
        }
        const raw = trimmed.slice("seenshot_id=".length);
        let jwt = raw;
        try {
          jwt = decodeURIComponent(raw);
        } catch (error) {
          console.warn("SeenShot oauth: cookie decode failed", error);
        }
        const chunks = jwt.split(".");
        if (chunks.length < 2) {
          return "";
        }
        try {
          const json = chunks[1].replace(/-/g, "+").replace(/_/g, "/");
          const padded = json + "=".repeat((4 - (json.length % 4)) % 4);
          const payload = JSON.parse(atob(padded));
          return typeof payload.email === "string" ? payload.email : "";
        } catch (error) {
          console.warn("SeenShot oauth: cookie jwt parse failed", error);
          return "";
        }
      }
      return "";
    }

    function setBusy(busy) {
      inFlight = busy;
      continueBtn.disabled = busy;
      cancelBtn.disabled = busy;
      console.log("SeenShot oauth: busy=" + busy);
    }

    async function paintEmail() {
      try {
        await SeenShotAuth.ensureIdToken();
      } catch (error) {
        const code = error && error.message ? error.message : "STORAGE_NEED_SIGN_IN";
        console.warn("SeenShot oauth: ensureIdToken failed code=" + code);
        if (code === "STORAGE_NEED_SIGN_IN" || code === "AUTH_REFRESH_FAILED") {
          const next = location.pathname + location.search;
          // ─── Ariadne's Thread [AT-0327] ─────────────────────
          // What: Unauthenticated Mac consent sends the browser to /signup?next=
          // Why:  Registration from the app must open {domain}/signup, not /signin
          // Date: 2026-08-28
          // Related: [AT-0324] app→AuthSession.cpp:startWebsiteSignIn, [AT-0044] public/js/signin.js:afterSignInPath
          // ─────────────────────────────────────────────────────
          location.href = "/signup?next=" + encodeURIComponent(next);
          console.log("SeenShot oauth: redirect signup nextChars=" + next.length);
          return;
        }
        show(code, true);
        return;
      }
      const session = SeenShotAuth.readSession();
      const email = session.email || emailFromCookie();
      if (email) {
        copy.textContent = "SeenShot for MacOS wants to sign in as " + email + ".";
      }
      console.log("SeenShot oauth: consent emailChars=" + email.length);
    }

    continueBtn.addEventListener("click", async function () {
      if (inFlight) {
        console.warn("SeenShot oauth: continue ignored, already in flight");
        return;
      }
      setBusy(true);
      try {
        const query = params();
        const body = {
          response_type: query.get("response_type") || "",
          client_id: query.get("client_id") || "",
          redirect_uri: query.get("redirect_uri") || "",
          code_challenge: query.get("code_challenge") || "",
          code_challenge_method: query.get("code_challenge_method") || "",
          state: query.get("state") || "",
        };
        console.log(
          "SeenShot oauth: POST authorize client_id=" + body.client_id +
            " challengeChars=" + body.code_challenge.length
        );
        const token = await SeenShotAuth.ensureIdToken();
        // ─── Ariadne's Thread [AT-0639] ─────────────────────
        // What: POST consent to /oauth/authorize/ so vinext trailingSlash does not 308
        // Why:  POST /oauth/authorize was 308d onto the slash URL, then the page answered 405
        // Date: 2026-09-07
        // Related: [AT-0638] middleware.ts:oauthAuthorizeResponse, [AT-0043] lib/client/oauth-authorize.ts
        // ─────────────────────────────────────────────────────
        console.log("SeenShot oauth: POST /oauth/authorize/ bearerChars=" + token.length)
        const response = await fetch("/oauth/authorize/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(body),
        });
        const text = await response.text();
        console.log("SeenShot oauth: POST authorize status=" + response.status + " bytes=" + text.length);
        let json = {};
        try {
          json = JSON.parse(text);
        } catch (error) {
          console.warn("SeenShot oauth: POST authorize JSON parse failed", error);
        }
        if (!response.ok || !json.redirect) {
          const code = json.code || json.error || "AUTH_REFRESH_FAILED";
          show(code, true);
          setBusy(false);
          return;
        }
        // ─── Ariadne's Thread [AT-0048] ─────────────────────
        // What: After issuing the Mac code, open seenshot:// then replace the tab with /space/
        // Why:  Consent must hand the code to SeenShot.app; the browser should land on the cabinet
        // Date: 2026-08-27
        // Related: [AT-0043] public/js/oauth-authorize.js, [AT-0040] src/oauth.ts:handleAuthorizePost
        // ─────────────────────────────────────────────────────
        console.log("SeenShot oauth: open seenshot://oauth then /space/");
        location.href = json.redirect;
        window.setTimeout(function () {
          console.log("SeenShot oauth: replace /space/");
          location.replace("/space/");
        }, 500);
      } catch (error) {
        const code = error && error.message ? error.message : "AUTH_REFRESH_FAILED";
        console.error("SeenShot oauth: continue failed code=" + code, error);
        show(code, true);
        setBusy(false);
      }
    });

    cancelBtn.addEventListener("click", function () {
      if (inFlight) {
        console.warn("SeenShot oauth: cancel ignored, already in flight");
        return;
      }
      const state = params().get("state") || "";
      const redirect = "seenshot://oauth?error=access_denied&state=" + encodeURIComponent(state);
      console.log("SeenShot oauth: cancel access_denied");
      location.href = redirect;
    });

    paintEmail();

}
