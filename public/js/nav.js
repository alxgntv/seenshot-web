/* ─── Ariadne's Thread [AT-0009] ─────────────────────
   What: Top nav Sign In / email / Sign Out from the Firebase session
   Why:  Landing, cabinet, and shot pages share one header
   Date: 2026-08-26
   Related: [AT-0008] auth.js
─────────────────────────────────────────────────────── */
(function () {
  async function paint() {
    const link = document.getElementById("nav-auth");
    const signOut = document.getElementById("sign-out");
    if (!link) {
      console.log("SeenShot nav: no nav-auth link");
      return;
    }
    const session = SeenShotAuth.readSession();
    if (!session.refreshToken) {
      link.textContent = "Sign In";
      link.href = "/signin";
      link.onclick = null;
      if (signOut) {
        signOut.hidden = true;
      }
      console.log("SeenShot nav: signed out signOutPresent=" + Boolean(signOut));
      return;
    }
    try {
      await SeenShotAuth.ensureIdToken();
    } catch (error) {
      console.warn("SeenShot nav: ensure failed", error);
      link.textContent = "Sign In";
      link.href = "/signin";
      if (signOut) {
        signOut.hidden = true;
      }
      return;
    }
    const fresh = SeenShotAuth.readSession();
    const label = fresh.email || "Space";
    link.textContent = label;
    link.href = "/space/";
    if (signOut) {
      signOut.hidden = false;
    }
    console.log(
      "SeenShot nav: signed in emailChars=" + (fresh.email || "").length +
        " signOutVisible=" + Boolean(signOut && !signOut.hidden)
    );
  }

  // ─── Ariadne's Thread [AT-0033] ─────────────────────
  // What: Sign Out in the top nav clears the session
  // Why:  The yellow cabinet-head button moved next to the email
  // Date: 2026-08-27
  // Related: [AT-0009] public/js/nav.js:paint, [AT-0008] public/js/auth.js:clearSession
  // ─────────────────────────────────────────────────────
  const signOut = document.getElementById("sign-out");
  if (signOut) {
    signOut.addEventListener("click", function () {
      console.log("SeenShot nav: sign out");
      SeenShotAuth.clearSession();
      location.href = "/signin";
    });
  } else {
    console.log("SeenShot nav: no sign-out button");
  }

  paint();
  window.SeenShotNav = { paint: paint };
})();
