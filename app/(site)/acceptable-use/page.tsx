import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/acceptable-use";

export const metadata = legalMetadata(
  "Acceptable Use Policy - SeenShot",
  "What you may not capture, upload, or publish with SeenShot Share Link.",
);

export default function AcceptableUsePage() {
  return <LegalPage title="Acceptable Use Policy - SeenShot" html={html} />;
}
