import type { Landing } from "@/content/landings/types";

// ─── Ariadne's Thread [AT-0568] ─────────────────────
// What: Build schema.org Person, Organization, Blog, BlogPosting, and SoftwareApplication JSON-LD
// Why:  The personal blog and the macOS app presentation must share one nested @graph
// Date: 2026-09-05
// Related: [AT-0569] components/JsonLdScript.tsx, [AT-0566] content/landing-faq.ts:landingFaqJsonLd, https://schema.org/Blog, https://schema.org/BlogPosting, https://schema.org/SoftwareApplication, https://developers.google.com/search/docs/appearance/structured-data/article, https://developers.google.com/search/docs/appearance/structured-data/software-app, https://nextjs.org/docs/app/guides/json-ld
// ─────────────────────────────────────────────────────

export const SITE_ORIGIN = "https://seenshot.app";
export const PERSON_NAME = "Alex Ign";
export const PERSON_HANDLE = "@aleksey_ignatov";
export const PERSON_URL = "https://www.linkedin.com/in/ignalex/";
export const PERSON_IMAGE = SITE_ORIGIN + "/alex-ign.png";
// ─── Ariadne's Thread [AT-0738] ─────────────────────
// What: Set PERSON_DESCRIPTION to Hey this is Alex, and this is SeenShot
// Why:  Person JSON-LD must match the landing founder body, including Ai Agents workflow
// Date: 2026-10-02
// Related: [AT-0738] components/LandingMain.tsx:.founder-copy, [AT-0568] content/site-jsonld.ts:PERSON_DESCRIPTION
// ─────────────────────────────────────────────────────
export const PERSON_DESCRIPTION =
  "Hey this is Alex, and this is SeenShot. This app speed up and protect your workflow with Ai Agents. It helps send annotated screenshots to your agents in one click. Also it help protect sensitive data at your screenshots phones, emails, passwords, API keys."
export const ORGANIZATION_NAME = "Codemarket OÜ";
export const APP_NAME = "SeenShot";
export const APP_DESCRIPTION =
  "Hit cmd+shift+2, annotate, insert in to your agent. Free screenshot app for macOS.";
export const APP_FEATURE_LIST =
  "Show area for agent, Auto Blur Sensitive data, One-click Share, Add your selfie at screen shot, Show steps, Background, Path Screen Shot, Full Screen Shot, Highlight zone, Highlight steps, Arrow, Line, Text, Share via link, Save screenshot locally";

export const jsonLdIds = {
  person: SITE_ORIGIN + "/#person",
  organization: SITE_ORIGIN + "/#organization",
  software: SITE_ORIGIN + "/#software",
  website: SITE_ORIGIN + "/#website",
  webpage: SITE_ORIGIN + "/#webpage",
  blog: SITE_ORIGIN + "/blog/#blog",
  blogPage: SITE_ORIGIN + "/blog/#webpage",
  faq: SITE_ORIGIN + "/#faq",
};

export type BlogPostJsonLdInput = {
  slug: string;
  headline: string;
  path: string;
  datePublished: string;
  indexDescription: string;
  articleDescription: string;
  image?: string;
};

export const blogPostCatalog: BlogPostJsonLdInput[] = [
  {
    slug: "screenshot-visual-privacy-apps-complete-feature-landscape",
    headline: "Screenshot apps landscape at 2026",
    path: "/blog/screenshot-visual-privacy-apps-complete-feature-landscape/",
    datePublished: "2026-09-04",
    indexDescription:
      "I mapped 14,010 feature mentions across screenshot apps and visual-privacy tools, collapsed them into 102 shippable features, and scored BlurData against that map.",
    articleDescription:
      "I mapped macOS screenshot and visual-privacy apps, kept 96 shippable features, and scored BlurData against that map.",
  },
  {
    slug: "best-screenshot-apps-2026",
    headline: "Best ScreenShot Apps 2026",
    path: "/blog/best-screenshot-apps-2026/",
    datePublished: "2026-08-28",
    indexDescription:
      "The best screenshot workflow in 2026 is not just about grabbing a rectangle on your screen. It is about capturing the right context, marking it up clearly, saving it safely, and sharing it with the right person in seconds. This guide compares practical screen capture tools for Windows, Mac, Linux, browser-based work, documentation, product demos, support, marketing, and developer workflows.",
    articleDescription:
      "The best screenshot workflow in 2026 is not just about grabbing a rectangle on your screen. It is about capturing the right context, marking it up clearly, saving it safely, and sharing it with the right person in seconds. This guide compares practical screen capture tools for Windows, Mac, Linux, browser-based work, documentation, product demos, support, marketing, and developer workflows.",
    image: SITE_ORIGIN + "/blog/best-screenshot-apps-2026/seenshot.png",
  },
];

type JsonLdNode = {
  "@type": string;
  "@id": string;
  [key: string]: unknown;
};

function idRef(id: string) {
  return { "@id": id };
}

export function personJsonLd(): JsonLdNode {
  console.log(
    "SeenShot site: personJsonLd id=" + jsonLdIds.person +
      " name=" + PERSON_NAME +
      " url=" + PERSON_URL +
      " image=" + PERSON_IMAGE +
      " handle=" + PERSON_HANDLE
  );
  return {
    "@type": "Person",
    "@id": jsonLdIds.person,
    name: PERSON_NAME,
    alternateName: PERSON_HANDLE,
    url: PERSON_URL,
    image: PERSON_IMAGE,
    sameAs: [PERSON_URL],
    description: PERSON_DESCRIPTION,
    worksFor: idRef(jsonLdIds.organization),
  };
}

export function organizationJsonLd(): JsonLdNode {
  console.log(
    "SeenShot site: organizationJsonLd id=" + jsonLdIds.organization +
      " name=" + ORGANIZATION_NAME +
      " url=" + SITE_ORIGIN + "/contact/"
  );
  return {
    "@type": "Organization",
    "@id": jsonLdIds.organization,
    name: ORGANIZATION_NAME,
    legalName: ORGANIZATION_NAME,
    url: SITE_ORIGIN + "/contact/",
    email: "qa@seenshot.app",
    vatID: "EE102376140",
    identifier: {
      "@type": "PropertyValue",
      name: "Registry code",
      value: "16234616",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sepapaja tn 6",
      addressLocality: "Tallinn",
      addressRegion: "Harju county",
      postalCode: "15551",
      addressCountry: "EE",
    },
  };
}

export function softwareApplicationJsonLd(): JsonLdNode {
  const downloadUrl = SITE_ORIGIN + "/download/arm64";
  console.log(
    "SeenShot site: softwareApplicationJsonLd id=" + jsonLdIds.software +
      " name=" + APP_NAME +
      " os=macOS" +
      " category=UtilitiesApplication" +
      " price=0" +
      " downloadUrl=" + downloadUrl +
      " features=" + APP_FEATURE_LIST
  );
  return {
    "@type": "SoftwareApplication",
    "@id": jsonLdIds.software,
    name: APP_NAME,
    alternateName: "SeenShot.app",
    url: SITE_ORIGIN + "/",
    image: SITE_ORIGIN + "/og.jpg",
    screenshot: [SITE_ORIGIN + "/og.jpg", SITE_ORIGIN + "/hero.jpg"],
    description: APP_DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "macOS",
    downloadUrl: downloadUrl,
    installUrl: SITE_ORIGIN + "/",
    featureList: APP_FEATURE_LIST,
    softwareHelp: idRef(jsonLdIds.faq),
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
    author: idRef(jsonLdIds.person),
    creator: idRef(jsonLdIds.person),
    publisher: idRef(jsonLdIds.organization),
  };
}

export function websiteJsonLd(): JsonLdNode {
  console.log("SeenShot site: websiteJsonLd id=" + jsonLdIds.website + " url=" + SITE_ORIGIN + "/");
  return {
    "@type": "WebSite",
    "@id": jsonLdIds.website,
    url: SITE_ORIGIN + "/",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    inLanguage: "en",
    publisher: idRef(jsonLdIds.organization),
    author: idRef(jsonLdIds.person),
    about: idRef(jsonLdIds.software),
    hasPart: [idRef(jsonLdIds.blog)],
  };
}

export function blogJsonLd(includePosts: boolean): JsonLdNode {
  const posts = includePosts
    ? blogPostCatalog.map(function (post) {
        return blogPostingJsonLd(post, "index");
      })
    : blogPostCatalog.map(function (post) {
        return idRef(SITE_ORIGIN + post.path + "#blogposting");
      });
  console.log(
    "SeenShot site: blogJsonLd id=" + jsonLdIds.blog +
      " includePosts=" + String(includePosts) +
      " posts=" + blogPostCatalog.length
  );
  return {
    "@type": "Blog",
    "@id": jsonLdIds.blog,
    url: SITE_ORIGIN + "/blog/",
    name: "Blog",
    description: "SeenShot blog: screenshot app guides and product notes.",
    inLanguage: "en",
    author: idRef(jsonLdIds.person),
    publisher: idRef(jsonLdIds.person),
    sourceOrganization: idRef(jsonLdIds.organization),
    about: idRef(jsonLdIds.software),
    blogPost: posts,
  };
}

export function blogPostingJsonLd(post: BlogPostJsonLdInput, surface: "index" | "article"): JsonLdNode {
  const url = SITE_ORIGIN + post.path;
  const description = surface === "index" ? post.indexDescription : post.articleDescription;
  console.log(
    "SeenShot site: blogPostingJsonLd slug=" + post.slug +
      " surface=" + surface +
      " headline=" + post.headline +
      " datePublished=" + post.datePublished +
      " url=" + url +
      " hasImage=" + Boolean(post.image) +
      " descriptionChars=" + description.length
  );
  const node: JsonLdNode = {
    "@type": "BlogPosting",
    "@id": url + "#blogposting",
    url: url,
    mainEntityOfPage: idRef(url + "#webpage"),
    headline: post.headline,
    name: post.headline,
    description: description,
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    inLanguage: "en",
    author: [
      {
        "@type": "Person",
        "@id": jsonLdIds.person,
        name: PERSON_NAME,
        url: PERSON_URL,
        sameAs: [PERSON_URL],
      },
    ],
    publisher: idRef(jsonLdIds.person),
    isPartOf: idRef(jsonLdIds.blog),
    about: idRef(jsonLdIds.software),
  };
  if (post.image) {
    node.image = post.image;
  }
  return node;
}

export function findBlogPost(slug: string) {
  const post = blogPostCatalog.find(function (item) {
    return item.slug === slug;
  });
  console.log("SeenShot site: findBlogPost slug=" + slug + " found=" + Boolean(post));
  if (!post) {
    console.error("SeenShot site: findBlogPost missing slug=" + slug);
  }
  return post;
}

function jsonLdGraph(nodes: JsonLdNode[]) {
  console.log("SeenShot site: jsonLdGraph nodes=" + nodes.length);
  nodes.forEach(function (node, index) {
    console.log(
      "SeenShot site: jsonLdGraph[" + index + "] type=" + node["@type"] +
        " id=" + node["@id"]
    );
  });
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function landingAppJsonLd() {
  console.log("SeenShot site: landingAppJsonLd origin=" + SITE_ORIGIN);
  return jsonLdGraph([
    personJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd(),
    websiteJsonLd(),
    {
      "@type": "WebPage",
      "@id": jsonLdIds.webpage,
      url: SITE_ORIGIN + "/",
      name: "SeenShot — Seen it? Shot it! Send It",
      description: APP_DESCRIPTION,
      inLanguage: "en",
      isPartOf: idRef(jsonLdIds.website),
      about: idRef(jsonLdIds.software),
      mainEntity: idRef(jsonLdIds.software),
      author: idRef(jsonLdIds.person),
      publisher: idRef(jsonLdIds.organization),
    },
    {
      "@type": "Blog",
      "@id": jsonLdIds.blog,
      url: SITE_ORIGIN + "/blog/",
      name: "Blog",
      author: idRef(jsonLdIds.person),
    },
  ]);
}

export function blogIndexJsonLd() {
  console.log("SeenShot site: blogIndexJsonLd posts=" + blogPostCatalog.length);
  return jsonLdGraph([
    personJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd(),
    websiteJsonLd(),
    blogJsonLd(true),
    {
      "@type": "CollectionPage",
      "@id": jsonLdIds.blogPage,
      url: SITE_ORIGIN + "/blog/",
      name: "Blog - SeenShot",
      description: "SeenShot blog: screenshot app guides and product notes.",
      inLanguage: "en",
      isPartOf: idRef(jsonLdIds.website),
      mainEntity: idRef(jsonLdIds.blog),
      author: idRef(jsonLdIds.person),
      publisher: idRef(jsonLdIds.person),
      about: idRef(jsonLdIds.software),
    },
  ]);
}

// ─── Ariadne's Thread [AT-0588] ─────────────────────
// What: Build WebPage JSON-LD for a unique SSR landing
// Why:  Each /{slug}/ page must reuse Person, Organization, SoftwareApplication, and Website with a per-slug WebPage
// Date: 2026-09-05
// Related: [AT-0568] content/site-jsonld.ts:landingAppJsonLd, [AT-0582] content/landings/types.ts:Landing, [AT-0589] components/LandingPageMain.tsx
// ─────────────────────────────────────────────────────
export function landingPageJsonLd(landing: Landing) {
  const url = landing.seo.canonical;
  console.log(
    "SeenShot site: landingPageJsonLd slug=" + landing.slug +
      " url=" + url +
      " title=" + landing.seo.title +
      " faq=" + landing.faq.length
  );
  return jsonLdGraph([
    personJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd(),
    websiteJsonLd(),
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url: url,
      name: landing.seo.title,
      description: landing.seo.description,
      inLanguage: "en",
      isPartOf: idRef(jsonLdIds.website),
      about: idRef(jsonLdIds.software),
      mainEntity: idRef(jsonLdIds.software),
      author: idRef(jsonLdIds.person),
      publisher: idRef(jsonLdIds.organization),
    },
  ]);
}

export function blogArticleJsonLd(slug: string) {
  const post = findBlogPost(slug);
  if (!post) {
    return jsonLdGraph([personJsonLd()]);
  }
  const url = SITE_ORIGIN + post.path;
  console.log("SeenShot site: blogArticleJsonLd slug=" + slug + " url=" + url);
  return jsonLdGraph([
    personJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd(),
    websiteJsonLd(),
    blogJsonLd(false),
    blogPostingJsonLd(post, "article"),
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url: url,
      name: post.headline,
      description: post.articleDescription,
      inLanguage: "en",
      isPartOf: idRef(jsonLdIds.blog),
      mainEntity: idRef(url + "#blogposting"),
      author: idRef(jsonLdIds.person),
      publisher: idRef(jsonLdIds.person),
      about: idRef(jsonLdIds.software),
    },
  ]);
}
