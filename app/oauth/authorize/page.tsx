import type { Metadata } from "next";
import { OauthAuthorizeMain } from "@/components/OauthAuthorizeMain";
import { SitePage } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Open SeenShot - SeenShot",
  robots: { index: false, follow: false },
};

export default function OauthAuthorizePage() {
  return (
    <SitePage oauth>
      <OauthAuthorizeMain />
    </SitePage>
  );
}
