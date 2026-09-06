import { Fragment } from "react";
import {
  landingCompareFeatures,
  landingCompareProducts,
  type LandingCompareFeatureKey,
} from "@/content/landing-compare";
import { LedeAgents } from "./LedeAgents";

// ─── Ariadne's Thread [AT-0586] ─────────────────────
// What: Render the landing Compare matrix as a shared table
// Why:  Homepage and unique SSR landings must paint one Compare block; unique pages may filter products and rows
// Date: 2026-09-05
// Related: [AT-0521] components/LandingMain.tsx:.compare-section, [AT-0520] content/landing-compare.ts, [AT-0589] components/LandingPageMain.tsx
// ─────────────────────────────────────────────────────
export function LandingCompare({
  heading = "Landscape of MacOS tool for screenshot & Blur data",
  productIds,
  featureKeys,
}: {
  heading?: string;
  productIds?: string[];
  featureKeys?: LandingCompareFeatureKey[];
} = {}) {
  const products = productIds
    ? productIds.flatMap(function (id) {
        const product = landingCompareProducts.find(function (item) {
          return item.id === id;
        });
        if (!product) {
          console.error("SeenShot site: LandingCompare missing productId=" + id);
          return [];
        }
        console.log(
          "SeenShot site: LandingCompare product id=" + product.id +
            " name=" + product.name
        );
        return [product];
      })
    : landingCompareProducts;
  const keySet = featureKeys ? new Set(featureKeys) : null;
  const features = keySet
    ? landingCompareFeatures.filter(function (feature) {
        return keySet.has(feature.key);
      })
    : landingCompareFeatures;
  console.log(
    "SeenShot site: LandingCompare heading=" + heading +
      " products=" + products.length +
      " features=" + features.length +
      " productIds=" + (productIds ? productIds.join(",") : "all") +
      " featureKeys=" + (featureKeys ? featureKeys.join(",") : "all")
  );
  if (products.length === 0 || features.length === 0) {
    console.error(
      "SeenShot site: LandingCompare skip empty products=" + products.length +
        " features=" + features.length
    );
    return null;
  }
  return (
    <section className="compare-section" aria-labelledby="compare-heading">
      <h2 id="compare-heading">{heading}</h2>
      <div className="compare-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {products.map((product) => (
                <th key={product.id} scope="col" data-app={product.name}>
                  <a href={product.sourceHref} target="_blank" rel="noopener noreferrer">
                    {product.name}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => {
              const prevGroup = index === 0 ? null : features[index - 1].group;
              const showGroup = Boolean(feature.group && feature.group !== prevGroup);
              return (
                <Fragment key={feature.key}>
                  {showGroup ? (
                    <tr className="compare-group" data-group={feature.group || ""}>
                      <th scope="colgroup" colSpan={products.length + 1}>
                        {feature.group}
                      </th>
                    </tr>
                  ) : null}
                  <tr data-feature={feature.key}>
                    <th scope="row">{feature.label}</th>
                    {/* ─── Ariadne's Thread [AT-0541] ─────────────────────
                      What: Paint Compare f104 SeenShot with LedeAgents marks
                      Why:  Supported agents must reuse the Share bento icons, not the name list
                      Date: 2026-09-05
                      Related: [AT-0451] components/LedeAgents.tsx:LedeAgents, [AT-0488] components/LandingMain.tsx:.bento-card.narrow
                    ─────────────────────────────────────────────────────── */}
                    {products.map((product) => {
                      const value = product.cells[feature.key];
                      const showAgents = feature.key === "f104" && product.id === "seenshot";
                      const cellKind = showAgents
                        ? "agents"
                        : feature.key === "price" || feature.key === "description"
                          ? feature.key
                          : value;
                      const cellClass =
                        feature.key === "price"
                          ? "compare-price"
                          : feature.key === "description"
                            ? "compare-desc"
                            : showAgents
                              ? "compare-agents"
                              : undefined;
                      return (
                        <td
                          key={product.id}
                          data-app={product.name}
                          data-cell={cellKind}
                          className={cellClass}
                        >
                          {showAgents ? <LedeAgents /> : value}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
