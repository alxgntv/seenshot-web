import {
  landingCompareFeatures,
  type LandingCompareFeatureKey,
} from "@/content/landing-compare"

// ─── Ariadne's Thread [AT-0620] ─────────────────────
// What: Collect one landing title and slug per Compare feature row
// Why:  Each table feature must get a unique /{slug}/ page titled MacOS ScreenShot App with that row
// Date: 2026-09-05
// Related: [AT-0520] content/landing-compare.ts:landingCompareFeatures, [AT-0601] content/landings/catalog.ts:getLanding
// ─────────────────────────────────────────────────────

export type FeatureLandingSeed = {
  key: LandingCompareFeatureKey
  title: string
  slug: string
}

export type LandingIndexItem = {
  title: string
  slug: string
}

function featureLandingSlug(label: string) {
  const slugPart = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const slug = "macos-screenshot-app-with-" + slugPart
  console.log(
    "SeenShot site: featureLandingSlug labelChars=" + label.length +
      " slug=" + slug +
      " slugChars=" + slug.length
  )
  return slug
}

function featureLandingTitle(label: string) {
  const safeLabel = label.replace(/\u2013/g, "-").replace(/\u2014/g, "-")
  const title = "MacOS ScreenShot App with " + safeLabel
  console.log(
    "SeenShot site: featureLandingTitle labelChars=" + label.length +
      " title=" + title +
      " titleChars=" + title.length
  )
  return title
}

// ─── Ariadne's Thread [AT-0621] ─────────────────────
// What: Drop landings for f82, f84, f88, f89, f90
// Why:  Team admin, native performance, GPU encode, and Sparkle auto-update rows must not get unique pages
// Date: 2026-09-06
// Related: [AT-0620] content/landings/feature-landings.ts:featureLandings, [AT-0520] content/landing-compare.ts:landingCompareFeatures
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0623] ─────────────────────
// What: Drop landings for f58, f59, f91, f92, f105, f106, f93
// Why:  CLI, hosted share, crash recovery, and Platform rows must not appear on the /blog/ Landings card
// Date: 2026-09-06
// Related: [AT-0621] content/landings/feature-landings.ts:FEATURE_LANDING_SKIP_KEYS, [AT-0622] components/BlogLandings.tsx:BlogLandings
// ─────────────────────────────────────────────────────
const FEATURE_LANDING_SKIP_KEYS: LandingCompareFeatureKey[] = [
  "description",
  "price",
  "f58",
  "f59",
  "f82",
  "f84",
  "f88",
  "f89",
  "f90",
  "f91",
  "f92",
  "f105",
  "f106",
  "f93",
]

export const featureLandings: FeatureLandingSeed[] = landingCompareFeatures
  .filter(function (feature) {
    const skip = FEATURE_LANDING_SKIP_KEYS.indexOf(feature.key) !== -1
    console.log(
      "SeenShot site: featureLanding filter key=" + feature.key +
        " group=" + (feature.group || "") +
        " skip=" + skip
    )
    return !skip
  })
  .map(function (feature) {
    const title = featureLandingTitle(feature.label)
    const slug = featureLandingSlug(feature.label)
    console.log(
      "SeenShot site: featureLanding key=" + feature.key +
        " group=" + (feature.group || "") +
        " title=" + title +
        " slug=" + slug
    )
    return {
      key: feature.key,
      title: title,
      slug: slug,
    }
  })

console.log("SeenShot site: featureLandings count=" + featureLandings.length)
featureLandings.forEach(function (landing, index) {
  console.log(
    "SeenShot site: featureLandings[" + index + "]" +
      " key=" + landing.key +
      " slug=" + landing.slug +
      " title=" + landing.title
  )
})

// ─── Ariadne's Thread [AT-0622] ─────────────────────
// What: Merge D1 landings with Compare feature landings for the /blog/ list
// Why:  /blog/ must list every unique landing after the article index in one card
// Date: 2026-09-06
// Related: [AT-0621] content/landings/feature-landings.ts:featureLandings, [AT-0601] content/landings/catalog.ts:listLandings
// ─────────────────────────────────────────────────────
export function mergeLandingIndexItems(dbItems: LandingIndexItem[]) {
  const seen: Record<string, boolean> = {}
  const items: LandingIndexItem[] = []
  console.log("SeenShot site: mergeLandingIndexItems dbCount=" + dbItems.length)
  dbItems.forEach(function (item, index) {
    console.log(
      "SeenShot site: mergeLandingIndexItems db[" + index + "]" +
        " slug=" + item.slug +
        " title=" + item.title
    )
    if (!item.slug || seen[item.slug]) {
      console.warn(
        "SeenShot site: mergeLandingIndexItems skip db slug=" +
          (item.slug || "") +
          " duplicate=" + Boolean(item.slug && seen[item.slug])
      )
      return
    }
    seen[item.slug] = true
    items.push({ title: item.title, slug: item.slug })
  })
  featureLandings.forEach(function (landing, index) {
    console.log(
      "SeenShot site: mergeLandingIndexItems feature[" + index + "]" +
        " key=" + landing.key +
        " slug=" + landing.slug +
        " title=" + landing.title
    )
    if (seen[landing.slug]) {
      console.warn(
        "SeenShot site: mergeLandingIndexItems skip feature slug=" + landing.slug
      )
      return
    }
    seen[landing.slug] = true
    items.push({ title: landing.title, slug: landing.slug })
  })
  console.log("SeenShot site: mergeLandingIndexItems count=" + items.length)
  items.forEach(function (item, index) {
    console.log(
      "SeenShot site: mergeLandingIndexItems[" + index + "]" +
        " slug=" + item.slug +
        " title=" + item.title
    )
  })
  return items
}
