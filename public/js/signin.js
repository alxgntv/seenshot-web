/* ─── Ariadne's Thread [AT-0010] ─────────────────────
   What: Sign In / Create account / reset on Identity Toolkit
   Why:  Same account as the Mac app Settings panel
   Date: 2026-08-26
   Related: [AT-0008] auth.js, app→AccountSignInPanel.cpp
─────────────────────────────────────────────────────── */
(function () {
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
  const buttons = [forgot, primary, switchBtn, generateBtn, togglePassword];
  let inFlight = false;
  let mode = "signin";
  let passwordVisible = false;

  function setBusy(busy) {
    inFlight = busy;
    buttons.forEach(function (button) {
      if (button) {
        button.disabled = busy;
      }
    });
    console.log("SeenShot signin: busy=" + busy + " mode=" + mode);
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
  function setMode(next) {
    mode = next;
    status.textContent = "";
    status.className = "meta";
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    passwordInput.name = "password";
    if (mode === "create") {
      title.textContent = "Create account";
      document.title = "Create account — SeenShot";
      primary.textContent = "Create account";
      switchBtn.textContent = "Sign In";
      forgot.hidden = true;
      generateBtn.hidden = false;
      passwordField.classList.add("has-generate");
      passwordInput.autocomplete = "new-password";
    } else {
      title.textContent = "Sign In";
      document.title = "Sign In — SeenShot";
      primary.textContent = "Sign In";
      switchBtn.textContent = "Create account";
      forgot.hidden = false;
      generateBtn.hidden = true;
      passwordField.classList.remove("has-generate");
      passwordInput.autocomplete = "current-password";
    }
    setPasswordVisible(false);
    console.log(
      "SeenShot signin: setMode=" + mode +
        " title=" + title.textContent +
        " primary=" + primary.textContent +
        " switch=" + switchBtn.textContent +
        " forgotHidden=" + forgot.hidden +
        " generateHidden=" + generateBtn.hidden +
        " emailType=" + emailInput.type +
        " passwordType=" + passwordInput.type
    );
  }

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
    if (path !== "/oauth/authorize" && path.indexOf("/oauth/authorize?") !== 0) {
      console.warn("SeenShot signin: next rejected path=" + path);
      return "/space/";
    }
    console.log("SeenShot signin: next oauth authorize chars=" + path.length);
    return path;
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

  switchBtn.addEventListener("click", function () {
    if (inFlight) {
      console.warn("SeenShot signin: switch ignored, request in flight");
      return;
    }
    setMode(mode === "create" ? "signin" : "create");
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
      if (event.target === generateBtn || event.target === togglePassword || togglePassword.contains(event.target)) {
        console.log("SeenShot signin: enter on password control, skip submit");
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
    console.log(
      "SeenShot signin: boot hasRefresh=" + Boolean(session.refreshToken) +
        " uid=" + (session.uid || "")
    );
    if (!session.refreshToken) {
      setMode("signin");
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
      setMode("signin");
      finishEmailLink();
    }
  })();
})();
