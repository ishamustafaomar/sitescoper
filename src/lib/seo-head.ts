const SITE = "https://sitescoper.com";

export function pageHead(opts: {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  image?: string;
  noindex?: boolean;
  publishedTime?: string;
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
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return {
    meta,
    links: opts.noindex ? [] : [{ rel: "canonical", href: url }],
  };
}
