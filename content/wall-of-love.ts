// ─── Ariadne's Thread [AT-0474] ─────────────────────
// What: Indie Hackers launch comments for the landing Wall of Love
// Why:  Each testimonial must keep its original comment URL and avatar
// Date: 2026-09-03
// Related: [AT-0475] components/WallOfLove.tsx, https://www.indiehackers.com/post/free-fast-screenshot-app-for-macos-with-one-click-screenshot-sharing-4IZm96CxpggxQLou4fYK
// ─────────────────────────────────────────────────────

export const IH_POST_SLUG =
  "free-fast-screenshot-app-for-macos-with-one-click-screenshot-sharing-4IZm96CxpggxQLou4fYK";

export const IH_POST_BASE = "https://www.indiehackers.com/post/" + IH_POST_SLUG;

export type WallOfLoveComment = {
  id: string;
  name: string;
  handle?: string;
  avatar: string;
  body: string;
  commentId: string;
};

export function commentUrl(commentId: string): string {
  return IH_POST_BASE + "?commentId=" + encodeURIComponent(commentId);
}

// ─── Ariadne's Thread [AT-0478] ─────────────────────
// What: Drop Squint and romg_dev from Wall of Love
// Why:  Those two IH cards must not render on the landing
// Date: 2026-09-03
// Related: [AT-0474] content/wall-of-love.ts, [AT-0477] lib/client/releases.ts:wallCards
// ─────────────────────────────────────────────────────

export const wallOfLoveComments: WallOfLoveComment[] = [
  {
    id: "ibrolord",
    name: "ibrolord",
    handle: "@ibrolord",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/W7U3yAXtGsRjdkMpGrOetJK0D8J3",
    commentId: "7pY3QEDF7FGrVSM0sSBk",
    body:
      "The workflow is strong, but one-click sharing changes the trust question: screenshots can contain secrets or customer data. Before using it for AI feedback, I would need to know where the image is uploaded, whether the link is guessable, and when it is deleted. Make expiry part of the share flow—one hour, one day, or never—and keep a one-click redact tool beside annotation. That is part of the product promise, not footer privacy copy.",
  },
  {
    id: "waqas",
    name: "Waqas Ahmad",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/PsVNMN20nGZAyiu569yni2lZ0F73",
    commentId: "3ug2OF2Ije8ar13dZbTa",
    body: "finally someone did the much needed app. unfortunately i am no longer using mac !",
  },
  {
    id: "yaronyang",
    name: "yaronyang",
    handle: "@yaronyang",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/zd188cxOhMfg1KQ909bQtwiKwom1",
    commentId: "NCcsYvTlMWMCnzL6JopQ",
    body:
      "The native Mac screenshot dance is exactly the pain. One-click share is the whole product; if that first share takes more than one click the rest of the page does not matter.\n\nThe AI-agent feedback use case is interesting. If I were you I would put that in the first line of the page, not the second. Most screenshot apps look the same until you say who it is for.",
  },
  {
    id: "julian",
    name: "Julian Neagu",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/MBVxyqAUfxPjkV0E4mMgcEpRvYH2",
    commentId: "aSP4XnW9xnwf7pU7MpIs",
    body:
      "The biggest win is cutting the screenshot flow down to a few seconds. That kind of tiny workflow improvement adds up fast when you use it all day.",
  },
  {
    id: "ulup",
    name: "UluP Studio - Manu",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/F0415wMwgOVnxQdlsVKAZ59P20G3",
    commentId: "D2D4wXmyU7yL2MZuQNHv",
    body:
      "Congrats on the build! The use case for giving precise visual feedback to AI agents is super smart and highly relevant right now. They definitely perform better with annotated images. Are you planning to add any features specifically tailored for AI workflows, like auto-extracting text from the selection?",
  },
  {
    id: "flo",
    name: "Flo",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/00DTXKp3bJROdZG2VCRZ4qMmIyA3",
    commentId: "BkEJVNUvchuu5VyvwkFf",
    body:
      "Solving your own friction is the best reason to build!\n\nWhile established tools like CleanShot X already have a strong foothold in basic screenshot sharing, your AI agent integration is the real standout feature. If you pivot the positioning to focus specifically on \"instant visual context for AI prompts,\" you'll hit a unique, timely angle that really sets you apart.",
  },
  {
    id: "mariyaha",
    name: "mariyaha",
    handle: "@mariyaha",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/k5rgzHxEuIdh7zzl6IqWjofZBMX2",
    commentId: "HO6mvSOwqFEzGVEtkZBe",
    body: "The main advantage is the built-in editor—did I understand that correctly?",
  },
  {
    id: "hrmackenzie",
    name: "hrmackenzie",
    handle: "@hrmackenzie",
    avatar: "https://storage.googleapis.com/indie-hackers.appspot.com/avatars/nCqDy7KIGLUcIQiWs7SJRHsJrJ02",
    commentId: "V7oP3UY8Pi5hixpro3ol",
    body:
      "Taking screenshots and annotating in one step would be a big help to anyone who use AI for their products UI/UX. A friend of mine is building his first project and Claude has been eating up tokens as he gets it to fix his UI. I told him its because he's giving it his code and a link so those are burning thru his tokens and its way better to just give it a screenshot - I'm surprised a lot people don't know this. SeenShot would be perfect for him - unfortunately he's a Windows user.",
  },
];
