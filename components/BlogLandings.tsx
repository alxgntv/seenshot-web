import type { LandingIndexItem } from "@/content/landings/feature-landings"

// ─── Ariadne's Thread [AT-0622] ─────────────────────
// What: Render the /blog/ Landings card with the same index block as Blog
// Why:  Unique landing titles must sit after the article list in a second legal card
// Date: 2026-09-06
// Related: [AT-0622] content/landings/feature-landings.ts:mergeLandingIndexItems, [AT-0580] content/blog-index.ts
// ─────────────────────────────────────────────────────
export function BlogLandings({ items }: { items: LandingIndexItem[] }) {
  console.log("SeenShot site: BlogLandings count=" + items.length)
  if (items.length === 0) {
    console.error("SeenShot site: BlogLandings empty")
  }
  return (
    <article className="legal card blog-landings">
      <div className="blog-index-head">
        <h1>Landings</h1>
        <p className="meta">
          By <a href="https://www.linkedin.com/in/ignalex/">Alex Ign</a>
        </p>
      </div>
      <ul className="blog-index">
        {items.map(function (item) {
          const href = "/" + item.slug + "/"
          console.log(
            "SeenShot site: BlogLandings item slug=" + item.slug +
              " href=" + href +
              " title=" + item.title
          )
          return (
            <li key={item.slug}>
              <a href={href}>{item.title}</a>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
