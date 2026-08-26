/* ─── Ariadne's Thread [AT-0013] ─────────────────────
   What: Render GitHub Releases on the landing page
   Why:  Same download list as the GitHub Pages microsite
   Date: 2026-08-26
   Related: docs/index.html, https://docs.github.com/en/rest/releases/releases
─────────────────────────────────────────────────────── */
(function () {
  const REPO = "alxgntv/seenshot";
  const RELEASES_URL = "https://api.github.com/repos/" + REPO + "/releases";
  const FALLBACK = "https://github.com/" + REPO + "/releases";
  const lede = document.querySelector(".lede");
  const heroTitle = document.querySelector("h1");
  console.log("SeenShot site: lede=" + (lede ? lede.textContent : "") + " chars=" + (lede ? lede.textContent.length : 0));
  console.log("SeenShot site: h1=" + (heroTitle ? heroTitle.textContent : "") + " chars=" + (heroTitle ? heroTitle.textContent.length : 0));
  const heroShot = document.querySelector(".hero-shot");
  if (heroShot) {
    console.log("SeenShot site: hero shot src=" + heroShot.getAttribute("src") + " complete=" + heroShot.complete);
    heroShot.addEventListener("load", function () {
      console.log(
        "SeenShot site: hero shot loaded natural=" + heroShot.naturalWidth + "x" + heroShot.naturalHeight +
          " display=" + heroShot.clientWidth + "x" + heroShot.clientHeight
      );
    });
    heroShot.addEventListener("error", function () {
      console.warn("SeenShot site: hero shot missing src=" + heroShot.getAttribute("src") + " hide until hero.png exists");
      heroShot.hidden = true;
    });
  }
  const bentoShots = document.querySelectorAll(".bento-shot");
  const bentoCards = document.querySelectorAll(".bento-card");
  console.log("SeenShot site: bento shots=" + bentoShots.length + " cards=" + bentoCards.length);
  bentoCards.forEach(function (card, index) {
    const title = card.querySelector("h3");
    console.log(
      "SeenShot site: bento card[" + index + "] class=" + card.className +
        " title=" + (title ? title.textContent : "") +
        " fullSplit=" + card.classList.contains("full")
    );
  });
  bentoShots.forEach(function (shot, index) {
    const src = shot.getAttribute("src") || "";
    console.log("SeenShot site: bento[" + index + "] src=" + src + " complete=" + shot.complete);
    shot.addEventListener("load", function () {
      console.log(
        "SeenShot site: bento loaded src=" + src +
          " natural=" + shot.naturalWidth + "x" + shot.naturalHeight
      );
    });
    shot.addEventListener("error", function () {
      console.warn("SeenShot site: bento missing src=" + src + " hide until file exists");
      shot.hidden = true;
    });
  });

  function downloadAsset(release) {
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const dmg = assets.find(function (asset) {
      return typeof asset.name === "string" && asset.name.indexOf(".dmg") !== -1;
    });
    if (dmg) {
      return dmg;
    }
    return assets.find(function (asset) {
      return typeof asset.name === "string" && asset.name.indexOf(".zip") !== -1;
    }) || null;
  }

  function formatDate(iso) {
    if (!iso) {
      return "";
    }
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function releaseCard(release) {
    const asset = downloadAsset(release);
    const item = document.createElement("article");
    item.className = "release";
    const tag = release.tag_name || release.name || "release";
    const date = formatDate(release.published_at);
    const badge = release.prerelease ? " · Pre-release" : "";
    const href = asset && asset.browser_download_url ? asset.browser_download_url : (release.html_url || FALLBACK);
    const label = asset ? "Download " + (asset.name || "dmg") : "Open on GitHub";
    const notes = typeof release.body === "string" ? release.body.trim() : "";
    item.innerHTML =
      '<div class="release-top"><strong>' + tag + badge + "</strong><span>" + date + "</span></div>" +
      '<a href="' + href + '">' + label + "</a>" +
      (notes ? '<p class="notes"></p>' : "");
    if (notes) {
      item.querySelector(".notes").textContent = notes;
    }
    console.log(
      "SeenShot site: release card tag=" + tag +
        " date=" + date +
        " prerelease=" + Boolean(release.prerelease) +
        " hasAsset=" + Boolean(asset) +
        " notesChars=" + notes.length
    );
    return item;
  }

  function render(releases) {
    const published = releases.filter(function (release) {
      return !release.draft;
    });
    console.log("SeenShot site: published releases=" + published.length);
    const list = document.getElementById("releases");
    const latestLink = document.getElementById("latest-download");
    const latestMeta = document.getElementById("latest-meta");
    if (published.length === 0) {
      list.innerHTML = '<p class="empty">No published releases yet. See <a href="' + FALLBACK + '">GitHub Releases</a>.</p>';
      latestMeta.textContent = "No published release yet.";
      return;
    }
    const latest = published[0];
    const previous = published.slice(1);
    const latestAsset = downloadAsset(latest);
    const version = latest.tag_name || latest.name || "latest";
    latestMeta.textContent = "stable version: " + version;
    console.log(
      "SeenShot site: stable version=" + version +
        " prerelease=" + Boolean(latest.prerelease) +
        " hasAsset=" + Boolean(latestAsset && latestAsset.browser_download_url)
    );
    if (latestAsset && latestAsset.browser_download_url) {
      latestLink.href = latestAsset.browser_download_url;
      latestLink.textContent = "Download " + version;
      console.log("SeenShot site: latest asset=" + latestAsset.browser_download_url);
    } else {
      latestLink.href = latest.html_url || FALLBACK;
      latestLink.textContent = "Open " + version;
      console.warn("SeenShot site: latest release has no dmg asset tag=" + version);
    }
    list.innerHTML = "";
    list.appendChild(releaseCard(latest));
    console.log(
      "SeenShot site: current release=" + version +
        " previousFolded=" + previous.length +
        " notesChars=" + ((latest.body && String(latest.body).trim().length) || 0)
    );
    if (previous.length === 0) {
      console.log("SeenShot site: no previous releases to fold");
      return;
    }
    const fold = document.createElement("details");
    fold.className = "previous-releases";
    const summary = document.createElement("summary");
    summary.textContent = "Previous releases";
    fold.appendChild(summary);
    previous.forEach(function (release) {
      fold.appendChild(releaseCard(release));
    });
    fold.addEventListener("toggle", function () {
      console.log(
        "SeenShot site: previous releases open=" + fold.open +
          " count=" + previous.length
      );
    });
    list.appendChild(fold);
  }

  function showError(message) {
    console.error("SeenShot site: " + message);
    document.getElementById("latest-meta").textContent = "Could not load releases.";
    document.getElementById("releases").innerHTML =
      '<p class="error">' + message + ' <a href="' + FALLBACK + '">GitHub Releases</a></p>';
  }

  fetch(RELEASES_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }).then(function (response) {
    console.log("SeenShot site: GitHub releases status=" + response.status);
    if (!response.ok) {
      throw new Error("GitHub Releases HTTP " + response.status);
    }
    return response.json();
  }).then(function (data) {
    if (!Array.isArray(data)) {
      throw new Error("GitHub Releases payload is not an array");
    }
    render(data);
  }).catch(function (error) {
    showError(error && error.message ? error.message : "GitHub Releases request failed.");
  });
})();
