function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Ariadne's Thread [AT-0004] ─────────────────────
// What: Public shot HTML with GitHub Pages colors, OG image, copy-link
// Why:  Each public screenshot needs a shareable page on seenshot.app
// Date: 2026-08-26
// Related: [AT-0005] src/index.ts:serveShare, frontend→public/css/site.css
// ─────────────────────────────────────────────────────
export function sharePage(opts: {
  publicId: string;
  imageUrl: string;
  pageUrl: string;
  missing?: boolean;
  abuseUrl: string;
  abuseEmail: string;
}): string {
  const id = escapeHtml(opts.publicId);
  const imageUrl = escapeHtml(opts.imageUrl);
  const pageUrl = escapeHtml(opts.pageUrl);
  const abuseUrl = escapeHtml(opts.abuseUrl);
  const abuseEmail = escapeHtml(opts.abuseEmail);
  if (opts.missing) {
    console.log(`html: share missing publicId=${opts.publicId}`);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>SeenShot</title>
  <link rel="icon" href="/SeenShot.png">
  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
  <header class="topnav">
    <a class="brand" href="/"><img src="/SeenShot.png" alt="">SeenShot</a>
    <nav>
      <a href="/cabinet">Cabinet</a>
      <a href="/signin">Sign In</a>
    </nav>
  </header>
  <main class="page">
    <p class="empty">This screenshot is gone. The link is expired, unpublished, or was removed.</p>
  </main>
</body>
</html>`;
  }
  console.log(`html: share page publicId=${opts.publicId} imageUrl=${opts.imageUrl}`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta property="og:title" content="SeenShot">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${imageUrl}">
  <title>SeenShot</title>
  <link rel="icon" href="/SeenShot.png">
  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
  <header class="topnav">
    <a class="brand" href="/"><img src="/SeenShot.png" alt="">SeenShot</a>
    <nav>
      <a href="/cabinet">Cabinet</a>
      <a href="/signin">Sign In</a>
    </nav>
  </header>
  <main class="page share-page">
    <img class="share-shot" src="${imageUrl}" alt="Screenshot">
    <p class="share-actions">
      <button class="download" type="button" id="copy-link">Copy link</button>
      <a class="text-link" href="/">Get SeenShot</a>
    </p>
    <p class="meta">Report · <a href="${abuseUrl}">${id}</a> · ${abuseEmail}</p>
  </main>
  <script>
    const pageUrl = "${pageUrl}";
    const button = document.getElementById("copy-link");
    console.log("SeenShot share: publicId=${id} pageUrl=" + pageUrl);
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(pageUrl).then(function () {
        button.textContent = "Copied";
        console.log("SeenShot share: copied pageUrl=" + pageUrl);
      }).catch(function (error) {
        console.error("SeenShot share: copy failed", error);
        button.textContent = "Copy failed";
      });
    });
  </script>
</body>
</html>`;
}

// ─── Ariadne's Thread [AT-0005] ─────────────────────
// What: Owner-only shot shell; image is fetched with the Firebase cookie
// Why:  Private R2 objects must not be a public URL
// Date: 2026-08-26
// Related: [AT-0006] src/index.ts:serveOwnerShot, frontend→public/js/shot.js
// ─────────────────────────────────────────────────────
export function ownerShotPage(shotId: string): string {
  console.log(`html: owner shot page shotId=${shotId}`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>SeenShot</title>
  <link rel="icon" href="/SeenShot.png">
  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
  <header class="topnav">
    <a class="brand" href="/"><img src="/SeenShot.png" alt="">SeenShot</a>
    <nav>
      <a href="/cabinet">Cabinet</a>
      <a id="nav-auth" href="/signin">Sign In</a>
    </nav>
  </header>
  <main class="page share-page">
    <p id="status" class="meta">Loading…</p>
    <img class="share-shot" id="shot" alt="Screenshot" hidden>
    <p class="share-actions">
      <button class="download" type="button" id="copy-link">Copy link</button>
      <a class="text-link" href="/cabinet">Back to cabinet</a>
    </p>
  </main>
  <script src="/js/auth.js"></script>
  <script src="/js/nav.js"></script>
  <script src="/js/shot.js"></script>
  <script>SeenShotShot.start(${JSON.stringify(shotId)});</script>
</body>
</html>`;
}
