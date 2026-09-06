import type { Metadata } from "next";
import { RedemMain } from "@/components/RedemMain";
import { SitePage } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Redeem - SeenShot",
  robots: { index: false, follow: false },
};

export default function RedemPage() {
  return (
    <SitePage signOut>
      <RedemMain />
    </SitePage>
  );
}
