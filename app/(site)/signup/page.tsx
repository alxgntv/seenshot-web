import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { SitePage } from "@/components/SiteChrome";

// ─── Ariadne's Thread [AT-0325] ─────────────────────
// What: Serve /signup with the same Identity Toolkit form as /signin
// Why:  Create account is /signup; do not duplicate the form
// Date: 2026-08-28
// Related: [AT-0326] public/js/signin.js:pathIsSignup
// ─────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Create account - SeenShot",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <SitePage>
      <SignInForm />
    </SitePage>
  );
}
