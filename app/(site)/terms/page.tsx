import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/terms";

export const metadata = legalMetadata(
  "Terms of Service - SeenShot",
  "Terms of Service for SeenShot for MacOS and seenshot.app, operated by Codemarket OÜ.",
);

export default function TermsPage() {
  return <LegalPage title="Terms of Service - SeenShot" html={html} />;
}
