import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/copyright";

export const metadata = legalMetadata(
  "Copyright and Takedown - SeenShot",
  // ─── Ariadne's Thread [AT-0567] ─────────────────────
  // What: Point copyright metadata notices at qa@seenshot.app
  // Why:  All site communications use that mailbox, including takedown
  // Date: 2026-09-05
  // Related: [AT-0567] content/copyright.ts, [AT-0567] lib/client/legal.ts
  // ─────────────────────────────────────────────────────
  "How to report copyright infringement on SeenShot public Share Links. Notices go to qa@seenshot.app.",
);

export default function CopyrightPage() {
  return <LegalPage title="Copyright and Takedown - SeenShot" html={html} />;
}
