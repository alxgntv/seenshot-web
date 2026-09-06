import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { SitePage } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Sign In - SeenShot",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <SitePage>
      <SignInForm />
    </SitePage>
  );
}
