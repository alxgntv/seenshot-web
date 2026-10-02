import type { Metadata } from "next";
import { SitePage } from "@/components/SiteChrome";
import { SpaceMain } from "@/components/SpaceMain";

export const metadata: Metadata = {
  title: "My Screenshots - SeenShot",
  robots: { index: false, follow: false },
};

export default function SpacePage() {
  return (
    <SitePage signOut cabinet>
      <SpaceMain />
    </SitePage>
  );
}
