import type { Metadata } from "next";
import { SitePage } from "@/components/SiteChrome";

export function LegalPage({ html }: { title?: string; description?: string; html: string }) {
  return (
    <SitePage>
      <main className="legal-page">
        <article className="legal card" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </SitePage>
  );
}

export function legalMetadata(title: string, description: string): Metadata {
  return { title, description };
}
