import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd } from "@/lib/seo-head";
import en from "@/i18n/locales/en.json";
import Pricing from "@/pages/Pricing";

const pricingFaqs = [1, 2, 3, 4, 5].map((n) => ({
  q: (en.pricing as Record<string, string>)[`faq${n}q`],
  a: (en.pricing as Record<string, string>)[`faq${n}a`],
}));

export const Route = createFileRoute("/pricing")({
  head: () =>
    pageHead({
      path: "/pricing",
      title: "Pricing — Free Website Audits, Pro from $15/mo | SiteScoper",
      description:
        "Three full AI website audits a month, free and no card. Pro is $19/month or $180/year with a 7-day free trial and a 30-day money-back guarantee.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": "https://sitescoper.com/#software",
          name: "SiteScoper",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: "https://sitescoper.com",
          description:
            "AI website audit tool that scores UX, SEO, copy, conversion and accessibility and returns a prioritised action plan.",
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
              description: "Three full website audits per month, no credit card required.",
              url: "https://sitescoper.com/pricing",
            },
            {
              "@type": "Offer",
              name: "Pro monthly",
              price: "19",
              priceCurrency: "USD",
              description: "Unlimited audits, AI chat, PDF export and competitor compare. 7-day free trial.",
              url: "https://sitescoper.com/pricing",
            },
            {
              "@type": "Offer",
              name: "Pro annual",
              price: "180",
              priceCurrency: "USD",
              description: "Pro billed yearly — two months free versus monthly billing.",
              url: "https://sitescoper.com/pricing",
            },
          ],
        },
        faqLd(pricingFaqs),
      ],
    }),
  component: Pricing,
});
