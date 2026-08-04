import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import AiWebsiteAuditTool from "@/pages/AiWebsiteAuditTool";

export const Route = createFileRoute("/ai-website-audit-tool")({
  head: () => pageHead({ path: "/ai-website-audit-tool", title: "AI Website Audit Tool — Free & Instant | SiteScoper", description: "The fastest AI website audit tool. Paste your URL, get a prioritized UX, SEO and conversion report in 60 seconds." }),
  component: AiWebsiteAuditTool,
});
