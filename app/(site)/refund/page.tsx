import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/refund";

export const metadata = legalMetadata(
  "Refund Policy - SeenShot",
  // ─── Ariadne's Thread [AT-0567] ─────────────────────
  // What: Point refund metadata at qa@seenshot.app
  // Why:  All site communications use that mailbox, including refunds
  // Date: 2026-09-05
  // Related: [AT-0567] content/refund.ts, [AT-0567] lib/client/legal.ts
  // ─────────────────────────────────────────────────────
  "Refunds for SeenShot Member. The MacOS app download is free. 14-day refunds via qa@seenshot.app.",
);

export default function RefundPage() {
  return <LegalPage title="Refund Policy - SeenShot" html={html} />;
}
