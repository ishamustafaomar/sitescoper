import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, BarChart3, Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Sparkles, title: "AI-powered analysis", body: "Large language models read your pages the way a human reviewer would — surfacing copy, clarity, and conversion issues no rules-based scanner catches." },
  { icon: Zap, title: "Instant website audit", body: "Paste a URL and get a full report in under a minute. No crawler setup, no waiting queue, no Chrome extension." },
  { icon: BarChart3, title: "Technical SEO included", body: "Meta tags, headings, schema, Core Web Vitals, broken links and sitemap checks — bundled into every scan." },
  { icon: Shield, title: "Built for founders & small business", body: "Plain-English findings prioritised by impact. No SEO jargon, no 80-page PDF, no agency upsell." },
];

const comparison = [
  { feature: "AI-written findings in plain English", us: true, them: false },
  { feature: "Instant single-page audit", us: true, them: true },
  { feature: "No account required to preview", us: true, them: false },
  { feature: "Conversion + copy review", us: true, them: false },
  { feature: "Technical SEO checks", us: true, them: true },
  { feature: "Starts free", us: true, them: true },
];

const faqs = [
  { q: "What is an AI website audit tool?", a: "An AI website audit tool uses large language models alongside traditional crawlers to evaluate a website's SEO, performance, accessibility, and content quality. Unlike rule-based scanners, AI tools like SiteScoper can read your copy in context, spot unclear value propositions, and recommend specific rewrites." },
  { q: "Is the audit really instant?", a: "Yes. SiteScoper scrapes the page, runs technical checks, and generates an AI report in roughly 30–60 seconds. There is no crawl queue and no waiting for a scheduled report." },
  { q: "Do I need to install anything?", a: "No. SiteScoper runs entirely in the browser. Paste a URL, get a report. There is no Chrome extension, no JavaScript snippet, and no DNS verification." },
  { q: "How is this different from Semrush, Ahrefs, or SEOptimer?", a: "Those tools are excellent rules-based scanners aimed at SEO professionals. SiteScoper is designed for founders, indie hackers, and small-business owners who want a clear, prioritised list of fixes — not a 200-row spreadsheet." },
  { q: "Is there a free website audit?", a: "Yes. Every new account gets a free audit so you can see the full report before upgrading." },
];

const AiWebsiteAuditTool = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Website Audit Tool — Instant SEO & UX Report | SiteScoper</title>
        <meta name="description" content="SiteScoper is an AI website audit tool that delivers an instant SEO, content, and UX report. Free to start — built for founders and small business." />
        <link rel="canonical" href="https://sitescoper.com/ai-website-audit-tool" />
        <meta property="og:title" content="AI Website Audit Tool — SiteScoper" />
        <meta property="og:description" content="Instant AI-powered website audit. SEO, content, and UX in one report." />
        <meta property="og:url" content="https://sitescoper.com/ai-website-audit-tool" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI website audit tool
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
            The instant AI website audit, built for founders
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Paste your URL and SiteScoper returns a plain-English audit of your SEO, copy, conversion, and technical health — in under a minute, no spreadsheet required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">Run a free audit</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </motion.section>

        <section className="mt-20 grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <Icon className="w-6 h-6 text-primary mb-3" />
              <h2 className="text-lg font-heading font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </Card>
          ))}
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">How the AI site audit works</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">Three steps. No crawler config, no waiting queue.</p>
          <ol className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Paste your URL", b: "Drop any public URL into SiteScoper. We render the page, fetch metadata, and collect Core Web Vitals." },
              { n: "2", t: "AI reads your page", b: "Our model evaluates your copy, headings, CTAs, schema, and links — flagging what is unclear, missing, or broken." },
              { n: "3", t: "Get a prioritised report", b: "Findings come ranked by impact, with a suggested fix you can ship today. Export, share, or iterate." },
            ].map((s) => (
              <li key={s.n} className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-heading font-bold text-primary mb-2">{s.n}</div>
                <h3 className="font-heading font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">SiteScoper vs. traditional website checkers</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Classic audit tools were built for SEO agencies. SiteScoper is built for the person who has to actually ship the fixes.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-heading font-semibold">Feature</th>
                  <th className="p-4 font-heading font-semibold">SiteScoper</th>
                  <th className="p-4 font-heading font-semibold text-muted-foreground">Typical checker</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-t">
                    <td className="p-4">{row.feature}</td>
                    <td className="p-4 text-center">{row.us && <Check className="w-4 h-4 text-primary inline" />}</td>
                    <td className="p-4 text-center">{row.them && <Check className="w-4 h-4 text-muted-foreground inline" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-lg border bg-card p-5 group">
                <summary className="cursor-pointer font-heading font-semibold list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 text-center rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent p-10">
          <h2 className="text-3xl font-heading font-bold mb-3">Audit your site in 60 seconds</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Free to try, no credit card. See what SiteScoper's AI flags on your homepage before your next launch.
          </p>
          <Button asChild size="lg">
            <Link to="/">Run a free audit</Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default AiWebsiteAuditTool;