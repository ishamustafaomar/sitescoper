// Ready-to-paste code for common audit findings. Deterministic pattern matching,
// no AI call: it only returns a snippet when the finding clearly maps to one.
import type { AnalysisSuggestion } from "@/lib/api";

export interface FixSnippet {
  lang: "html" | "json" | "text";
  code: string;
}

const esc = (s: string) => s.replace(/"/g, "&quot;").replace(/</g, "&lt;").slice(0, 160);

export function snippetFor(s: AnalysisSuggestion): FixSnippet | null {
  const text = `${s.title} ${s.description ?? ""} ${s.fix ?? ""}`.toLowerCase();
  const after = s.rewrite?.after?.trim();

  if (/meta description/.test(text)) {
    return { lang: "html", code: `<meta name="description" content="${esc(after || "One clear sentence (120–160 characters) saying what you do and for whom.")}" />` };
  }
  if (/open ?graph|og:|social (share|preview)|twitter card/.test(text)) {
    return {
      lang: "html",
      code: `<meta property="og:title" content="Your page title" />
<meta property="og:description" content="One-sentence summary of the page." />
<meta property="og:image" content="https://yoursite.com/og-image.jpg" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />`,
    };
  }
  if (/\btitle tag\b|page title|<title>/.test(text)) {
    return { lang: "html", code: `<title>${esc(after || "Primary keyword – what you offer | Brand")}</title>` };
  }
  if (/canonical/.test(text)) {
    return { lang: "html", code: `<link rel="canonical" href="https://yoursite.com/this-page" />` };
  }
  if (/viewport/.test(text)) {
    return { lang: "html", code: `<meta name="viewport" content="width=device-width, initial-scale=1" />` };
  }
  if (/\balt\b|alt text|alternative text/.test(text)) {
    return { lang: "html", code: `<img src="/hero.jpg" alt="Describe what the image shows and why it matters" width="1200" height="630" />` };
  }
  if (/lazy|offscreen images|image (size|weight|optimi)/.test(text)) {
    return { lang: "html", code: `<img src="/photo.webp" alt="…" loading="lazy" decoding="async" width="800" height="600" />` };
  }
  if (/structured data|schema|json-ld|rich result/.test(text)) {
    return {
      lang: "html",
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png"
}
</script>`,
    };
  }
  if (/\bh1\b|main heading|headline/.test(text) && after) {
    return { lang: "html", code: `<h1>${esc(after)}</h1>` };
  }
  if (/\bcta\b|call to action|button/.test(text) && after) {
    return { lang: "html", code: `<a href="/signup" class="button">${esc(after)}</a>` };
  }
  return null;
}
