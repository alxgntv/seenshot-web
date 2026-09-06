import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/privacy";

export const metadata = legalMetadata(
  "Privacy Policy - SeenShot",
  "How Codemarket OÜ collects, stores, and deletes SeenShot account and screenshot data under GDPR and US law.",
);

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy - SeenShot" html={html} />;
}
