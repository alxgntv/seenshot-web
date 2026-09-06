import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SeenShot",
  robots: { index: false, follow: false },
};

export default function CabinetPage() {
  return <p className="meta">Loading…</p>;
}
