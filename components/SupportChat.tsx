const SUPPORT_MAIL = "qa@seenshot.app";

// ─── Ariadne's Thread [AT-0563] ─────────────────────
// What: Replace PostHog Conversations with a native dialog showing qa@seenshot.app
// Why:  The round Open chat control must stay; support mail is not the PostHog widget
// Date: 2026-09-05
// Related: [AT-0563] lib/client/posthog.ts:disable_conversations, [AT-0563] lib/client/support.ts:startSupport
// ─────────────────────────────────────────────────────
export function SupportChat() {
  return (
    <>
      <button type="button" id="support-chat" className="support-chat" aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.6 15.71 3.64 17.18L2.5 21.5L7.04 20.42C8.46 21.28 10.17 21.75 12 21.75C17.52 21.75 22 17.27 22 11.75C22 6.23 17.52 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <dialog id="support-chat-dialog" className="support-chat-dialog" aria-labelledby="support-chat-title">
        <h2 id="support-chat-title">Support</h2>
        <p>Email</p>
        <a href={"mailto:" + SUPPORT_MAIL}>{SUPPORT_MAIL}</a>
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </dialog>
    </>
  );
}
