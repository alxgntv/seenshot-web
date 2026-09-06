import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/cookies";

export const metadata = legalMetadata(
  "Cookie Policy - SeenShot",
  "How seenshot.app uses cookies and browser storage. Session for sign-in. Analytics for visits and downloads.",
);

export default function CookiesPage() {
  return <LegalPage title="Cookie Policy - SeenShot" html={html} />;
}
