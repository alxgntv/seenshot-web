import "../site.css";

// ─── Ariadne's Thread [AT-0426] ─────────────────────
// What: Import site.css on product pages only
// Why:  Share viewer must not inherit the navy landing body paint
// Date: 2026-09-03
// Related: [AT-0416] app/layout.tsx, [AT-0430] components/ClientBoot.tsx
// ─────────────────────────────────────────────────────

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
