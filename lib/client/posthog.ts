// @ts-nocheck
/* ─── Ariadne's Thread [AT-0422] ─────────────────────
   What: Port public/js client scripts into ESM modules for App Router
   Why:  Keep Identity Toolkit, cabinet, share, and nav behavior 1:1 without a parallel vanilla stack
   Date: 2026-09-03
   Related: [AT-0008] public/js/auth.js
─────────────────────────────────────────────────────── */
/* ─── Ariadne's Thread [AT-0346] ─────────────────────
   What: Init PostHog JS snippet and capture program download clicks
   Why:  Count how many times SeenShot for MacOS is downloaded from seenshot.app
   Date: 2026-08-28
   Related: [AT-0346] public/index.html, https://posthog.com/docs/libraries/js, https://posthog.com/docs/libraries/js/usage
─────────────────────────────────────────────────────── */

let started = false;
export function startPosthog() {
  if (started) {
    console.warn("SeenShot startPosthog: start ignored, already started");
    return;
  }
  started = true;

    const TOKEN = "phc_orEfVUeVTrftdq6GbAQJPnRqw23bRHCHWcmJTaQY2Ftc";
    const API_HOST = "https://us.i.posthog.com";
    const DEFAULTS = "2026-05-30";

    if (window.__seenshotPosthogStarted) {
      console.warn(
        "SeenShot posthog: init skipped already started path=" + location.pathname +
          " host=" + location.host
      );
      return;
    }
    window.__seenshotPosthogStarted = true;

    console.log(
      "SeenShot posthog: snippet start path=" + location.pathname +
        " host=" + location.host +
        " apiHost=" + API_HOST +
        " defaults=" + DEFAULTS +
        " tokenChars=" + TOKEN.length
    );

    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    // ─── Ariadne's Thread [AT-0367] ─────────────────────
    // What: Count Free pricing Download the same as hero
    // Why:  Member and Lifetime Buy must not count as a program download
    // Date: 2026-09-05
    // Related: [AT-0346] public/js/posthog.js:programDownloadLink, [AT-0618] components/PricingCards.tsx:#pricing-pay-member
    // ─────────────────────────────────────────────────────
    // ─── Ariadne's Thread [AT-0518] ─────────────────────
    // What: Count /download/arm64 and /download/x86_64 clicks as program download
    // Why:  CTA href left GitHub; PostHog must still capture the same download event
    // Date: 2026-09-05
    // Related: [AT-0517] components/DownloadPill.tsx, [AT-0346] lib/client/posthog.ts:programDownloadLink
    // ─────────────────────────────────────────────────────
    function programDownloadLink(node) {
      if (!node || typeof node.closest !== "function") {
        return null;
      }
      const link = node.closest("a");
      if (!link) {
        return null;
      }
      if (
        link.id === "latest-download" ||
        link.id === "pricing-download"
      ) {
        return link;
      }
      const href = link.getAttribute("href") || "";
      if (
        href.indexOf("/download/arm64") !== -1 ||
        href.indexOf("/download/x86_64") !== -1 ||
        href.indexOf("/releases/download/") !== -1
      ) {
        return link;
      }
      return null;
    }

    function captureDownload(link) {
      const href = link.href || "";
      const id = link.id || "";
      const text = (link.textContent || "").trim();
      console.log(
        "SeenShot posthog: capture download href=" + href +
          " id=" + id +
          " text=" + text +
          " path=" + location.pathname +
          " hasPosthog=" + Boolean(window.posthog) +
          " hasCapture=" + Boolean(window.posthog && typeof window.posthog.capture === "function")
      );
      if (!window.posthog || typeof window.posthog.capture !== "function") {
        console.error("SeenShot posthog: capture skipped, posthog.capture missing href=" + href);
        return;
      }
      window.posthog.capture(
        "download",
        {
          href: href,
          id: id,
          text: text,
          path: location.pathname
        },
        { transport: "sendBeacon", send_instantly: true }
      );
      console.log("SeenShot posthog: capture queued event=download href=" + href);
    }

    document.addEventListener(
      "click",
      function (event) {
        const link = programDownloadLink(event.target);
        if (!link) {
          return;
        }
        console.log(
          "SeenShot posthog: download click id=" + (link.id || "") +
            " href=" + (link.href || "") +
            " defaultPrevented=" + event.defaultPrevented +
            " button=" + event.button
        );
        if (event.defaultPrevented) {
          console.log("SeenShot posthog: download capture skipped, click opened Create account");
          return;
        }
        captureDownload(link);
      },
      true
    );

    let conversationsHidden = false;
    function hideConversations() {
      if (!conversationsHidden) {
        const ph = window.posthog;
        if (ph && ph.conversations && typeof ph.conversations.hide === "function") {
          ph.conversations.hide();
          conversationsHidden = true;
          console.log("SeenShot posthog: conversations.hide");
        }
      }
      const widget = document.getElementById("ph-conversations-widget-container");
      if (!widget) {
        return false;
      }
      widget.remove();
      console.log("SeenShot posthog: conversations widget removed");
      return true;
    }

    // ─── Ariadne's Thread [AT-0563] ─────────────────────
    // What: Disable PostHog Conversations and strip #ph-conversations-widget-container
    // Why:  Support is the native #support-chat dialog, not the PostHog chat product
    // Date: 2026-09-05
    // Related: [AT-0563] components/SupportChat.tsx, [AT-0346] lib/client/posthog.ts:startPosthog
    // ─────────────────────────────────────────────────────
    posthog.init(TOKEN, {
      api_host: API_HOST,
      defaults: DEFAULTS,
      disable_conversations: true,
      loaded: function (ph) {
        const distinctId = ph && typeof ph.get_distinct_id === "function" ? ph.get_distinct_id() : "";
        console.log(
          "SeenShot posthog: loaded distinctIdChars=" + String(distinctId).length +
            " path=" + location.pathname +
            " apiHost=" + API_HOST +
            " defaults=" + DEFAULTS +
            " disable_conversations=true"
        );
        hideConversations();
      }
    });
    const conversationsObserver = new MutationObserver(function () {
      if (hideConversations()) {
        conversationsObserver.disconnect();
        console.log("SeenShot posthog: conversations observer disconnect");
      }
    });
    conversationsObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () {
      conversationsObserver.disconnect();
      hideConversations();
      console.log("SeenShot posthog: conversations observer timeout");
    }, 15000);
    console.log("SeenShot posthog: init called tokenChars=" + TOKEN.length + " apiHost=" + API_HOST);

}
