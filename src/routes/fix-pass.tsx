import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import FixPass from "@/pages/FixPass";

export const Route = createFileRoute("/fix-pass")({
  staticData: { sitemap: false },
  head: () =>
    pageHead({
      path: "/fix-pass",
      title: "Fix Pass — SiteScoper",
      description: "Use your Audit & Fix Pass: copy-paste code fixes, PDF export and 30 days of Site Watch.",
      noindex: true,
    }),
  component: FixPass,
});
