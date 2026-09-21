const SITE = "https://sitescoper.com";
export const DEFAULT_OG_IMAGE = `${SITE}/og-default.jpg`;

export function pageHead(opts: {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  image?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: unknown[];
}) {
  const url = `${SITE}${opts.path}`;
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: url },
    { property: "og:type", content: opts.ogType ?? "website" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image });
    meta.push({ name: "twitter:image", content: opts.image });
  }
  if (opts.publishedTime) {
    meta.push({ property: "article:published_time", content: opts.publishedTime });
  }
  if (opts.modifiedTime) {
    meta.push({ property: "article:modified_time", content: opts.modifiedTime });
  }
  if (opts.ogType === "article") {
    meta.push({ property: "article:author", content: "Omar, founder of SiteScoper" });
  }
  meta.push(
    opts.noindex
      ? { name: "robots", content: "noindex, nofollow" }
      : { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
  );
  return {
    meta,
    links: opts.noindex ? [] : [{ rel: "canonical", href: url }],
    ...(opts.jsonLd?.length
      ? {
          scripts: opts.jsonLd.map((ld) => ({
            type: "application/ld+json",
            children: JSON.stringify(ld),
          })),
        }
      : {}),
  };
}

export function faqLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}
