// @ts-nocheck
import { SeenShotAuth } from "./auth";

// ─── Ariadne's Thread [AT-0551] ─────────────────────
// What: Bind Member and Lifetime Buy buttons to POST /api/billing/checkout with product
// Why:  Landing and /pricing paid cards must open Polar Checkout for the selected plan
// Date: 2026-09-05
// Related: [AT-0284] lib/client/cabinet.ts:startCheckout, [AT-0549] lib/site.ts:billingCheckout
// ─────────────────────────────────────────────────────

let started = false;
export function startPricing() {
  if (started) {
    console.warn("SeenShot startPricing: start ignored, already started");
    return;
  }
  started = true;

  const memberPay = document.getElementById("pricing-pay-member");
  const lifetimePay = document.getElementById("pricing-pay-lifetime");
  const refunds = document.getElementById("pricing-refunds");
  const buttons = [memberPay, lifetimePay].filter(Boolean);
  console.log(
    "SeenShot pricing: start path=" + location.pathname +
      " search=" + location.search +
      " member=" + Boolean(memberPay) +
      " lifetime=" + Boolean(lifetimePay) +
      " refunds=" + Boolean(refunds) +
      " refundsHref=" + (refunds ? (refunds.getAttribute("href") || "") : "") +
      " refundsText=" + (refunds ? (refunds.textContent || "").trim() : ""),
  );

  async function paintPlan() {
    const session = SeenShotAuth.readSession();
    if (!session.refreshToken) {
      console.log("SeenShot pricing: signed out, keep Buy visible");
      return "";
    }
    try {
      const response = await SeenShotAuth.api("/api/me");
      const text = await response.text();
      console.log("SeenShot pricing: me status=" + response.status + " bodyChars=" + text.length);
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("SeenShot pricing: me JSON failed", error);
      }
      const plan = typeof data.plan === "string" ? data.plan : "free";
      buttons.forEach(function (button) {
        console.log(
          "SeenShot pricing: buy visible id=" + (button.id || "") +
            " product=" + (button.getAttribute("data-product") || "") +
            " hidden=" + button.hidden +
            " plan=" + plan,
        );
      });
      return plan;
    } catch (error) {
      console.warn("SeenShot pricing: me failed", error);
      return "";
    }
  }

  async function startCheckout(button) {
    const product = button.getAttribute("data-product") === "lifetime" ? "lifetime" : "member";
    if (button.dataset.busy === "1") {
      console.warn("SeenShot pricing: checkout ignored, already in flight product=" + product);
      return;
    }
    button.dataset.busy = "1";
    button.disabled = true;
    const session = SeenShotAuth.readSession();
    const guest = !session.refreshToken;
    // ─── Ariadne's Thread [AT-0619] ─────────────────────
    // What: Guest Buy POSTs /api/billing/checkout with no Firebase session
    // Why:  Polar Checkout Session does not need Sign In first
    // Date: 2026-09-05
    // Related: [AT-0619] backend→polar.ts:createPolarCheckoutUrl, https://polar.sh/docs/features/checkout/session
    // ─────────────────────────────────────────────────────
    console.log("SeenShot pricing: checkout start product=" + product + " guest=" + guest);
    try {
      let response;
      if (guest) {
        response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: product }),
        });
      } else {
        await SeenShotAuth.ensureIdToken();
        response = await SeenShotAuth.api("/api/billing/checkout", {
          method: "POST",
          body: JSON.stringify({ product: product }),
        });
      }
      const text = await response.text();
      console.log(
        "SeenShot pricing: checkout status=" + response.status +
          " product=" + product +
          " guest=" + guest +
          " bodyChars=" + text.length,
      );
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("SeenShot pricing: checkout JSON failed", error);
      }
      if (!response.ok || !data.url) {
        console.error(
          "SeenShot pricing: checkout failed product=" + product +
            " guest=" + guest +
            " code=" + (data.code || "") +
            " urlEmpty=" + !data.url,
        );
        button.dataset.busy = "0";
        button.disabled = false;
        return;
      }
      console.log(
        "SeenShot pricing: checkout redirect product=" + product +
          " guest=" + guest +
          " urlChars=" + data.url.length,
      );
      location.href = data.url;
    } catch (error) {
      console.error("SeenShot pricing: checkout error product=" + product + " guest=" + guest, error);
      if (!guest && error && error.message === "STORAGE_NEED_SIGN_IN") {
        console.warn("SeenShot pricing: signed-in checkout fell back to guest product=" + product);
        try {
          const guestResponse = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: product }),
          });
          const guestText = await guestResponse.text();
          console.log(
            "SeenShot pricing: guest fallback status=" + guestResponse.status +
              " product=" + product +
              " bodyChars=" + guestText.length,
          );
          let guestData = {};
          try {
            guestData = JSON.parse(guestText);
          } catch (parseError) {
            console.error("SeenShot pricing: guest fallback JSON failed", parseError);
          }
          if (guestResponse.ok && guestData.url) {
            console.log(
              "SeenShot pricing: guest fallback redirect product=" + product +
                " urlChars=" + guestData.url.length,
            );
            location.href = guestData.url;
            return;
          }
        } catch (guestError) {
          console.error("SeenShot pricing: guest fallback error product=" + product, guestError);
        }
      }
      button.dataset.busy = "0";
      button.disabled = false;
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      startCheckout(button);
    });
    console.log(
      "SeenShot pricing: buy bound id=" + (button.id || "") +
        " product=" + (button.getAttribute("data-product") || "") +
        " label=" + (button.textContent || "").trim(),
    );
  });

  // ─── Ariadne's Thread [AT-0557] ─────────────────────
  // What: Keep Member and Lifetime Buy buttons visible after /api/me
  // Why:  /pricing must show Buy even when plan is already pro so Lifetime stays purchasable
  // Date: 2026-09-05
  // Related: [AT-0551] lib/client/pricing.ts:startPricing, [AT-0283] lib/client/nav.ts:upgrade
  // ─────────────────────────────────────────────────────
  paintPlan().then(function (plan) {
    const pay = new URLSearchParams(location.search).get("pay") || "";
    console.log("SeenShot pricing: resume pay=" + pay + " plan=" + plan);
    if (plan === "pro" && pay === "member") {
      history.replaceState({}, "", "/pricing/");
      console.log("SeenShot pricing: stripped pay=member, already member");
      return;
    }
    if (pay !== "member" && pay !== "lifetime") {
      return;
    }
    const button = pay === "lifetime" ? lifetimePay : memberPay;
    if (!button) {
      console.error("SeenShot pricing: resume missing button pay=" + pay);
      return;
    }
    history.replaceState({}, "", "/pricing/");
    startCheckout(button);
  });
}
