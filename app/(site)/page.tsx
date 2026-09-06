import { LandingMain } from "@/components/LandingMain";
import { SitePage } from "@/components/SiteChrome";

// ─── Ariadne's Thread [AT-0424] ─────────────────────
// What: Landing page at /
// Why:  Same English hero, bento, pricing, and footer as public/index.html
// Date: 2026-09-03
// Related: [AT-0014] public/index.html
// ─────────────────────────────────────────────────────

export default function HomePage() {
  // ─── Ariadne's Thread [AT-0439] ─────────────────────
  // What: Pass signOut on the landing SitePage
  // Why:  Mobile Menu must include Sign Out the same as cabinet
  // Date: 2026-09-03
  // Related: [AT-0438] components/SiteChrome.tsx:TopNav, [AT-0009] lib/client/nav.ts:paint
  // ─────────────────────────────────────────────────────
  return (
    <SitePage landing version signOut>
      <LandingMain />
    </SitePage>
  );
}
