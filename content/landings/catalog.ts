import {
  landingCompareFeatures,
  landingCompareProducts,
  type LandingCompareFeatureKey,
} from "@/content/landing-compare";
import type { Landing, LandingFeature } from "@/content/landings/types";
import type { LandingFaqItem } from "@/content/landing-faq";
import { SITE_ORIGIN } from "@/content/site-jsonld";
import { getEnv } from "@/lib/env";

// ─── Ariadne's Thread [AT-0601] ─────────────────────
// What: Load unique SSR landings from the D1 landings table
// Why:  A new landings row must render /{slug}/ without adding a TypeScript catalog file
// Date: 2026-09-05
// Related: [AT-0600] backend→migrations/0002_landings.sql, [AT-0590] app/(site)/[slug]/page.tsx, [AT-0582] content/landings/types.ts:Landing
// ─────────────────────────────────────────────────────

export const LANDING_RESERVED_SLUGS = [
  "acceptable-use",
  "api",
  "blog",
  "cabinet",
  "contact",
  "cookies",
  "copyright",
  "download",
  "health",
  "oauth",
  "pricing",
  "privacy",
  "public",
  "refund",
  "releases",
  "s",
  "screenshot",
  "shot",
  "signin",
  "signup",
  "space",
  "terms",
  "upload-progress",
] as const;

const LANDING_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type LandingRow = {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_url: string;
  og_type: string;
  og_site_name: string;
  og_locale: string;
  og_image_url: string;
  og_image_width: number;
  og_image_height: number;
  og_image_alt: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image_url: string;
  hero_h1: string;
  hero_description: string;
  hero_cta_label: string | null;
  hero_media_kind: string;
  hero_media_src: string;
  hero_media_poster: string | null;
  hero_media_width: number;
  hero_media_height: number;
  hero_media_alt: string;
  features_json: string;
  compare_heading: string | null;
  compare_product_ids_json: string | null;
  compare_feature_keys_json: string | null;
  pricing_heading: string | null;
  pricing_checkout: number;
  faq_json: string;
  show_download: number;
  show_founder: number;
  show_wall_of_love: number;
  created_at: number;
  updated_at: number;
};

export function landingCanonical(slug: string) {
  const url = SITE_ORIGIN + "/" + slug + "/";
  console.log("SeenShot site: landingCanonical slug=" + slug + " url=" + url);
  return url;
}

function isReservedSlug(slug: string) {
  return (LANDING_RESERVED_SLUGS as readonly string[]).indexOf(slug) !== -1;
}

function parseJsonField<T>(raw: string | null, fallback: T, label: string, slug: string): T {
  if (raw == null || raw === "") {
    console.log(
      "SeenShot site: parseJsonField slug=" + slug +
        " label=" + label +
        " empty=true"
    );
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw) as T;
    console.log(
      "SeenShot site: parseJsonField slug=" + slug +
        " label=" + label +
        " chars=" + raw.length
    );
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "SeenShot site: parseJsonField slug=" + slug +
        " label=" + label +
        " error=" + message
    );
    return fallback;
  }
}

function rowToLanding(row: LandingRow): Landing | undefined {
  console.log(
    "SeenShot site: rowToLanding slug=" + row.slug +
      " title=" + row.title +
      " h1=" + row.hero_h1 +
      " canonical=" + row.canonical
  );
  if (!LANDING_SLUG_RE.test(row.slug)) {
    console.error("SeenShot site: rowToLanding invalid slug=" + row.slug);
    return undefined;
  }
  if (isReservedSlug(row.slug)) {
    console.error("SeenShot site: rowToLanding reserved slug=" + row.slug);
    return undefined;
  }
  const expectedCanonical = landingCanonical(row.slug);
  if (row.canonical !== expectedCanonical) {
    console.error(
      "SeenShot site: rowToLanding canonical mismatch slug=" + row.slug +
        " canonical=" + row.canonical +
        " expected=" + expectedCanonical
    );
    return undefined;
  }
  const features = parseJsonField<LandingFeature[]>(row.features_json, [], "features_json", row.slug);
  const faq = parseJsonField<LandingFaqItem[]>(row.faq_json, [], "faq_json", row.slug);
  const productIds = parseJsonField<string[] | null>(
    row.compare_product_ids_json,
    null,
    "compare_product_ids_json",
    row.slug
  );
  const featureKeys = parseJsonField<LandingCompareFeatureKey[] | null>(
    row.compare_feature_keys_json,
    null,
    "compare_feature_keys_json",
    row.slug
  );
  const knownProductIds = new Set(
    landingCompareProducts.map(function (product) {
      return product.id;
    })
  );
  const knownFeatureKeys = new Set(
    landingCompareFeatures.map(function (feature) {
      return feature.key;
    })
  );
  if (productIds) {
    const unknownProduct = productIds.find(function (id) {
      return !knownProductIds.has(id);
    });
    if (unknownProduct) {
      console.error(
        "SeenShot site: rowToLanding unknown compare productId=" + unknownProduct +
          " slug=" + row.slug
      );
      return undefined;
    }
  }
  if (featureKeys) {
    const unknownFeature = featureKeys.find(function (key) {
      return !knownFeatureKeys.has(key);
    });
    if (unknownFeature) {
      console.error(
        "SeenShot site: rowToLanding unknown compare featureKey=" + unknownFeature +
          " slug=" + row.slug
      );
      return undefined;
    }
  }
  const ogType = row.og_type === "website" ? "website" : null;
  const twitterCard = row.twitter_card === "summary_large_image" ? "summary_large_image" : null;
  const mediaKind = row.hero_media_kind === "video" || row.hero_media_kind === "image" ? row.hero_media_kind : null;
  if (!ogType || !twitterCard || !mediaKind) {
    console.error(
      "SeenShot site: rowToLanding enum mismatch slug=" + row.slug +
        " og_type=" + row.og_type +
        " twitter_card=" + row.twitter_card +
        " hero_media_kind=" + row.hero_media_kind
    );
    return undefined;
  }
  console.log("SeenShot site: rowToLanding omit keywords slug=" + row.slug);
  const landing: Landing = {
    slug: row.slug,
    seo: {
      title: row.title,
      description: row.description,
      canonical: row.canonical,
      robots: row.robots,
    },
    og: {
      title: row.og_title,
      description: row.og_description,
      url: row.og_url,
      type: ogType,
      siteName: row.og_site_name,
      locale: row.og_locale,
      images: [
        {
          url: row.og_image_url,
          width: row.og_image_width,
          height: row.og_image_height,
          alt: row.og_image_alt,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: row.twitter_title,
      description: row.twitter_description,
      images: [row.twitter_image_url],
    },
    hero: {
      h1: row.hero_h1,
      description: row.hero_description,
      ctaLabel: row.hero_cta_label || undefined,
      media: {
        kind: mediaKind,
        src: row.hero_media_src,
        poster: row.hero_media_poster || undefined,
        width: row.hero_media_width,
        height: row.hero_media_height,
        alt: row.hero_media_alt,
      },
    },
    features: features,
    faq: faq,
    showDownload: row.show_download === 1,
    showFounder: row.show_founder === 1,
    showWallOfLove: row.show_wall_of_love === 1,
  };
  if (row.compare_heading) {
    landing.compare = {
      heading: row.compare_heading,
      productIds: productIds || undefined,
      featureKeys: featureKeys || undefined,
    };
  }
  if (row.pricing_heading) {
    landing.pricing = {
      heading: row.pricing_heading,
      checkout: row.pricing_checkout === 1,
    };
  }
  console.log(
    "SeenShot site: rowToLanding ok slug=" + landing.slug +
      " features=" + landing.features.length +
      " faq=" + landing.faq.length +
      " hasCompare=" + Boolean(landing.compare) +
      " hasPricing=" + Boolean(landing.pricing) +
      " showDownload=" + Boolean(landing.showDownload)
  );
  return landing;
}

export async function listLandings() {
  const env = getEnv();
  console.log("SeenShot site: listLandings");
  try {
    const result = await env.DB.prepare(
      "SELECT * FROM landings ORDER BY slug ASC"
    ).all<LandingRow>();
    console.log(
      "SeenShot site: listLandings success=" + Boolean(result.success) +
        " rows=" + (result.results ? result.results.length : 0)
    );
    const landings: Landing[] = [];
    (result.results || []).forEach(function (row) {
      const landing = rowToLanding(row);
      if (landing) {
        landings.push(landing);
      }
    });
    console.log("SeenShot site: listLandings parsed=" + landings.length);
    return landings;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("SeenShot site: listLandings error=" + message);
    return [];
  }
}

export async function landingSlugs() {
  const landings = await listLandings();
  const slugs = landings.map(function (landing) {
    return landing.slug;
  });
  console.log("SeenShot site: landingSlugs count=" + slugs.length);
  slugs.forEach(function (slug, index) {
    console.log("SeenShot site: landingSlugs[" + index + "] slug=" + slug);
  });
  return slugs;
}

export async function getLanding(slug: string) {
  console.log("SeenShot site: getLanding slug=" + slug);
  if (!LANDING_SLUG_RE.test(slug)) {
    console.error("SeenShot site: getLanding invalid slug=" + slug);
    return undefined;
  }
  if (isReservedSlug(slug)) {
    console.error("SeenShot site: getLanding reserved slug=" + slug);
    return undefined;
  }
  const env = getEnv();
  try {
    const row = await env.DB.prepare("SELECT * FROM landings WHERE slug = ?")
      .bind(slug)
      .first<LandingRow>();
    console.log("SeenShot site: getLanding slug=" + slug + " found=" + Boolean(row));
    if (!row) {
      console.error("SeenShot site: getLanding missing slug=" + slug);
      return undefined;
    }
    return rowToLanding(row);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("SeenShot site: getLanding slug=" + slug + " error=" + message);
    return undefined;
  }
}
