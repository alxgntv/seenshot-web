import { commentUrl, wallOfLoveComments } from "@/content/wall-of-love";

function CommentBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
}

// ─── Ariadne's Thread [AT-0475] ─────────────────────
// What: Indie Hackers Wall of Love cards with per-comment links
// Why:  Landing must show launch feedback and open each original IH comment
// Date: 2026-09-03
// Related: [AT-0474] content/wall-of-love.ts, [AT-0476] app/site.css:.wall-of-love
// ─────────────────────────────────────────────────────
export function WallOfLove() {
  return (
    <section className="wall-of-love" aria-labelledby="wall-of-love-heading">
      <h2 id="wall-of-love-heading">Wall of Love</h2>
      <ul className="wall-of-love-grid">
        {wallOfLoveComments.map((comment) => (
          <li key={comment.id} className="wall-of-love-card">
            <a
              className="wall-of-love-link"
              href={commentUrl(comment.commentId)}
              target="_blank"
              rel="noopener noreferrer"
              data-comment-id={comment.commentId}
            >
              <span className="wall-of-love-meta">
                <img
                  className="wall-of-love-avatar"
                  src={comment.avatar}
                  alt={"Avatar for " + comment.name}
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
                <span className="wall-of-love-who">
                  <span className="wall-of-love-name">{comment.name}</span>
                  {comment.handle ? (
                    <span className="wall-of-love-handle">{comment.handle}</span>
                  ) : null}
                </span>
              </span>
              <div className="wall-of-love-body">
                <CommentBody body={comment.body} />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
