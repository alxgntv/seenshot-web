// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0008] ─────────────────────
   What: Identity Toolkit REST client shared by sign-in, cabinet, shot page
   Why:  Same Firebase project as the Mac app; no second auth stack
   Date: 2026-08-26
   Related: [AT-0009] signin.js, infra→client/src/auth/FirebaseAuthClient.cpp
─────────────────────────────────────────────────────── */

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
    AUTH_DISPOSABLE_EMAIL: "Please enter your permanent email address.",
    STORAGE_NEED_SIGN_IN: "Sign in to save to the cloud or share a link.",
    REDEEM_INVALID: "That redeem code is not valid.",
    REDEEM_USED: "That redeem code has already been used.",
    REDEEM_EXPIRED: "That redeem code has expired.",
    REDEEM_ALREADY_MEMBER: "This account is already Member.",
    REDEEM_CODE_REQUIRED: "Enter a redeem code.",
    REDEEM_OK: "Member is now active on this account.",
    REDEEM_PLAN_FAILED: "Member was not applied to this account. Try again.",
    AUTH_OAUTH_FAILED: "Could not sign in with seenshot.app. Try again.",
    AUTH_OAUTH_CANCELLED: "",
  };

  let configPromise = null;
  let refreshInFlight = null;
  let blocklistPromise = null;
  let googleAuthReadyPromise = null;
  let googleAuthInstance = null;
  let GoogleAuthProviderCtor = null;
  let signInWithPopupFn = null;
  let getAdditionalUserInfoFn = null;
  let signOutFn = null;

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
      INVALID_IDP_RESPONSE: "AUTH_OAUTH_FAILED",
      FEDERATED_USER_ID_ALREADY_LINKED: "AUTH_ACCOUNT_EXISTS",
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
          " continue=" + cfg.emailLinkContinueUrl +
          " authDomain=" + (cfg.firebaseAuthDomain || "")
      );
      return cfg;
    }).catch(function (error) {
      configPromise = null;
      console.error("SeenShot auth: config failed", error);
      throw error;
    });
    return configPromise;
  }

  function parseBlocklist(text) {
    const set = new Set();
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!line || line.charAt(0) === "#" || line.indexOf("//") === 0) {
        continue;
      }
      set.add(line.toLowerCase());
    }
    console.log("SeenShot auth: disposable blocklist domains=" + set.size);
    return set;
  }

  // ─── Ariadne's Thread [AT-0029] ─────────────────────
  // What: Fetch disposable_email_blocklist.conf once and match domain suffixes
  // Why:  Block throwaway mail on sign-in and create before Identity Toolkit
  // Date: 2026-08-27
  // Related: [AT-0029] src/disposableEmail.ts:isDisposableEmail, [AT-0008] public/js/auth.js:signUpEmail
  // ─────────────────────────────────────────────────────
  function loadBlocklist() {
    if (blocklistPromise) {
      console.log("SeenShot auth: disposable blocklist already loading or loaded");
      return blocklistPromise;
    }
    blocklistPromise = fetch("/disposable_email_blocklist.conf").then(function (response) {
      console.log("SeenShot auth: disposable blocklist status=" + response.status);
      if (!response.ok) {
        throw new Error("AUTH_REFRESH_FAILED");
      }
      return response.text();
    }).then(function (text) {
      return parseBlocklist(text);
    }).catch(function (error) {
      blocklistPromise = null;
      console.error("SeenShot auth: disposable blocklist load failed", error);
      if (error && error.message) {
        throw error;
      }
      throw new Error("AUTH_REFRESH_FAILED");
    });
    return blocklistPromise;
  }

  async function assertPermanentEmail(email) {
    const blocklist = await loadBlocklist();
    const at = email.indexOf("@");
    if (at < 0) {
      console.warn("SeenShot auth: assertPermanentEmail missing @");
      throw new Error("INVALID_EMAIL");
    }
    const domainParts = email.slice(at + 1).trim().toLowerCase().split(".");
    for (let i = 0; i < domainParts.length - 1; i += 1) {
      const candidate = domainParts.slice(i).join(".");
      if (blocklist.has(candidate)) {
        console.warn("SeenShot auth: disposable domain=" + candidate + " domainParts=" + domainParts.length);
        throw new Error("AUTH_DISPOSABLE_EMAIL");
      }
    }
    console.log("SeenShot auth: permanent email domainParts=" + domainParts.length);
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
    await assertPermanentEmail(email);
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
    await assertPermanentEmail(email);
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
    await assertPermanentEmail(email);
    await postIdentity("accounts:sendOobCode", {
      requestType: "PASSWORD_RESET",
      email: email,
    });
  }

  async function sendEmailLink(email) {
    const cfg = await loadConfig();
    console.log("SeenShot auth: sendEmailLink continue=" + cfg.emailLinkContinueUrl);
    await assertPermanentEmail(email);
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
    await assertPermanentEmail(email);
    const json = await postIdentity("accounts:signInWithEmailLink", {
      email: email,
      oobCode: oobCode,
    });
    const tokens = parseTokens(json);
    saveSession(tokens);
    localStorage.removeItem(STORAGE.pendingEmail);
    return tokens;
  }

  function firebaseAuthErrorCode(error) {
    const code = error && error.code ? String(error.code) : "";
    const map = {
      "auth/popup-closed-by-user": "AUTH_OAUTH_CANCELLED",
      "auth/cancelled-popup-request": "AUTH_OAUTH_CANCELLED",
      "auth/popup-blocked": "AUTH_OAUTH_FAILED",
      "auth/account-exists-with-different-credential": "AUTH_ACCOUNT_EXISTS",
      "auth/credential-already-in-use": "EMAIL_IN_USE",
      "auth/email-already-in-use": "EMAIL_IN_USE",
      "auth/operation-not-allowed": "AUTH_PROVIDER_DISABLED",
      "auth/unauthorized-domain": "AUTH_OAUTH_FAILED",
      "auth/network-request-failed": "AUTH_REFRESH_FAILED",
      "auth/user-disabled": "AUTH_REFRESH_FAILED",
    };
    const mapped = map[code] || "AUTH_OAUTH_FAILED";
    console.warn("SeenShot auth: firebase google error code=" + code + " mapped=" + mapped);
    return mapped;
  }

  // ─── Ariadne's Thread [AT-0376] ─────────────────────
  // What: Load Firebase Auth from the official CDN and keep Google persistence in memory
  // Why:  signInWithPopup must use the Firebase authDomain, not GIS on the page origin
  // Date: 2026-08-29
  // Related: [AT-0008] public/js/auth.js:loadConfig, https://firebase.google.com/docs/auth/web/google-signin, https://firebase.google.com/docs/auth/web/auth-state-persistence
  // ─────────────────────────────────────────────────────
  async function ensureGoogleAuth() {
    if (googleAuthInstance) {
      console.log("SeenShot auth: google auth already ready");
      return googleAuthInstance;
    }
    if (googleAuthReadyPromise) {
      console.log("SeenShot auth: google auth init already in flight");
      return googleAuthReadyPromise;
    }
    googleAuthReadyPromise = (async function () {
      const cfg = await loadConfig();
      const authDomain = cfg && cfg.firebaseAuthDomain ? String(cfg.firebaseAuthDomain) : "";
      const apiKey = cfg && cfg.firebaseApiKey ? String(cfg.firebaseApiKey) : "";
      const projectId = cfg && cfg.firebaseProjectId ? String(cfg.firebaseProjectId) : "";
      console.log(
        "SeenShot auth: google init project=" + projectId +
          " authDomain=" + authDomain +
          " apiKeyChars=" + apiKey.length
      );
      if (!authDomain || !apiKey || !projectId) {
        throw new Error("AUTH_OAUTH_FAILED");
      }
      const appMod = await import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js");
      const authMod = await import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js");
      const apps = appMod.getApps();
      const app = apps.length
        ? apps[0]
        : appMod.initializeApp({
            apiKey: apiKey,
            authDomain: authDomain,
            projectId: projectId,
          });
      const auth = authMod.getAuth(app);
      auth.languageCode = "en";
      await authMod.setPersistence(auth, authMod.inMemoryPersistence);
      googleAuthInstance = auth;
      GoogleAuthProviderCtor = authMod.GoogleAuthProvider;
      signInWithPopupFn = authMod.signInWithPopup;
      getAdditionalUserInfoFn = authMod.getAdditionalUserInfo;
      signOutFn = authMod.signOut;
      console.log("SeenShot auth: google auth ready persistence=none");
      return auth;
    })().catch(function (error) {
      googleAuthReadyPromise = null;
      googleAuthInstance = null;
      console.error("SeenShot auth: google auth init failed", error);
      throw error && error.message ? error : new Error("AUTH_OAUTH_FAILED");
    });
    return googleAuthReadyPromise;
  }

  function isGoogleAuthReady() {
    return Boolean(googleAuthInstance && signInWithPopupFn && GoogleAuthProviderCtor);
  }

  async function signInGooglePopup(options) {
    const mode = options && options.mode ? String(options.mode) : "signin";
    console.log("SeenShot auth: signInGooglePopup mode=" + mode + " ready=" + isGoogleAuthReady());
    if (!isGoogleAuthReady()) {
      throw new Error("AUTH_OAUTH_FAILED");
    }
    const provider = new GoogleAuthProviderCtor();
    provider.setCustomParameters({ prompt: "select_account" });
    let result;
    try {
      result = await signInWithPopupFn(googleAuthInstance, provider);
    } catch (error) {
      throw new Error(firebaseAuthErrorCode(error));
    }
    const extra = getAdditionalUserInfoFn ? getAdditionalUserInfoFn(result) : null;
    const isNewUser = Boolean(extra && extra.isNewUser);
    const user = result && result.user ? result.user : null;
    console.log(
      "SeenShot auth: google popup isNewUser=" + isNewUser +
        " mode=" + mode +
        " uidChars=" + (user && user.uid ? String(user.uid).length : 0) +
        " emailChars=" + (user && user.email ? String(user.email).length : 0)
    );
    if (!user) {
      throw new Error("AUTH_OAUTH_FAILED");
    }
    if (mode === "create" && !isNewUser) {
      console.warn("SeenShot auth: google create rejected, account already exists");
      try {
        await signOutFn(googleAuthInstance);
      } catch (error) {
        console.warn("SeenShot auth: google signOut after existing account failed", error);
      }
      throw new Error("EMAIL_IN_USE");
    }
    if (mode === "signin" && isNewUser) {
      console.warn("SeenShot auth: google signin rejected, no account yet");
      try {
        await user.delete();
        console.log("SeenShot auth: google unused signup user deleted");
      } catch (error) {
        console.error("SeenShot auth: google unused signup delete failed", error);
        try {
          await signOutFn(googleAuthInstance);
        } catch (signOutError) {
          console.warn("SeenShot auth: google signOut after unused signup failed", signOutError);
        }
      }
      throw new Error("EMAIL_NOT_FOUND");
    }
    let email = user.email ? String(user.email) : "";
    if (!email && user.providerData && user.providerData[0] && user.providerData[0].email) {
      email = String(user.providerData[0].email);
    }
    try {
      if (email) {
        await assertPermanentEmail(email);
      }
      const idToken = await user.getIdToken();
      const tokenResult = await user.getIdTokenResult();
      const expiresMs = Date.parse(tokenResult.expirationTime) - Date.now();
      const expiresIn = Math.max(60, Math.floor((Number.isFinite(expiresMs) ? expiresMs : 3600000) / 1000));
      const tokens = parseTokens({
        idToken: idToken,
        refreshToken: user.refreshToken,
        localId: user.uid,
        email: email,
        expiresIn: String(expiresIn),
      });
      saveSession(tokens);
      try {
        await signOutFn(googleAuthInstance);
      } catch (error) {
        console.warn("SeenShot auth: google in-memory signOut failed", error);
      }
      console.log(
        "SeenShot auth: google firebase session saved mode=" + mode +
          " isNewUser=" + isNewUser +
          " uid=" + tokens.uid
      );
      return tokens;
    } catch (error) {
      try {
        await signOutFn(googleAuthInstance);
      } catch (signOutError) {
        console.warn("SeenShot auth: google signOut after failure failed", signOutError);
      }
      throw error;
    }
  }

  async function throwIfDisposableApi(response) {
    if (response.status !== 403) {
      return;
    }
    let code = "";
    try {
      const body = await response.clone().json();
      code = body && body.code ? String(body.code) : "";
    } catch (error) {
      console.warn("SeenShot auth: 403 JSON parse failed", error);
      return;
    }
    console.warn("SeenShot auth: api 403 code=" + code);
    if (code === "AUTH_DISPOSABLE_EMAIL") {
      clearSession();
      throw new Error("AUTH_DISPOSABLE_EMAIL");
    }
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
    await throwIfDisposableApi(response);
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
      await throwIfDisposableApi(retry);
      return retry;
    }
    return response;
  }

  export const SeenShotAuth = {
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
    ensureGoogleAuth: ensureGoogleAuth,
    isGoogleAuthReady: isGoogleAuthReady,
    signInGooglePopup: signInGooglePopup,
    api: api,
  };
  console.log("SeenShot auth: module ready");

if (typeof window !== "undefined") {
  window.SeenShotAuth = SeenShotAuth;
}
