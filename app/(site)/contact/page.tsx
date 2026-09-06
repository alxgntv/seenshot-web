import { LegalPage, legalMetadata } from "@/components/LegalPage";
import { html } from "@/content/contact";

export const metadata = legalMetadata(
  "Contact - SeenShot",
  "Contact Codemarket OÜ for SeenShot on seenshot.app.",
);

export default function ContactPage() {
  return <LegalPage title="Contact - SeenShot" html={html} />;
}
