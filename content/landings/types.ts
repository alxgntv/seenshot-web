import type { LandingCompareFeatureKey } from "@/content/landing-compare";
import type { LandingFaqItem } from "@/content/landing-faq";

// ─── Ariadne's Thread [AT-0582] ─────────────────────
// What: Define the Landing record for unique SSR pages
// Why:  Each unique landing must carry SEO, Open Graph, Twitter, hero, features, compare, pricing, and FAQ in one typed table
// Date: 2026-09-05
// Related: [AT-0583] content/landings/catalog.ts, [AT-0565] content/landing-faq.ts:LandingFaqItem, [AT-0520] content/landing-compare.ts:LandingCompareFeatureKey
// ─────────────────────────────────────────────────────

export type LandingMedia = {
  kind: "image" | "video";
  src: string;
  poster?: string;
  width: number;
  height: number;
  alt: string;
};

export type LandingOgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

// ─── Ariadne's Thread [AT-0607] ─────────────────────
// What: Remove keywords from the landing SEO record
// Why:  The HTML keywords meta tag is obsolete and must not be stored or emitted
// Date: 2026-09-05
// Related: [AT-0605] backend→migrations/0005_drop_landings_keywords.sql, [AT-0606] app/(site)/[slug]/page.tsx:generateMetadata
// ─────────────────────────────────────────────────────
export type LandingSeo = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
};

export type LandingOg = {
  title: string;
  description: string;
  url: string;
  type: "website";
  siteName: string;
  locale: string;
  images: LandingOgImage[];
};

export type LandingTwitter = {
  card: "summary_large_image";
  title: string;
  description: string;
  images: string[];
};

export type LandingHero = {
  h1: string;
  description: string;
  ctaLabel?: string;
  media: LandingMedia;
};

export type LandingFeature = {
  title: string;
  description: string;
  layout: "full" | "wide" | "narrow";
  media: LandingMedia;
};

export type LandingCompareBlock = {
  heading: string;
  productIds?: string[];
  featureKeys?: LandingCompareFeatureKey[];
};

export type LandingPricingBlock = {
  heading: string;
  checkout?: boolean;
};

export type Landing = {
  slug: string;
  seo: LandingSeo;
  og: LandingOg;
  twitter: LandingTwitter;
  hero: LandingHero;
  features: LandingFeature[];
  faq: LandingFaqItem[];
  compare?: LandingCompareBlock;
  pricing?: LandingPricingBlock;
  showDownload?: boolean;
  showFounder?: boolean;
  showWallOfLove?: boolean;
};
