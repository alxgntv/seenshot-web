// ─── Ariadne's Thread [AT-0563] ─────────────────────
// What: Bind #support-chat to HTMLDialogElement.showModal
// Why:  Open chat must open the native dialog with qa@seenshot.app, not PostHog Conversations
// Date: 2026-09-05
// Related: [AT-0563] components/SupportChat.tsx, https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
// ─────────────────────────────────────────────────────

export function startSupport() {
  const button = document.getElementById("support-chat");
  const dialog = document.getElementById("support-chat-dialog");
  const mail = dialog ? dialog.querySelector("a[href^='mailto:']") : null;
  console.log(
    "SeenShot support: start path=" + location.pathname +
      " button=" + Boolean(button) +
      " dialog=" + Boolean(dialog) +
      " mail=" + (mail ? (mail.getAttribute("href") || "") : "") +
      " mailText=" + (mail ? (mail.textContent || "").trim() : "") +
      " bound=" + (button ? (button.getAttribute("data-bound") || "") : ""),
  );
  if (mail) {
    const href = mail.getAttribute("href") || "";
    const text = (mail.textContent || "").trim();
    const valid = href === "mailto:qa@seenshot.app" && text === "qa@seenshot.app";
    console.log("SeenShot support: mail valid=" + String(valid) + " href=" + href + " text=" + text);
    if (!valid) {
      console.error("SeenShot support: mailto is not qa@seenshot.app href=" + href + " text=" + text);
    }
  }
  if (!button || !(dialog instanceof HTMLDialogElement)) {
    console.error("SeenShot support: missing button or dialog");
    return;
  }
  if (button.getAttribute("data-bound") === "1") {
    console.warn("SeenShot support: start ignored, already bound");
    return;
  }
  button.setAttribute("data-bound", "1");
  const supportDialog = dialog;
  let ignoreBackdrop = false;

  function openChat() {
    ignoreBackdrop = true;
    supportDialog.showModal();
    console.log("SeenShot support: dialog open open=" + String(supportDialog.open));
    window.setTimeout(function () {
      ignoreBackdrop = false;
    }, 300);
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    openChat();
  });
  supportDialog.addEventListener("click", function (event) {
    if (ignoreBackdrop) {
      console.log("SeenShot support: backdrop click ignored after open");
      return;
    }
    if (event.target !== supportDialog) {
      return;
    }
    supportDialog.close();
    console.log("SeenShot support: dialog closed via backdrop");
  });
  supportDialog.addEventListener("close", function () {
    console.log("SeenShot support: dialog closed open=" + String(supportDialog.open));
  });
  if (mail) {
    mail.addEventListener("click", function () {
      console.log("SeenShot support: mailto click href=" + (mail.getAttribute("href") || ""));
    });
  }
  window.__seenshotSupportStarted = true;
  console.log("SeenShot support: bound id=support-chat dialog=support-chat-dialog");
}
