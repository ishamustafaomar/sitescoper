import { Link } from "@/lib/router-compat";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Citable statistics reference page.
 *
 * Built as a GEO/AEO asset: every number carries a named source, a year and
 * a link, which is the format LLM answer engines quote from. Content is
 * English-only by design (same convention as the blog) because it targets
 * English-language reference queries.
 */

export interface Stat {
  stat: string;
  source: string;
  year: string;
  url: string;
}

export interface StatSection {
  id: string;
  title: string;
  intro: string;
  stats: Stat[];
}

export const statSections: StatSection[] = [
  {
    id: "page-speed",
    title: "Page speed and Core Web Vitals",
    intro:
      "Speed is the single most measurable thing on a website, and the one with the clearest link to revenue.",
    stats: [
      {
        stat: "53% of mobile site visits are abandoned if a page takes longer than three seconds to load.",
        source: "Google / DoubleClick",
        year: "2016",
        url: "https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/",
      },
      {
        stat: "Ecommerce conversion rate falls from roughly 3.05% at a one-second load time to 0.67% at four seconds.",
        source: "Portent",
        year: "2022",
        url: "https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm",
      },
      {
        stat: "Pages loading in one second convert about three times better than pages loading in five seconds, across an analysis of roughly 27,000 landing pages.",
        source: "Portent",
        year: "2022",
        url: "https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm",
      },
      {
        stat: "The Chrome UX Report publishes real-user Core Web Vitals data covering more than 18 million origins in a single monthly dataset.",
        source: "Google Chrome UX Report",
        year: "2024",
        url: "https://developer.chrome.com/docs/crux",
      },
      {
        stat: "The Web Almanac analyses Core Web Vitals pass rates each year across millions of real-world pages crawled by HTTP Archive.",
        source: "HTTP Archive Web Almanac",
        year: "2024",
        url: "https://almanac.httparchive.org/en/2024/performance",
      },
    ],
  },
  {
    id: "mobile",
    title: "Mobile experience",
    intro:
      "Most audits are run on a desktop. Most visitors are not on one. That gap is where a lot of lost revenue hides.",
    stats: [
      {
        stat: "The average mobile landing page took around 22 seconds to fully load in Google's industry benchmark study — far longer than visitors will wait.",
        source: "Google (Think with Google)",
        year: "2017",
        url: "https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/",
      },
      {
        stat: "Mobile and tablet internet usage overtook desktop worldwide in October 2016, the shift that pushed Google to make mobile-friendliness a ranking signal.",
        source: "Google Mobile Site Speed Playbook",
        year: "2016",
        url: "https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/",
      },
    ],
  },
  {
    id: "seo",
    title: "SEO and organic traffic",
    intro: "Ranking is not the goal. Getting clicked is the goal, and the two have drifted apart.",
    stats: [
      {
        stat: "96.98% of all search clicks happen within the top 10 organic results, based on a study of around 5,000 keywords.",
        source: "Ahrefs",
        year: "2024",
        url: "https://ahrefs.com/blog/almost-all-clicks-happen-in-the-top-10-results/",
      },
      {
        stat: "The Web Almanac's SEO chapter analyses technical SEO factors — robots.txt, canonicals, structured data and rendering — across millions of crawled pages.",
        source: "HTTP Archive Web Almanac",
        year: "2024",
        url: "https://almanac.httparchive.org/en/2024/seo",
      },
      {
        stat: "A large and growing share of Google searches end without a click to any external website.",
        source: "Ahrefs",
        year: "2025",
        url: "https://ahrefs.com/blog/zero-click-search/",
      },
    ],
  },
  {
    id: "conversion",
    title: "Conversion and checkout",
    intro:
      "Checkout research is the most replicated body of UX evidence there is. Almost none of it is new, and almost nobody applies it.",
    stats: [
      {
        stat: "The global average online shopping cart abandonment rate is 70.19%, from a longitudinal study of 487 websites.",
        source: "Baymard Institute",
        year: "2024",
        url: "https://baymard.com/lists/cart-abandonment-rate",
      },
      {
        stat: "Complicated checkout flows and forced account creation are among the most common reasons shoppers abandon a cart.",
        source: "Baymard Institute",
        year: "2024",
        url: "https://baymard.com/research/checkout-usability",
      },
      {
        stat: "Baymard's checkout usability findings are grounded in more than 150,000 cumulative hours of user testing.",
        source: "Baymard Institute",
        year: "2024",
        url: "https://baymard.com/research/checkout-usability",
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    intro:
      "Accessibility failures are the easiest audit findings to fix and the most consistently ignored.",
    stats: [
      {
        stat: "WebAIM's evaluation of the top one million home pages found detectable WCAG failures increased 13.6% year over year.",
        source: "WebAIM Million",
        year: "2024",
        url: "https://webaim.org/projects/million/",
      },
      {
        stat: "WebAIM scans the top one million home pages with the WAVE stand-alone API, supplemented by site technology and sector data.",
        source: "WebAIM Million",
        year: "2024",
        url: "https://webaim.org/projects/million/",
      },
      {
        stat: "The Web Almanac dedicates a full annual chapter to accessibility analysis across its crawled dataset.",
        source: "HTTP Archive Web Almanac",
        year: "2024",
        url: "https://almanac.httparchive.org/en/2024/accessibility",
      },
    ],
  },
  {
    id: "ai-search",
    title: "AI search and AI Overviews",
    intro:
      "The audit question has changed. It is no longer only 'can Google crawl this' but 'can an answer engine quote this'.",
    stats: [
      {
        stat: "Google AI Overviews were associated with a 34.5% lower average click-through rate for top-ranking pages compared with similar keywords without an AI Overview.",
        source: "Ahrefs",
        year: "2025",
        url: "https://ahrefs.com/blog/ai-overviews-reduce-clicks/",
      },
      {
        stat: "Google has continued to expand AI Overviews into new regions and languages since introducing them in Search.",
        source: "TechCrunch, reporting Google statements",
        year: "2025",
        url: "https://techcrunch.com/2025/04/25/googles-ai-search-numbers-are-growing-and-thats-by-design/",
      },
      {
        stat: "The Web Almanac's performance analysis now examines how page speed intersects with visibility in AI-driven search surfaces.",
        source: "HTTP Archive Web Almanac",
        year: "2025",
        url: "https://almanac.httparchive.org/en/2025/performance",
      },
    ],
  },
];

export default function WebsiteAuditStatistics() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.14em] font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Website audit statistics</span>
        </nav>

        <h1 className="font-heading text-4xl md:text-5xl leading-[1.02] mb-5">
          Website audit statistics: 21 numbers worth quoting
        </h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-3">
          Every statistic below comes from a named research organisation with a
          public source you can check. No aggregator round-ups, no numbers
          invented by a marketing team, no unattributed percentages.
        </p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-10">
          Use them freely. If you cite this page, a link back is appreciated.
          Last reviewed September 2026.
        </p>

        <nav aria-label="Contents" className="border border-border p-5 mb-14">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-[0.14em] text-muted-foreground mb-3">
            Contents
          </h2>
          <ul className="space-y-1.5 text-sm font-body">
            {statSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="underline underline-offset-4 hover:text-primary">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {statSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-2xl md:text-3xl mb-2">{section.title}</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {section.intro}
              </p>
              <ol className="space-y-6">
                {section.stats.map((s) => (
                  <li key={s.stat} className="border-l-2 border-primary/40 pl-4">
                    <p className="font-body text-[15px] leading-relaxed">{s.stat}</p>
                    <p className="mt-1.5 text-[12px] font-body text-muted-foreground">
                      Source:{" "}
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        {s.source}
                      </a>
                      , {s.year}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="mt-16 border border-foreground p-7">
          <h2 className="font-heading text-2xl mb-2">See these numbers on your own site</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
            SiteScoper reads your pages the way a visitor and a crawler both
            would, then tells you the three things worth fixing this week —
            speed, SEO, copy, conversion and accessibility in one report. Three
            full audits a month are free, no card needed.
          </p>
          <Button asChild>
            <Link to="/">
              Run a free audit <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl mb-4">Related reading</h2>
          <ul className="space-y-2 text-sm font-body">
            <li>
              <Link to="/blog/how-to-audit-a-website-for-seo" className="underline underline-offset-4 hover:text-primary">
                How to audit a website for SEO, step by step
              </Link>
            </li>
            <li>
              <Link to="/blog/core-web-vitals-explained-for-founders" className="underline underline-offset-4 hover:text-primary">
                Core Web Vitals explained for founders
              </Link>
            </li>
            <li>
              <Link to="/best-ai-website-audit-tools" className="underline underline-offset-4 hover:text-primary">
                Best AI website audit tools compared
              </Link>
            </li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
