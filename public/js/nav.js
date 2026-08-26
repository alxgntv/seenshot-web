/* ─── Ariadne's Thread [AT-0009] ─────────────────────
   What: Top nav Sign In / email / Sign Out from the Firebase session
   Why:  Landing, cabinet, and shot pages share one header
   Date: 2026-08-26
   Related: [AT-0008] auth.js
─────────────────────────────────────────────────────── */
(function () {
  async function paint() {
    const link = document.getElementById("nav-auth");
    if (!link) {
      console.log("SeenShot nav: no nav-auth link");
      return;
    }
    const session = SeenShotAuth.readSession();
    if (!session.refreshToken) {
      link.textContent = "Sign In";
      link.href = "/signin";
      link.onclick = null;
      console.log("SeenShot nav: signed out");
      return;
    }
    try {
      await SeenShotAuth.ensureIdToken();
    } catch (error) {
      console.warn("SeenShot nav: ensure failed", error);
      link.textContent = "Sign In";
      link.href = "/signin";
      return;
    }
    const fresh = SeenShotAuth.readSession();
    const label = fresh.email || "Cabinet";
    link.textContent = label;
    link.href = "/cabinet";
    console.log("SeenShot nav: signed in emailChars=" + (fresh.email || "").length);
  }

  paint();
  window.SeenShotNav = { paint: paint };
})();
