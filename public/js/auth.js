/* ─── Ariadne's Thread [AT-0008] ─────────────────────
   What: Identity Toolkit REST client shared by sign-in, cabinet, shot page
   Why:  Same Firebase project as the Mac app; no second auth stack
   Date: 2026-08-26
   Related: [AT-0009] signin.js, infra→client/src/auth/FirebaseAuthClient.cpp
─────────────────────────────────────────────────────── */
(function (global) {
  const STORAGE = {
    idToken: "seenshot_idToken",
    refreshToken: "seenshot_refreshToken",
    uid: "seenshot_uid",
    email: "seenshot_email",
    expiresAt: "seenshot_expiresAt",
    pendingEmail: "seenshot_pendingEmail",
  };

  const MESSAGES = {
    EMAIL_IN_USE: "An account with this email already exists. Sign in instead.",
    EMAIL_NOT_FOUND: "No account uses this email. Create an account or use another sign-in method.",
    WRONG_PASSWORD: "That password is not correct.",
    WEAK_PASSWORD: "Choose a stronger password.",
    INVALID_EMAIL: "That email address is not valid.",
    AUTH_LINK_INVALID: "That sign-in link is invalid or has expired.",
    AUTH_ACCOUNT_EXISTS: "This email is already used with another sign-in method.",
    AUTH_PROVIDER_DISABLED: "This sign-in method is not enabled. Try email and password.",
    AUTH_EMAIL_REQUIRED: "Enter your email address.",
    AUTH_PASSWORD_REQUIRED: "Enter your password.",
    AUTH_CHECK_EMAIL: "Check your email to continue.",
    AUTH_REFRESH_FAILED: "Could not refresh your sign-in. Check your internet connection and try again.",
    STORAGE_NEED_SIGN_IN: "Sign in to save to the cloud or share a link.",
  };

  let configPromise = null;
  let refreshInFlight = null;

  function identityErrorCode(bodyText) {
    let message = "";
    try {
      const err = JSON.parse(bodyText).error || {};
      message = String(err.message || "");
    } catch (error) {
      console.warn("SeenShot auth: identity error JSON parse failed", error);
    }
    const colon = message.indexOf(" :");
    if (colon > 0) {
      message = message.slice(0, colon);
    }
    const map = {
      EMAIL_EXISTS: "EMAIL_IN_USE",
      CREDENTIAL_ALREADY_IN_USE: "EMAIL_IN_USE",
      EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
      INVALID_PASSWORD: "WRONG_PASSWORD",
      INVALID_LOGIN_CREDENTIALS: "WRONG_PASSWORD",
      WEAK_PASSWORD: "WEAK_PASSWORD",
      INVALID_EMAIL: "INVALID_EMAIL",
      MISSING_EMAIL: "INVALID_EMAIL",
      INVALID_OOB_CODE: "AUTH_LINK_INVALID",
      EXPIRED_OOB_CODE: "AUTH_LINK_INVALID",
      ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: "AUTH_ACCOUNT_EXISTS",
      OPERATION_NOT_ALLOWED: "AUTH_PROVIDER_DISABLED",
      INVALID_CONTINUE_URI: "AUTH_LINK_INVALID",
    };
    const code = map[message] || "AUTH_REFRESH_FAILED";
    console.warn("SeenShot auth: identity error message=" + message + " code=" + code);
    return code;
  }

  function messageFor(code) {
    return MESSAGES[code] || MESSAGES.AUTH_REFRESH_FAILED;
  }

  function looksLikeEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function writeCookie(idToken) {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = "seenshot_id=" + encodeURIComponent(idToken) + "; path=/" + secure + "; SameSite=Lax";
    console.log("SeenShot auth: cookie written chars=" + idToken.length + " secure=" + Boolean(secure));
  }

  function clearCookie() {
    document.cookie = "seenshot_id=; path=/; max-age=0";
    console.log("SeenShot auth: cookie cleared");
  }

  function saveSession(tokens) {
    localStorage.setItem(STORAGE.idToken, tokens.idToken);
    localStorage.setItem(STORAGE.refreshToken, tokens.refreshToken);
    localStorage.setItem(STORAGE.uid, tokens.uid || "");
    localStorage.setItem(STORAGE.email, tokens.email || "");
    localStorage.setItem(STORAGE.expiresAt, String(tokens.expiresAtMs));
    writeCookie(tokens.idToken);
    console.log(
      "SeenShot auth: session saved uid=" + tokens.uid +
        " emailChars=" + (tokens.email || "").length +
        " expiresAt=" + tokens.expiresAtMs
    );
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.idToken);
    localStorage.removeItem(STORAGE.refreshToken);
    localStorage.removeItem(STORAGE.uid);
    localStorage.removeItem(STORAGE.email);
    localStorage.removeItem(STORAGE.expiresAt);
    clearCookie();
    console.log("SeenShot auth: session cleared");
  }

  function readSession() {
    return {
      idToken: localStorage.getItem(STORAGE.idToken) || "",
      refreshToken: localStorage.getItem(STORAGE.refreshToken) || "",
      uid: localStorage.getItem(STORAGE.uid) || "",
      email: localStorage.getItem(STORAGE.email) || "",
      expiresAtMs: Number(localStorage.getItem(STORAGE.expiresAt) || "0"),
    };
  }

  function parseTokens(json) {
    const expires = Number(json.expiresIn || json.expires_in || 3600);
    const tokens = {
      idToken: json.idToken || json.id_token || "",
      refreshToken: json.refreshToken || json.refresh_token || "",
      uid: json.localId || json.user_id || "",
      email: json.email || "",
      expiresAtMs: Date.now() + (expires > 0 ? expires * 1000 : 3600 * 1000) - 60000,
    };
    console.log(
      "SeenShot auth: parsed tokens uid=" + tokens.uid +
        " emailChars=" + tokens.email.length +
        " expiresAt=" + tokens.expiresAtMs
    );
    if (!tokens.idToken || !tokens.refreshToken) {
      throw new Error("AUTH_REFRESH_FAILED");
    }
    return tokens;
  }

  async function loadConfig() {
    if (configPromise) {
      return configPromise;
    }
    configPromise = fetch("/api/config").then(function (response) {
      console.log("SeenShot auth: config status=" + response.status);
      if (!response.ok) {
        throw new Error("AUTH_REFRESH_FAILED");
      }
      return response.json();
    }).then(function (cfg) {
      console.log(
        "SeenShot auth: config project=" + cfg.firebaseProjectId +
          " apiBase=" + cfg.apiBaseUrl +
          " continue=" + cfg.emailLinkContinueUrl
      );
      return cfg;
    }).catch(function (error) {
      configPromise = null;
      console.error("SeenShot auth: config failed", error);
      throw error;
    });
    return configPromise;
  }

  async function postIdentity(path, body) {
    const cfg = await loadConfig();
    const url = "https://identitytoolkit.googleapis.com/v1/" + path + "?key=" + encodeURIComponent(cfg.firebaseApiKey);
    console.log("SeenShot auth: POST " + path);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    console.log("SeenShot auth: " + path + " status=" + response.status + " bytes=" + text.length);
    if (!response.ok) {
      throw new Error(identityErrorCode(text));
    }
    return JSON.parse(text);
  }

  async function refresh() {
    if (refreshInFlight) {
      console.log("SeenShot auth: refresh already in flight");
      return refreshInFlight;
    }
    const session = readSession();
    if (!session.refreshToken) {
      throw new Error("STORAGE_NEED_SIGN_IN");
    }
    refreshInFlight = (async function () {
      const cfg = await loadConfig();
      const url = "https://securetoken.googleapis.com/v1/token?key=" + encodeURIComponent(cfg.firebaseApiKey);
      console.log("SeenShot auth: refresh token");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(session.refreshToken),
      });
      const text = await response.text();
      console.log("SeenShot auth: refresh status=" + response.status + " bytes=" + text.length);
      if (!response.ok) {
        clearSession();
        throw new Error(identityErrorCode(text));
      }
      const tokens = parseTokens(JSON.parse(text));
      tokens.email = tokens.email || session.email;
      saveSession(tokens);
      return tokens;
    })().finally(function () {
      refreshInFlight = null;
    });
    return refreshInFlight;
  }

  async function ensureIdToken() {
    const session = readSession();
    if (!session.idToken || !session.refreshToken) {
      console.warn("SeenShot auth: no session");
      throw new Error("STORAGE_NEED_SIGN_IN");
    }
    if (session.expiresAtMs > Date.now()) {
      writeCookie(session.idToken);
      return session.idToken;
    }
    console.log("SeenShot auth: id token expired expiresAt=" + session.expiresAtMs);
    const tokens = await refresh();
    return tokens.idToken;
  }

  async function signInEmail(email, password) {
    console.log("SeenShot auth: signInEmail emailChars=" + email.length);
    const json = await postIdentity("accounts:signInWithPassword", {
      email: email,
      password: password,
      returnSecureToken: true,
    });
    const tokens = parseTokens(json);
    saveSession(tokens);
    return tokens;
  }

  async function signUpEmail(email, password) {
    console.log("SeenShot auth: signUpEmail emailChars=" + email.length);
    const json = await postIdentity("accounts:signUp", {
      email: email,
      password: password,
      returnSecureToken: true,
    });
    const tokens = parseTokens(json);
    saveSession(tokens);
    return tokens;
  }

  async function sendPasswordReset(email) {
    console.log("SeenShot auth: sendPasswordReset emailChars=" + email.length);
    await postIdentity("accounts:sendOobCode", {
      requestType: "PASSWORD_RESET",
      email: email,
    });
  }

  async function sendEmailLink(email) {
    const cfg = await loadConfig();
    console.log("SeenShot auth: sendEmailLink continue=" + cfg.emailLinkContinueUrl);
    await postIdentity("accounts:sendOobCode", {
      requestType: "EMAIL_SIGNIN",
      email: email,
      continueUrl: cfg.emailLinkContinueUrl,
      canHandleCodeInApp: false,
    });
    localStorage.setItem(STORAGE.pendingEmail, email);
  }

  async function signInEmailLink(email, oobCode) {
    console.log("SeenShot auth: signInEmailLink");
    const json = await postIdentity("accounts:signInWithEmailLink", {
      email: email,
      oobCode: oobCode,
    });
    const tokens = parseTokens(json);
    saveSession(tokens);
    localStorage.removeItem(STORAGE.pendingEmail);
    return tokens;
  }

  async function api(path, options) {
    const token = await ensureIdToken();
    const headers = Object.assign({}, (options && options.headers) || {});
    headers.Authorization = "Bearer " + token;
    if (options && options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(path, Object.assign({}, options || {}, { headers: headers }));
    console.log("SeenShot auth: api " + path + " status=" + response.status);
    if (response.status === 401) {
      console.warn("SeenShot auth: api 401, refresh once");
      await refresh();
      const retryToken = readSession().idToken;
      const retryHeaders = Object.assign({}, (options && options.headers) || {});
      retryHeaders.Authorization = "Bearer " + retryToken;
      if (options && options.body && !retryHeaders["Content-Type"]) {
        retryHeaders["Content-Type"] = "application/json";
      }
      const retry = await fetch(path, Object.assign({}, options || {}, { headers: retryHeaders }));
      console.log("SeenShot auth: api retry " + path + " status=" + retry.status);
      return retry;
    }
    return response;
  }

  global.SeenShotAuth = {
    STORAGE: STORAGE,
    loadConfig: loadConfig,
    readSession: readSession,
    clearSession: clearSession,
    looksLikeEmail: looksLikeEmail,
    messageFor: messageFor,
    ensureIdToken: ensureIdToken,
    signInEmail: signInEmail,
    signUpEmail: signUpEmail,
    sendPasswordReset: sendPasswordReset,
    sendEmailLink: sendEmailLink,
    signInEmailLink: signInEmailLink,
    api: api,
  };
  console.log("SeenShot auth: module ready");
})(window);
