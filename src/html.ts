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
  uploading?: boolean;
  abuseUrl: string;
  abuseEmail: string;
}): string {
  const id = escapeHtml(opts.publicId);
  const imageUrl = escapeHtml(opts.imageUrl);
  const pageUrl = escapeHtml(opts.pageUrl);
  const abuseUrl = escapeHtml(opts.abuseUrl);
  const abuseEmail = escapeHtml(opts.abuseEmail);
  if (opts.missing && opts.uploading) {
    // ─── Ariadne's Thread [AT-0052] ─────────────────────
    // What: Wait shell with native progress while Mac PUT/confirm is still in flight
    // Why:  Share opens /screenshot/{id}?uploading=1 before the public PNG exists
    // Date: 2026-08-27
    // Related: [AT-0004] src/html.ts:sharePage, [AT-0053] public/js/screenshot-upload.js
    // ─────────────────────────────────────────────────────
    console.log(
      `html: share uploading wait publicId=${opts.publicId} imageUrl=${opts.imageUrl} pageUrl=${opts.pageUrl}`,
    );
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>SeenShot</title>
  <link rel="icon" href="/SeenShot.png">
  <style>
    html, body { margin: 0; height: 100%; background: #000; color: #fff; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ui-rounded, "SF Pro Rounded", "Avenir Next", sans-serif;
    }
    img {
      display: block;
      max-width: 80%;
      max-height: 80%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
    #upload-wait {
      width: min(480px, calc(100% - 48px));
      text-align: center;
    }
    #upload-wait p { margin: 0 0 16px; }
    #upload-percent { margin: 12px 0 0; font-variant-numeric: tabular-nums; }
    progress { width: 100%; height: 8px; }
    #status { margin: 0; padding: 24px; text-align: center; opacity: 0.7; }
  </style>
</head>
<body>
  <div id="upload-wait">
    <p>Uploading…</p>
    <progress id="upload-progress" max="100" value="0"></progress>
    <p id="upload-percent">0%</p>
  </div>
  <img id="shot" alt="Screenshot" hidden>
  <p id="status" hidden></p>
  <a id="report" href="${abuseUrl}" hidden style="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);color:#666;font-size:12px;font-family:ui-rounded,'SF Pro Rounded','Avenir Next',sans-serif;text-decoration:none">Report</a>
  <script src="/js/screenshot-upload.js"></script>
  <script>
    console.log("SeenShot share: wait publicId=${id} imageUrl=${imageUrl} pageUrl=${pageUrl}");
    SeenShotScreenshotUpload.start(${JSON.stringify(opts.publicId)}, ${JSON.stringify(opts.imageUrl)}, ${JSON.stringify(opts.pageUrl)});
  </script>
</body>
</html>`;
  }
  if (opts.missing) {
    // ─── Ariadne's Thread [AT-0017] ─────────────────────
    // What: Gone share page is a black screen with no Cabinet/Sign In nav
    // Why:  Dead links should not look like the product chrome
    // Date: 2026-08-27
    // Related: [AT-0004] src/html.ts:sharePage, [AT-0006] src/index.ts:serveShare
    // ─────────────────────────────────────────────────────
    console.log(`html: share missing publicId=${opts.publicId} black gone page`);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>SeenShot</title>
  <link rel="icon" href="/SeenShot.png">
  <style>
    html, body { margin: 0; min-height: 100%; background: #000; color: #fff; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ui-rounded, "SF Pro Rounded", "Avenir Next", sans-serif;
    }
    p { margin: 0; padding: 24px; text-align: center; opacity: 0.7; }
  </style>
</head>
<body>
  <p>This screenshot is gone. The link is expired, unpublished, or was removed.</p>
</body>
</html>`;
  }
  // ─── Ariadne's Thread [AT-0019] ─────────────────────
  // What: Share screenshot is centered and uses 80% of the viewport
  // Why:  Public /screenshot/{id} is a black viewer, not the product chrome
  // Date: 2026-08-27
  // Related: [AT-0017] src/html.ts:sharePage, [AT-0006] src/index.ts:serveShare
  // ─────────────────────────────────────────────────────
  console.log(`html: share page publicId=${opts.publicId} imageUrl=${opts.imageUrl} pageUrl=${opts.pageUrl}`);
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
  <style>
    html, body { margin: 0; height: 100%; background: #000; color: #fff; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      display: block;
      max-width: 80%;
      max-height: 80%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="${imageUrl}" alt="Screenshot">
  <a href="${abuseUrl}" style="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);color:#666;font-size:12px;font-family:ui-rounded,'SF Pro Rounded','Avenir Next',sans-serif;text-decoration:none">Report</a>
  <script>
    console.log("SeenShot share: publicId=${id} imageUrl=${imageUrl} pageUrl=${pageUrl} abuse=${abuseUrl} email=${abuseEmail}");
    if (new URLSearchParams(location.search).get("uploading") === "1") {
      history.replaceState({}, "", ${JSON.stringify(opts.pageUrl)});
      console.log("SeenShot share: stripped uploading query publicId=${id}");
    }
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
      <a id="nav-auth" href="/signin">Sign In</a>
    </nav>
  </header>
  <main class="page share-page">
    <p id="status" class="meta">Loading…</p>
    <img class="share-shot" id="shot" alt="Screenshot" hidden>
    <p class="share-actions">
      <button class="download" type="button" id="copy-link">Copy link</button>
      <a class="text-link" href="/space/">Back to space</a>
    </p>
  </main>
  <script src="/js/auth.js"></script>
  <script src="/js/nav.js"></script>
  <script src="/js/shot.js"></script>
  <script>SeenShotShot.start(${JSON.stringify(shotId)});</script>
</body>
</html>`;
}
