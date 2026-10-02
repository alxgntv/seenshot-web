// ─── Ariadne's Thread [AT-0565] ─────────────────────
// What: Store landing FAQ questions and answers
// Why:  Homepage must answer the selected product questions after Pricing
// Date: 2026-09-05
// Related: [AT-0565] components/LandingFaq.tsx, [AT-0562] components/LandingMain.tsx:#pricing
// ─────────────────────────────────────────────────────

export type LandingFaqItem = {
  id: string;
  question: string;
  paragraphs: string[];
  link?: {
    id: string;
    href: string;
    text: string;
  };
};

export const landingFaqItems: LandingFaqItem[] = [
  // ─── Ariadne's Thread [AT-0720] ─────────────────────
  // What: Drop the Is it free FAQ item
  // Why:  SeenShot has no Free plan. FAQ must not say personal use is free
  // Date: 2026-10-02
  // Related: [AT-0565] content/landing-faq.ts:landingFaqItems, [AT-0566] content/landing-faq.ts:landingFaqJsonLd
  // ─────────────────────────────────────────────────────
  {
    id: "faq-platforms",
    question: "What platforms does it run on?",
    paragraphs: [
      "SeenShot runs on Mac, Apple Silicon (arm64) and Intel (x86). Windows is in development.",
    ],
  },
  {
    id: "faq-app-store",
    question: "Can I download the app without the App Store?",
    paragraphs: [
      "Yes. Download the app and install it on your computer. You do not need the App Store. There are no extra limits.",
    ],
  },
  {
    id: "faq-start",
    question: "What do I need to start taking screenshots?",
    paragraphs: [
      "Install the app, press cmd+shift+2, and save the region you want to capture.",
    ],
  },
  {
    id: "faq-tools",
    question: "What tools does the app have besides screenshots?",
    paragraphs: [
      "Besides screenshots, you can highlight a zone, highlight numbered steps, add text and lines, change colors, change text size, and add a Background so you can turn shots into presentations.",
      "One click inserts a screenshot into 10+ AI agents. You can also publish any screenshot and share a link with friends. Sharing is fast and safe.",
    ],
  },
  {
    id: "faq-performance",
    question: "How about performance?",
    paragraphs: [
      "Performance is as high as it gets. The app is under 40 MB, installs quickly, and does not use extra resources on your computer.",
    ],
  },
  {
    id: "faq-auto-blur",
    question: "Does it blur sensitive data?",
    paragraphs: [
      "Yes. Auto Blur can blur sensitive data on capture. It blurs faces, passwords, emails, and API keys so you can share shots with AI agents without leaking secrets.",
      "After you install the app, turn on Auto Blur. That is all.",
    ],
  },
  {
    id: "faq-corporate",
    question: "Is there a corporate licence?",
    paragraphs: [
      "Yes. There is a corporate licence. Contact the creators to get one. There are no seat limits.",
    ],
    link: {
      id: "faq-corporate-contact",
      href: "https://www.linkedin.com/in/ignalex/",
      text: "Contact Me",
    },
  },
  {
    id: "faq-offline",
    question: "Do I need API keys or a cloud to blur data?",
    paragraphs: [
      "No. Blur and recognition run on your computer. You can turn the internet off and it still works. SeenShot is a fully offline, standalone app for capture, blur, and annotation. Internet is only needed when you upload a screenshot to share a link.",
    ],
  },
]

// ─── Ariadne's Thread [AT-0566] ─────────────────────
// What: Build schema.org FAQPage JSON-LD from the landing FAQ items
// Why:  The FAQ block must expose Question name and acceptedAnswer text as JSON-LD
// Date: 2026-09-05
// Related: [AT-0565] content/landing-faq.ts, https://schema.org/FAQPage, https://schema.org/Question, https://schema.org/Answer, https://nextjs.org/docs/app/guides/json-ld
// ─────────────────────────────────────────────────────
export function landingFaqAnswerText(item: LandingFaqItem) {
  const text = item.paragraphs.join(" ") + (item.link ? " " + item.link.text : "");
  console.log(
    "SeenShot site: landingFaqAnswerText id=" + item.id +
      " chars=" + text.length +
      " hasLink=" + Boolean(item.link)
  );
  return text;
}

// ─── Ariadne's Thread [AT-0584] ─────────────────────
// What: Build FAQPage JSON-LD from any FAQ list and page URL
// Why:  Unique SSR landings must emit the same Question/Answer markup as the homepage FAQ, with per-page urls
// Date: 2026-09-05
// Related: [AT-0566] content/landing-faq.ts:landingFaqJsonLd, [AT-0585] components/LandingFaq.tsx, https://schema.org/FAQPage
// ─────────────────────────────────────────────────────
export function landingFaqJsonLd(
  items: LandingFaqItem[] = landingFaqItems,
  pageUrl: string = "https://seenshot.app/",
) {
  const base = pageUrl.endsWith("/") ? pageUrl.slice(0, -1) : pageUrl;
  console.log(
    "SeenShot site: landingFaqJsonLd items=" + items.length +
      " pageUrl=" + pageUrl +
      " base=" + base
  );
  const mainEntity = items.map(function (item) {
    const text = landingFaqAnswerText(item);
    const url = base + "/#" + item.id;
    console.log(
      "SeenShot site: landingFaqJsonLd question=" + item.question +
        " url=" + url +
        " answerChars=" + text.length
    );
    return {
      "@type": "Question",
      name: item.question,
      url: url,
      acceptedAnswer: {
        "@type": "Answer",
        text: text,
      },
    };
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": base + "/#faq",
    name: "FAQ",
    mainEntity: mainEntity,
  };
  console.log(
    "SeenShot site: landingFaqJsonLd type=" + jsonLd["@type"] +
      " context=" + jsonLd["@context"] +
      " id=" + jsonLd["@id"] +
      " questions=" + jsonLd.mainEntity.length
  );
  return jsonLd;
}
