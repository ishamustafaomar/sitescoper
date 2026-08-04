import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Blog from "@/pages/Blog";

export const Route = createFileRoute("/blog/")({
  head: () => pageHead({ path: "/blog", title: "Blog — SiteScoper", description: "Practical guides on SEO, conversion, performance, and AI-powered website audits." }),
  component: Blog,
});
