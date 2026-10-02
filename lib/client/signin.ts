// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
import { SeenShotAuth } from "./auth";
/* ─── Ariadne's Thread [AT-0010] ─────────────────────
   What: Sign In / Create account / reset on Identity Toolkit
   Why:  Same account as the Mac app Settings panel
   Date: 2026-08-26
   Related: [AT-0008] auth.js, app→AccountSignInPanel.cpp
─────────────────────────────────────────────────────── */

let started = false
let isModalForm = false
let applyModalMode = null

// ─── Ariadne's Thread [AT-0682] ─────────────────────
// What: Bind Identity Toolkit in #signup-modal without redirecting the current page
// Why:  Public Download opens Create account in a dialog. resumeIfSignedIn must not kick the landing to /space/
// Date: 2026-10-02
// Related: [AT-0681] lib/client/signup-modal.ts:openSignupModal, [AT-0010] lib/client/signin.ts:startSignin
// ─────────────────────────────────────────────────────
export function setSigninMode(next) {
  const mode = next === "create" ? "create" : "signin"
  console.log(
    "SeenShot signin: setSigninMode next=" + mode +
      " started=" + started +
      " modal=" + isModalForm +
      " hasApply=" + Boolean(applyModalMode)
  )
  if (applyModalMode) {
    applyModalMode(mode)
    return
  }
  console.warn("SeenShot signin: setSigninMode ignored, form not bound")
}

export function startSignin(options) {
  const opts = options || {}
  isModalForm = Boolean(opts.modal)
  const skipResume = Boolean(opts.skipResume) || isModalForm
  const requestedMode = opts.mode === "create" || opts.mode === "signin" ? opts.mode : ""
  console.log(
    "SeenShot signin: start modal=" + isModalForm +
      " skipResume=" + skipResume +
      " requestedMode=" + requestedMode +
      " started=" + started +
      " path=" + (typeof location !== "undefined" ? location.pathname : "")
  )
  if (started) {
    console.warn("SeenShot startSignin: start ignored, already started")
    if (requestedMode) {
      setSigninMode(requestedMode)
    }
    return
  }
  started = true

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordField = document.getElementById("password-field");
    const generateBtn = document.getElementById("generate-password");
    const togglePassword = document.getElementById("toggle-password");
    const status = document.getElementById("status");
    const title = document.getElementById("form-title");
    const forgot = document.getElementById("forgot");
    const primary = document.getElementById("primary");
    const switchBtn = document.getElementById("switch");
    const googleAuth = document.getElementById("google-auth");
    const googleAuthLabel = document.getElementById("google-auth-label");
    const authForm = document.querySelector(".auth-form");
    console.log(
      "SeenShot signin: nodes email=" + Boolean(emailInput) +
        " password=" + Boolean(passwordInput) +
        " field=" + Boolean(passwordField) +
        " generate=" + Boolean(generateBtn) +
        " toggle=" + Boolean(togglePassword) +
        " status=" + Boolean(status) +
        " title=" + Boolean(title) +
        " forgot=" + Boolean(forgot) +
        " primary=" + Boolean(primary) +
        " switch=" + Boolean(switchBtn) +
        " google=" + Boolean(googleAuth) +
        " form=" + Boolean(authForm) +
        " modal=" + isModalForm
    )
    if (
      !emailInput ||
      !passwordInput ||
      !passwordField ||
      !generateBtn ||
      !togglePassword ||
      !status ||
      !title ||
      !forgot ||
      !primary ||
      !switchBtn ||
      !authForm
    ) {
      started = false
      console.error("SeenShot signin: missing form nodes, abort bind")
      return
    }
    const buttons = [forgot, primary, switchBtn, generateBtn, togglePassword, googleAuth];
    let inFlight = false;
    let mode = "signin";
    let passwordVisible = false;
    let googleBound = false;
    let googlePopupOpen = false;

    function setBusy(busy) {
      inFlight = busy;
      buttons.forEach(function (button) {
        if (!button) {
          return;
        }
        if (button.tagName === "A") {
          if (busy) {
            button.setAttribute("aria-disabled", "true");
          } else {
            button.removeAttribute("aria-disabled");
          }
          console.log(
            "SeenShot signin: switch busy=" + busy +
              " href=" + (button.getAttribute("href") || "") +
              " aria-disabled=" + (button.getAttribute("aria-disabled") || "false"),
          );
          return;
        }
        if (button === googleAuth && !busy && !SeenShotAuth.isGoogleAuthReady()) {
          button.disabled = true;
          console.log("SeenShot signin: google stays disabled, firebase auth not ready");
          return;
        }
        button.disabled = busy;
      });
      console.log(
        "SeenShot signin: busy=" + busy +
          " mode=" + mode +
          " googleBusy=" + Boolean(googleAuth && googleAuth.disabled) +
          " googlePopup=" + googlePopupOpen
      );
    }

    function show(code, isError) {
      status.textContent = SeenShotAuth.messageFor(code);
      status.className = isError ? "error" : "empty";
      console.log("SeenShot signin: status code=" + code + " error=" + Boolean(isError) + " mode=" + mode);
    }

    function requireEmail() {
      const email = emailInput.value.trim();
      if (!email) {
        show("AUTH_EMAIL_REQUIRED", true);
        return "";
      }
      if (!SeenShotAuth.looksLikeEmail(email)) {
        show("INVALID_EMAIL", true);
        return "";
      }
      return email;
    }

    async function run(job) {
      if (inFlight) {
        console.warn("SeenShot signin: ignored, request already in flight mode=" + mode);
        return;
      }
      setBusy(true);
      try {
        await job();
      } catch (error) {
        const code = error && error.message ? error.message : "AUTH_REFRESH_FAILED";
        console.error("SeenShot signin: failed code=" + code + " mode=" + mode, error);
        show(code, true);
      } finally {
        setBusy(false);
      }
    }

    function randomInt(max) {
      const cap = 0x100000000;
      const limit = cap - (cap % max);
      const buf = new Uint32Array(1);
      let value = 0;
      do {
        crypto.getRandomValues(buf);
        value = buf[0];
      } while (value >= limit);
      return value % max;
    }

    // ─── Ariadne's Thread [AT-0031] ─────────────────────
    // What: Fill the password field with 12 CSPRNG letters, numbers, and symbols
    // Why:  Create account asked for Generate password inside the same input
    // Date: 2026-08-27
    // Related: [AT-0028] public/js/signin.js:setMode, [AT-0016] public/signin.html
    // ─────────────────────────────────────────────────────
    function generatePassword() {
      const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*_-=";
      const all = letters + numbers + symbols;
      const chars = [
        letters.charAt(randomInt(letters.length)),
        numbers.charAt(randomInt(numbers.length)),
        symbols.charAt(randomInt(symbols.length)),
      ];
      for (let i = chars.length; i < 12; i += 1) {
        chars.push(all.charAt(randomInt(all.length)));
      }
      for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = randomInt(i + 1);
        const tmp = chars[i];
        chars[i] = chars[j];
        chars[j] = tmp;
      }
      const password = chars.join("");
      console.log(
        "SeenShot signin: generated password chars=" + password.length +
          " letters=" + letters.length +
          " numbers=" + numbers.length +
          " symbols=" + symbols.length
      );
      return password;
    }

    // ─── Ariadne's Thread [AT-0032] ─────────────────────
    // What: Toggle the password input between password and text
    // Why:  Show password with an eye; the control stays a password field
    // Date: 2026-08-27
    // Related: [AT-0031] public/js/signin.js:generatePassword, [AT-0028] public/js/signin.js:setMode
    // ─────────────────────────────────────────────────────
    function setPasswordVisible(visible) {
      passwordVisible = Boolean(visible);
      passwordInput.type = passwordVisible ? "text" : "password";
      togglePassword.setAttribute("aria-pressed", passwordVisible ? "true" : "false");
      togglePassword.setAttribute("aria-label", passwordVisible ? "Hide password" : "Show password");
      console.log(
        "SeenShot signin: password visible=" + passwordVisible +
          " type=" + passwordInput.type +
          " mode=" + mode
      );
    }

    // ─── Ariadne's Thread [AT-0028] ─────────────────────
    // What: Toggle Sign In vs Create account on the same fields
    // Why:  Create account was a second submit on the sign-in form
    // Date: 2026-08-27
    // Related: [AT-0016] public/signin.html, [AT-0008] public/js/auth.js:signUpEmail
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0326] ─────────────────────
    // What: Drive create vs sign-in from /signup vs /signin and point #switch at the other path
    // Why:  Create account must be a real /signup URL on the same Identity Toolkit form
    // Date: 2026-08-28
    // Related: [AT-0325] src/index.ts:fetch, [AT-0028] public/js/signin.js:setMode
    // ─────────────────────────────────────────────────────
    function pathIsSignup() {
      const path = location.pathname.replace(/\/+$/, "") || "/";
      const signup = path === "/signup";
      console.log("SeenShot signin: path=" + location.pathname + " signup=" + signup);
      return signup;
    }

    function switchHref(targetPath) {
      const next = new URLSearchParams(location.search).get("next") || "";
      if (!next) {
        return targetPath;
      }
      return targetPath + "?next=" + encodeURIComponent(next);
    }

    // ─── Ariadne's Thread [AT-0345] ─────────────────────
    // What: Keep .has-generate on Sign In so Forgot password fits in the password input
    // Why:  Forgot moved into #password-field; padding-right must match Generate password
    // Date: 2026-08-28
    // Related: [AT-0028] public/js/signin.js:setMode, [AT-0345] public/signin.html:#forgot, [AT-0031] public/css/site.css:.password-field
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0358] ─────────────────────
    // What: Use hyphen in document.title for Create account and Sign In
    // Why:  Visible site text must not use semicolon or long dash
    // Date: 2026-08-28
    // Related: [AT-0345] public/js/signin.js:setMode, [AT-0358] public/privacy/index.html
    // ─────────────────────────────────────────────────────
    function setMode(next) {
      mode = next;
      status.textContent = "";
      status.className = "meta";
      emailInput.type = "email";
      emailInput.autocomplete = "email";
      passwordInput.name = "password";
      if (mode === "create") {
        title.textContent = "Create account";
        if (!isModalForm) {
          document.title = "Create account - SeenShot";
        }
        console.log("SeenShot signin: document.title=" + document.title + " mode=create modal=" + isModalForm);
        primary.textContent = "Create account";
        switchBtn.textContent = "Sign In";
        if (switchBtn.tagName === "A") {
          switchBtn.setAttribute("href", switchHref("/signin"));
        }
        forgot.hidden = true;
        generateBtn.hidden = false;
        passwordField.classList.add("has-generate");
        passwordInput.autocomplete = "new-password";
      } else {
        title.textContent = "Sign In";
        if (!isModalForm) {
          document.title = "Sign In - SeenShot";
        }
        console.log("SeenShot signin: document.title=" + document.title + " mode=sign-in modal=" + isModalForm);
        primary.textContent = "Sign In";
        switchBtn.textContent = "Create account";
        if (switchBtn.tagName === "A") {
          switchBtn.setAttribute("href", switchHref("/signup"));
        }
        forgot.hidden = false;
        generateBtn.hidden = true;
        passwordField.classList.add("has-generate");
        passwordInput.autocomplete = "current-password";
      }
      setPasswordVisible(false);
      const googleText = mode === "create" ? "Sign up with Google" : "Sign in with Google";
      if (googleAuthLabel) {
        googleAuthLabel.textContent = googleText;
      }
      if (googleAuth) {
        googleAuth.setAttribute("aria-label", googleText);
      }
      console.log(
        "SeenShot signin: setMode=" + mode +
          " title=" + title.textContent +
          " primary=" + primary.textContent +
          " switch=" + switchBtn.textContent +
          " href=" + (switchBtn.getAttribute("href") || "") +
          " forgotHidden=" + forgot.hidden +
          " generateHidden=" + generateBtn.hidden +
          " hasGenerateClass=" + passwordField.classList.contains("has-generate") +
          " passwordFieldId=" + passwordField.id +
          " emailType=" + emailInput.type +
          " passwordType=" + passwordInput.type +
          " googleLabel=" + googleText +
          " modal=" + isModalForm
      );
    }
    applyModalMode = setMode

    // ─── Ariadne's Thread [AT-0044] ─────────────────────
    // What: Honor same-origin next=/oauth/authorize after sign-in
    // Why:  Mac PKCE lands on /signin then must return to consent, not /space/
    // Date: 2026-08-27
    // Related: [AT-0039] src/index.ts:handleAuthorizeGet, [AT-0010] public/js/signin.js
    // ─────────────────────────────────────────────────────
    function afterSignInPath() {
      const raw = new URLSearchParams(location.search).get("next") || "";
      if (!raw) {
        return "/space/";
      }
      let path = raw;
      try {
        if (raw.charAt(0) === "/") {
          path = raw;
        } else {
          const parsed = new URL(raw, location.origin);
          if (parsed.origin !== location.origin) {
            console.warn("SeenShot signin: next rejected off-origin");
            return "/space/";
          }
          path = parsed.pathname + parsed.search;
        }
      } catch (error) {
        console.warn("SeenShot signin: next parse failed", error);
        return "/space/";
      }
      // ─── Ariadne's Thread [AT-0385] ─────────────────────
      // What: Honor next=/space/ and next=/space/redem after sign-in
      // Why:  Redeem lives at /space/redem; do not put the code in the path
      // Date: 2026-08-31
      // Related: [AT-0385] public/js/redem.js:goSignIn, [AT-0044] public/js/signin.js:afterSignInPath
      // ─────────────────────────────────────────────────────
      const pathOnly = path.split("?")[0];
      const redemOk = pathOnly === "/space/redem" || pathOnly === "/space/redem/";
      // ─── Ariadne's Thread [AT-0640] ─────────────────────
      // What: Honor next=/oauth/authorize/ after sign-in as well as the no-slash URL
      // Why:  trailingSlash: true lands Mac PKCE on the slash consent URL
      // Date: 2026-09-07
      // Related: [AT-0044] lib/client/signin.ts:afterSignInPath, [AT-0638] middleware.ts:oauthAuthorizeResponse
      // ─────────────────────────────────────────────────────
      const authorizeOk = pathOnly === "/oauth/authorize" || pathOnly === "/oauth/authorize/"
      if (authorizeOk) {
        console.log("SeenShot signin: next oauth authorize path=" + pathOnly + " chars=" + path.length)
        return path;
      }
      if (pathOnly === "/space" || pathOnly === "/space/" || redemOk) {
        const nextPath = pathOnly === "/space" ? "/space/" : pathOnly === "/space/redem" ? "/space/redem/" : pathOnly;
        console.log("SeenShot signin: next space path=" + nextPath + " redem=" + redemOk);
        return nextPath;
      }
      // ─── Ariadne's Thread [AT-0553] ─────────────────────
      // What: Honor next=/pricing/?pay=member|lifetime after sign-in
      // Why:  Unsigned /pricing Pay must resume Polar checkout for the selected plan
      // Date: 2026-09-05
      // Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0044] lib/client/signin.ts:afterSignInPath
      // ─────────────────────────────────────────────────────
      const pricingPath = pathOnly === "/pricing" || pathOnly === "/pricing/";
      if (pricingPath) {
        const query = path.indexOf("?") >= 0 ? path.slice(path.indexOf("?") + 1) : "";
        const pay = new URLSearchParams(query).get("pay") || "";
        if (pay === "member" || pay === "lifetime") {
          const nextPath = "/pricing/?pay=" + pay;
          console.log("SeenShot signin: next pricing path=" + nextPath);
          return nextPath;
        }
        console.log("SeenShot signin: next pricing path=/pricing/");
        return "/pricing/";
      }
      console.warn("SeenShot signin: next rejected path=" + path);
      return "/space/";
    }

    // ─── Ariadne's Thread [AT-0376] ─────────────────────
    // What: Bind #google-auth to Firebase Auth signInWithPopup for Sign In and Create account
    // Why:  Google must create or sign in through Firebase, not GIS OAuth on this origin
    // Date: 2026-08-29
    // Related: [AT-0376] public/js/auth.js:signInGooglePopup, [AT-0376] public/signin.html:#google-auth
    // ─────────────────────────────────────────────────────
    function bindGoogleButton() {
      if (googleBound) {
        console.warn("SeenShot signin: google bind ignored, already bound");
        return;
      }
      if (!googleAuth) {
        console.error("SeenShot signin: missing #google-auth");
        return;
      }
      googleBound = true;
      googleAuth.addEventListener("click", function () {
        if (inFlight || googlePopupOpen) {
          console.warn(
            "SeenShot signin: google click ignored inFlight=" + inFlight +
              " popup=" + googlePopupOpen
          );
          return;
        }
        if (!SeenShotAuth.isGoogleAuthReady()) {
          console.error("SeenShot signin: google firebase auth not ready");
          show("AUTH_OAUTH_FAILED", true);
          return;
        }
        googlePopupOpen = true;
        setBusy(true);
        console.log("SeenShot signin: google popup start mode=" + mode);
        SeenShotAuth.signInGooglePopup({ mode: mode })
          .then(function () {
            const next = afterSignInPath();
            console.log("SeenShot signin: google firebase done next=" + next + " mode=" + mode);
            location.href = next;
          })
          .catch(function (error) {
            const code = error && error.message ? error.message : "AUTH_OAUTH_FAILED";
            if (code === "AUTH_OAUTH_CANCELLED") {
              console.log("SeenShot signin: google popup cancelled mode=" + mode);
              return;
            }
            console.error("SeenShot signin: google failed code=" + code + " mode=" + mode, error);
            show(code, true);
          })
          .finally(function () {
            googlePopupOpen = false;
            setBusy(false);
          });
      });
      console.log("SeenShot signin: google button bound ready=" + SeenShotAuth.isGoogleAuthReady());
    }

    function startGoogleButton() {
      bindGoogleButton();
      SeenShotAuth.ensureGoogleAuth()
        .then(function () {
          if (googleAuth && !inFlight) {
            googleAuth.disabled = false;
          }
          console.log(
            "SeenShot signin: google firebase ready origin=" + location.origin +
              " disabled=" + Boolean(googleAuth && googleAuth.disabled)
          );
        })
        .catch(function (error) {
          console.error("SeenShot signin: google firebase init failed", error);
        });
    }

    if (authForm) {
      authForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("SeenShot signin: form submit cancelled");
      });
    } else {
      console.error("SeenShot signin: missing .auth-form");
    }

    primary.addEventListener("click", function () {
      run(async function () {
        const email = requireEmail();
        if (!email) {
          return;
        }
        const password = passwordInput.value;
        if (!password) {
          show("AUTH_PASSWORD_REQUIRED", true);
          return;
        }
        if (mode === "create") {
          console.log("SeenShot signin: submit create emailChars=" + email.length);
          await SeenShotAuth.signUpEmail(email, password);
          console.log("SeenShot signin: created account");
        } else {
          console.log("SeenShot signin: submit signin emailChars=" + email.length);
          await SeenShotAuth.signInEmail(email, password);
          console.log("SeenShot signin: signed in");
        }
        location.href = afterSignInPath();
      });
    });

    switchBtn.addEventListener("click", function (event) {
      if (inFlight) {
        event.preventDefault();
        console.warn("SeenShot signin: switch ignored, request in flight href=" + (switchBtn.getAttribute("href") || ""));
        return;
      }
      if (isModalForm) {
        event.preventDefault();
        const nextMode = mode === "create" ? "signin" : "create";
        console.log(
          "SeenShot signin: modal switch from=" + mode +
            " to=" + nextMode +
            " href=" + (switchBtn.getAttribute("href") || "")
        );
        setMode(nextMode);
      }
    });

    generateBtn.addEventListener("click", function () {
      if (inFlight) {
        console.warn("SeenShot signin: generate ignored, request in flight");
        return;
      }
      if (mode !== "create") {
        console.warn("SeenShot signin: generate ignored, mode=" + mode);
        return;
      }
      passwordInput.value = generatePassword();
      setPasswordVisible(true);
      passwordInput.focus();
      passwordInput.select();
      console.log("SeenShot signin: password field filled from generate chars=" + passwordInput.value.length);
    });

    togglePassword.addEventListener("click", function () {
      if (inFlight) {
        console.warn("SeenShot signin: toggle password ignored, request in flight");
        return;
      }
      setPasswordVisible(!passwordVisible);
    });

    forgot.addEventListener("click", function () {
      console.log(
        "SeenShot signin: forgot click mode=" + mode +
          " inFlight=" + inFlight +
          " emailLen=" + emailInput.value.trim().length +
          " hidden=" + forgot.hidden
      );
      run(async function () {
        const email = requireEmail();
        if (!email) {
          return;
        }
        await SeenShotAuth.sendPasswordReset(email);
        show("AUTH_CHECK_EMAIL", false);
      });
    });

    document.querySelector(".auth-form").addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !inFlight) {
        if (
          event.target === generateBtn ||
          event.target === forgot ||
          event.target === togglePassword ||
          event.target === googleAuth ||
          togglePassword.contains(event.target)
        ) {
          console.log(
            "SeenShot signin: enter on password control, skip submit" +
              " targetId=" + (event.target && event.target.id ? event.target.id : "") +
              " mode=" + mode
          );
          return;
        }
        event.preventDefault();
        console.log("SeenShot signin: enter submits mode=" + mode);
        primary.click();
      }
    });

    async function finishEmailLink() {
      const params = new URLSearchParams(location.search);
      const oobCode = params.get("oobCode");
      const modeParam = params.get("mode");
      console.log("SeenShot signin: query mode=" + modeParam + " oob=" + Boolean(oobCode));
      if (!oobCode || (modeParam && modeParam !== "signIn")) {
        return;
      }
      const email = localStorage.getItem(SeenShotAuth.STORAGE.pendingEmail) || emailInput.value.trim();
      if (!email) {
        show("AUTH_EMAIL_REQUIRED", true);
        return;
      }
      await run(async function () {
        await SeenShotAuth.signInEmailLink(email, oobCode);
        console.log("SeenShot signin: email link done");
        location.href = afterSignInPath();
      });
    }

    // ─── Ariadne's Thread [AT-0046] ─────────────────────
    // What: Refresh id token and cookie before following next=/oauth/authorize
    // Why:  localStorage refreshToken with an expired seenshot_id cookie looped with Worker 302
    // Date: 2026-08-27
    // Related: [AT-0045] src/oauth.ts:handleAuthorizeGet, [AT-0008] public/js/auth.js:ensureIdToken
    // ─────────────────────────────────────────────────────
    (async function resumeIfSignedIn() {
      const session = SeenShotAuth.readSession();
      const bootMode = requestedMode || (pathIsSignup() ? "create" : "signin");
      console.log(
        "SeenShot signin: boot hasRefresh=" + Boolean(session.refreshToken) +
          " uid=" + (session.uid || "") +
          " skipResume=" + skipResume +
          " bootMode=" + bootMode +
          " modal=" + isModalForm
      );
      if (skipResume) {
        setMode(bootMode);
        startGoogleButton();
        console.log("SeenShot signin: skip resume, stay on host page mode=" + bootMode);
        return;
      }
      if (!session.refreshToken) {
        setMode(bootMode);
        startGoogleButton();
        finishEmailLink();
        return;
      }
      try {
        await SeenShotAuth.ensureIdToken();
        const next = afterSignInPath();
        console.log("SeenShot signin: already signed in, go " + next);
        location.href = next;
      } catch (error) {
        const code = error && error.message ? error.message : "AUTH_REFRESH_FAILED";
        console.warn("SeenShot signin: existing session failed code=" + code, error);
        show(code, true);
        setMode(bootMode);
        startGoogleButton();
        finishEmailLink();
      }
    })();

}
