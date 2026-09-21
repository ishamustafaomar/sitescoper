import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

const categories: Array<[string, string]> = [
  ["UX", "Can a first-time visitor understand the offer, find their way around and complete the main task without friction?"],
  ["Content & copy", "Is the headline specific, is the value clear in the first screen, does every page answer the question it ranks for?"],
  ["SEO", "Titles, descriptions, canonicals, heading structure, internal links, structured data, indexability and crawl issues."],
  ["Conversion", "Calls to action, form friction, proof and trust signals, pricing clarity and the path from landing to signup or purchase."],
  ["Performance", "Load time and Core Web Vitals as measured on the crawled pages, plus the assets and scripts responsible."],
  ["Accessibility", "Contrast, keyboard access, labels, alt text and focus states, checked against WCAG 2.2 criteria."],
  ["Design & brand", "Hierarchy, consistency, typography and whether the site looks like something people would trust with money."],
];

const About = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <AppHeader />
    <main className="flex-1 w-full">
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-12 md:pt-20 md:pb-16">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground/80">About</li>
            </ol>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-4">About SiteScoper</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-balance mb-5 max-w-3xl">Website audits that tell you the truth, ranked by what to fix first</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            SiteScoper is an independent, founder-built tool. This page explains who makes it, exactly how an audit is produced and scored, and how the guides on this site are written, so you can decide how much to trust the output.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0 max-w-3xl space-y-10 text-[17px] leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">Who builds it</h2>
            <p>
              SiteScoper is built and run by Omar, an independent founder, as a one-person product. There is no agency behind it and no sales team. The audit engine, the monitoring, the free tools and most of the writing on this site come from the same person, which is why the product is opinionated: it recommends the three things worth doing this week rather than listing two hundred warnings.
            </p>
            <p className="mt-3">
              The reason it exists is simple. Every existing audit tool either produced a wall of undifferentiated checks (crawlers), measured one narrow thing extremely well (Lighthouse), or cost more per month than a small site earns. None of them answered the question a founder actually has: <em>what is wrong with my site, in order, and what do I do about it?</em>
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">How an audit is produced</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Crawl.</strong> We fetch the URL you give us and follow internal links to the pages that matter most: home, pricing, product or service pages, signup and the top content pages, up to eight pages per audit. Pages are rendered with JavaScript so single-page apps are evaluated as a visitor sees them, not as an empty shell.</li>
              <li><strong>Extract evidence.</strong> From each page we pull the rendered text, headings, metadata, structured data, links, forms, images with their dimensions and alt text, load timing and layout measurements. This evidence, not the raw HTML, is what gets analysed.</li>
              <li><strong>Analyse.</strong> Frontier language models review the evidence against a fixed rubric for each category below. The rubric is the same for every site; the model's job is to apply it to your specific pages and explain the reasoning, not to invent criteria.</li>
              <li><strong>Score and rank.</strong> Each category gets a 0–100 score. Every finding carries a severity and an estimated impact, and the report is ordered by impact so the top of the page is the to-do list. The overall score is a weighted blend that leans toward conversion and clarity, because those are what move revenue.</li>
              <li><strong>Explain the fix.</strong> Every finding includes what to change and, where possible, the exact copy, tag or CSS to change it to. Pro reports and the Audit &amp; Fix Pass generate the snippets ready to paste.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">What is scored</h2>
            <dl className="divide-y divide-border border border-border">
              {categories.map(([name, desc]) => (
                <div key={name} className="p-4 grid gap-1 sm:grid-cols-[160px_1fr]">
                  <dt className="font-heading font-semibold">{name}</dt>
                  <dd className="text-foreground/85 text-[15px]">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">What an audit cannot tell you</h2>
            <p>
              An audit looks at the site, not at your analytics, so it cannot know your actual conversion rate, which traffic sources convert, or what your customers say in support tickets. It also cannot see pages behind a login. Treat the report as an expert first pass that tells you where to look, then confirm the biggest findings against your own data before a large redesign. Where the model is uncertain it says so in the finding rather than presenting a guess as fact.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">How the guides are written</h2>
            <p>
              The guides in the <Link to="/blog" className="underline underline-offset-4 hover:text-primary">blog</Link> and on the audit pages are written to a fixed editorial brief: answer the question in the title directly, prefer specifics to adjectives, name the source for any number, and never invent statistics or studies. Some guides are drafted with AI assistance under that brief and pass automated quality checks (length, structure, source discipline, link validity) before they are published; others are written by hand. Every guide shows its publish and last-updated dates. If you find an error, use the feedback link in the app and it will be corrected.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">Pricing and data, briefly</h2>
            <p>
              The first audit is free with no account. Free accounts get a small number of audits per month. Pro is $19 per month or $180 per year and adds unlimited audits, weekly monitoring, competitor tracking, PDF export and white-label reports; a $9 one-time Audit &amp; Fix Pass covers a single site. Audit results are stored so you can return to them; pages you audit are not sold, shared or used to train models. Details are in the <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">privacy policy</Link>, and account deletion is available from the account page at any time.
            </p>
          </div>

          <div className="border border-foreground bg-card p-6 md:p-8">
            <h2 className="font-heading text-2xl font-semibold mb-2">See it on your own site</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-xl">The fastest way to judge the methodology is to run it on a site you know well and check whether the top three findings are the ones you would have picked.</p>
            <Button asChild>
              <Link to="/">Run a free audit <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </article>

        <aside className="space-y-6 text-sm">
          <div className="border border-border bg-card/40 p-5">
            <p className="font-heading font-semibold mb-3">Audit types</p>
            <ul className="space-y-2.5">
              <li><Link to="/ux-audit" className="hover:text-primary">UX audit</Link></li>
              <li><Link to="/cro-audit" className="hover:text-primary">CRO audit</Link></li>
              <li><Link to="/landing-page-audit" className="hover:text-primary">Landing page audit</Link></li>
              <li><Link to="/seo-audit-report" className="hover:text-primary">SEO audit report</Link></li>
            </ul>
          </div>
          <div className="border border-border bg-card/40 p-5">
            <p className="font-heading font-semibold mb-3">Free tools</p>
            <ul className="space-y-2.5">
              <li><Link to="/tools/open-graph-checker" className="hover:text-primary">Open Graph checker</Link></li>
              <li><Link to="/tools/llms-txt-generator" className="hover:text-primary">llms.txt generator</Link></li>
            </ul>
          </div>
          <div className="border border-border bg-card/40 p-5">
            <p className="font-heading font-semibold mb-3">Compare</p>
            <ul className="space-y-2.5">
              <li><Link to="/best-ai-website-audit-tools" className="hover:text-primary">Best AI website audit tools</Link></li>
              <li><Link to="/website-audit-statistics" className="hover:text-primary">Website audit statistics</Link></li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default About;
