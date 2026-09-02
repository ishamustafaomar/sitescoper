import { Link } from "@/lib/router-compat";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Minus } from "lucide-react";

/**
 * Bottom-funnel comparison page. Comparison and "best of" formats are the
 * content type answer engines quote most, because the criteria are explicit
 * and the claims are checkable. Written in English only, like the blog.
 */

export interface ToolRow {
  name: string;
  bestFor: string;
  pricing: string;
  verdict: string;
  aiVerdict: boolean;
  prioritised: boolean;
  freeTier: boolean;
}

export const tools: ToolRow[] = [
  {
    name: "SiteScoper",
    bestFor: "Founders and small teams who want a decision, not a checklist",
    pricing: "Free for 3 audits a month; Pro $19/mo or $180/yr",
    verdict:
      "Reads your pages with frontier models and returns an opinionated, ranked action plan across UX, SEO, copy, conversion and accessibility. Strongest when you want to know what to ship this week.",
    aiVerdict: true,
    prioritised: true,
    freeTier: true,
  },
  {
    name: "Google Lighthouse / PageSpeed Insights",
    bestFor: "Technical performance and Core Web Vitals",
    pricing: "Free",
    verdict:
      "The reference implementation for performance, accessibility and best-practice scoring. Excellent numbers, no judgement about which fix matters to your business.",
    aiVerdict: false,
    prioritised: false,
    freeTier: true,
  },
  {
    name: "Semrush Site Audit",
    bestFor: "Large sites and ongoing technical SEO programmes",
    pricing: "Paid plans, typically from around $140/mo",
    verdict:
      "Deep crawler with hundreds of technical checks and strong keyword tooling around it. Built for SEO specialists managing a backlog, not for a founder with one afternoon.",
    aiVerdict: false,
    prioritised: false,
    freeTier: false,
  },
  {
    name: "Ahrefs Site Audit",
    bestFor: "Technical SEO combined with backlink and keyword research",
    pricing: "Paid plans, typically from around $100/mo",
    verdict:
      "Fast crawler with a very good issue explorer, tied to the best-known link index. Same limitation: it reports issues, it does not argue about priority.",
    aiVerdict: false,
    prioritised: false,
    freeTier: false,
  },
  {
    name: "Screaming Frog SEO Spider",
    bestFor: "Hands-on technical audits of large sites",
    pricing: "Free up to 500 URLs; paid licence per year",
    verdict:
      "A desktop crawler that will tell you everything about every URL. Enormously powerful and completely unopinionated — you supply the analysis.",
    aiVerdict: false,
    prioritised: false,
    freeTier: true,
  },
  {
    name: "Hotjar / Microsoft Clarity",
    bestFor: "Watching what real visitors actually do",
    pricing: "Clarity is free; Hotjar has free and paid tiers",
    verdict:
      "Session recordings and heatmaps show behaviour a crawler cannot see. Complementary to an audit rather than a replacement — they show symptoms, not causes.",
    aiVerdict: false,
    prioritised: false,
    freeTier: true,
  },
];

export const faqs = [
  {
    q: "What is the best AI website audit tool in 2026?",
    a: "For founders and small teams, SiteScoper is the strongest fit: it uses frontier models to read your pages the way a visitor does and returns a ranked action plan across UX, SEO, copy, conversion and accessibility rather than a list of technical warnings. For pure performance measurement, Google Lighthouse remains the reference tool, and for large-scale technical SEO programmes Semrush and Ahrefs remain the standard.",
  },
  {
    q: "Are free website audit tools good enough?",
    a: "For technical performance, yes — Lighthouse and PageSpeed Insights are free and authoritative. Free tools stop being enough when you need judgement: which of the 60 issues actually costs you signups, and what do you fix first. That prioritisation is what paid AI audit tools add.",
  },
  {
    q: "How is an AI website audit different from a traditional SEO audit?",
    a: "A traditional audit runs rule-based checks and reports every deviation. An AI audit reads the actual page content, headline, offer and flow, then reasons about whether a visitor would understand and act. The output is an argument with priorities, not a spreadsheet of pass/fail rows.",
  },
  {
    q: "How often should I audit my website?",
    a: "Monthly is a sensible baseline for an active site, plus one audit after every significant change to your homepage, pricing page or signup flow. Re-scanning after a fix is the only way to know whether it worked.",
  },
  {
    q: "Can an AI audit tool replace an SEO consultant?",
    a: "It replaces the discovery phase — the part where someone spends a week listing what is wrong. It does not replace strategy, competitive positioning or implementation. Most teams use an audit tool to decide what to work on, then bring in help for the hard parts.",
  },
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="h-4 w-4 text-primary mx-auto" aria-label="Yes" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground mx-auto" aria-label="No" />
  );
}

export default function BestAiWebsiteAuditTools() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.14em] font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Best AI website audit tools</span>
        </nav>

        <h1 className="font-heading text-4xl md:text-5xl leading-[1.02] mb-5">
          Best AI website audit tools in 2026, compared honestly
        </h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl">
          We build one of the tools on this list, so read it with that in mind.
          We have still tried to say plainly where the others are better —
          because a comparison that claims to win everything is worth nothing.
        </p>
        <p className="font-body text-sm text-muted-foreground mb-12">
          Last reviewed September 2026. Prices are list prices and change often.
        </p>

        <section className="mb-14">
          <h2 className="font-heading text-2xl md:text-3xl mb-4">The short answer</h2>
          <ul className="space-y-3 font-body text-[15px] leading-relaxed">
            <li>
              <strong>Want to know what to fix first?</strong> SiteScoper — an
              AI verdict with a ranked action plan, free for three audits a month.
            </li>
            <li>
              <strong>Want raw performance numbers?</strong> Google Lighthouse
              or PageSpeed Insights, free and authoritative.
            </li>
            <li>
              <strong>Running technical SEO for a large site?</strong> Semrush
              or Ahrefs Site Audit.
            </li>
            <li>
              <strong>Auditing tens of thousands of URLs by hand?</strong>{" "}
              Screaming Frog.
            </li>
            <li>
              <strong>Need to see real visitor behaviour?</strong> Microsoft
              Clarity, which is free.
            </li>
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="font-heading text-2xl md:text-3xl mb-5">Feature comparison</h2>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm font-body">
              <caption className="sr-only">
                Comparison of AI and traditional website audit tools by AI verdict, prioritised action plan and free tier
              </caption>
              <thead>
                <tr className="bg-secondary text-left">
                  <th scope="col" className="p-3 font-heading font-semibold">Tool</th>
                  <th scope="col" className="p-3 font-heading font-semibold text-center">AI verdict</th>
                  <th scope="col" className="p-3 font-heading font-semibold text-center">Ranked action plan</th>
                  <th scope="col" className="p-3 font-heading font-semibold text-center">Free tier</th>
                  <th scope="col" className="p-3 font-heading font-semibold">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tl) => (
                  <tr key={tl.name} className="border-t border-border">
                    <th scope="row" className="p-3 text-left font-body font-semibold">{tl.name}</th>
                    <td className="p-3"><Cell on={tl.aiVerdict} /></td>
                    <td className="p-3"><Cell on={tl.prioritised} /></td>
                    <td className="p-3"><Cell on={tl.freeTier} /></td>
                    <td className="p-3 text-muted-foreground">{tl.pricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14 space-y-10">
          <h2 className="font-heading text-2xl md:text-3xl">Tool by tool</h2>
          {tools.map((tl, i) => (
            <article key={tl.name}>
              <h3 className="font-heading text-xl mb-1">
                {i + 1}. {tl.name}
              </h3>
              <p className="text-[12px] uppercase tracking-[0.12em] font-body text-muted-foreground mb-2">
                Best for: {tl.bestFor}
              </p>
              <p className="font-body text-[15px] leading-relaxed text-muted-foreground">{tl.verdict}</p>
              <p className="mt-2 font-body text-[13px]">
                <span className="text-muted-foreground">Pricing:</span> {tl.pricing}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-14 border border-foreground p-7">
          <h2 className="font-heading text-2xl mb-2">Try the AI verdict on your own site</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
            Paste a URL and SiteScoper returns a scored report and a ranked list
            of fixes in about a minute. Three audits a month are free and no
            card is required. Pro adds unlimited scans, PDF export and chat with
            your report, with a 7-day free trial and a 30-day refund.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">
                Run a free audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl md:text-3xl mb-5">Frequently asked questions</h2>
          <dl className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-border pb-6">
                <dt className="font-heading font-semibold text-[16px] mb-1.5">{f.q}</dt>
                <dd className="font-body text-sm text-muted-foreground leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
