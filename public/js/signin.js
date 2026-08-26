/* ─── Ariadne's Thread [AT-0010] ─────────────────────
   What: Sign In / Create account / reset / email link on Identity Toolkit
   Why:  Same account as the Mac app Settings panel
   Date: 2026-08-26
   Related: [AT-0008] auth.js, app→AccountSignInPanel.cpp
─────────────────────────────────────────────────────── */
(function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const status = document.getElementById("status");
  const buttons = [
    document.getElementById("sign-in"),
    document.getElementById("create"),
    document.getElementById("forgot"),
    document.getElementById("email-link"),
  ];
  let inFlight = false;

  function setBusy(busy) {
    inFlight = busy;
    buttons.forEach(function (button) {
      if (button) {
        button.disabled = busy;
      }
    });
    console.log("SeenShot signin: busy=" + busy);
  }

  function show(code, isError) {
    status.textContent = SeenShotAuth.messageFor(code);
    status.className = isError ? "error" : "empty";
    console.log("SeenShot signin: status code=" + code + " error=" + Boolean(isError));
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
      console.warn("SeenShot signin: ignored, request already in flight");
      return;
    }
    setBusy(true);
    try {
      await job();
    } catch (error) {
      const code = error && error.message ? error.message : "AUTH_REFRESH_FAILED";
      console.error("SeenShot signin: failed code=" + code, error);
      show(code, true);
    } finally {
      setBusy(false);
    }
  }

  document.getElementById("sign-in").addEventListener("click", function () {
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
      await SeenShotAuth.signInEmail(email, password);
      console.log("SeenShot signin: signed in, go cabinet");
      location.href = "/cabinet";
    });
  });

  document.getElementById("create").addEventListener("click", function () {
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
      await SeenShotAuth.signUpEmail(email, password);
      console.log("SeenShot signin: created account, go cabinet");
      location.href = "/cabinet";
    });
  });

  document.getElementById("forgot").addEventListener("click", function () {
    run(async function () {
      const email = requireEmail();
      if (!email) {
        return;
      }
      await SeenShotAuth.sendPasswordReset(email);
      show("AUTH_CHECK_EMAIL", false);
    });
  });

  document.getElementById("email-link").addEventListener("click", function () {
    run(async function () {
      const email = requireEmail();
      if (!email) {
        return;
      }
      await SeenShotAuth.sendEmailLink(email);
      show("AUTH_CHECK_EMAIL", false);
    });
  });

  document.querySelector(".auth-form").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !inFlight) {
      event.preventDefault();
      document.getElementById("sign-in").click();
    }
  });

  async function finishEmailLink() {
    const params = new URLSearchParams(location.search);
    const oobCode = params.get("oobCode");
    const mode = params.get("mode");
    console.log("SeenShot signin: query mode=" + mode + " oob=" + Boolean(oobCode));
    if (!oobCode || (mode && mode !== "signIn")) {
      return;
    }
    const email = localStorage.getItem(SeenShotAuth.STORAGE.pendingEmail) || emailInput.value.trim();
    if (!email) {
      show("AUTH_EMAIL_REQUIRED", true);
      return;
    }
    await run(async function () {
      await SeenShotAuth.signInEmailLink(email, oobCode);
      console.log("SeenShot signin: email link done, go cabinet");
      location.href = "/cabinet";
    });
  }

  const session = SeenShotAuth.readSession();
  if (session.refreshToken) {
    console.log("SeenShot signin: already signed in, go cabinet");
    location.href = "/cabinet";
    return;
  }
  finishEmailLink();
})();
