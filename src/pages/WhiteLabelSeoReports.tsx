import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FileText, Palette, Users, Download, Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

const features = [
  { icon: Palette, title: "Your brand, not ours", body: "Export client-ready PDF audits with your agency's logo, colors, and contact details. No SiteScoper watermark." },
  { icon: FileText, title: "Plain-English findings", body: "AI rewrites every issue into language your clients understand — no jargon, no 80-page spreadsheet dump." },
  { icon: Users, title: "Built for agencies & freelancers", body: "Run unlimited audits across client domains. Perfect for retainers, sales pitches, and onboarding deliverables." },
  { icon: Download, title: "One-click PDF export", body: "Generate a polished, branded report in seconds. Send straight to clients or attach to your proposals." },
];

const useCases = [
  { t: "Sales pitches", b: "Hand prospects a branded audit of their site before the discovery call. Wins more deals than a generic deck." },
  { t: "Client onboarding", b: "Kick off every new engagement with a benchmark report so progress is visible from day one." },
  { t: "Monthly retainers", b: "Ship a recurring white-label SEO report as part of your retainer deliverables, without the manual work." },
];

const comparison = [
  { feature: "Remove SiteScoper branding", us: true, them: false },
  { feature: "Add your logo & colors", us: true, them: false },
  { feature: "AI-written client-friendly findings", us: true, them: false },
  { feature: "Unlimited client audits", us: true, them: true },
  { feature: "Instant PDF export", us: true, them: true },
  { feature: "No per-report fee", us: true, them: false },
];

const faqs = [
  { q: "What is a white label SEO audit report?", a: "A white label SEO audit report is a branded website audit that an agency or freelancer delivers to a client under their own brand. The underlying tool is invisible — the client sees only the agency's logo, colors, and contact info." },
  { q: "Can I add my agency's logo and colors?", a: "Yes. On the Pro plan you can upload your logo and set brand colors, and every PDF export is generated with your branding instead of SiteScoper's." },
  { q: "How is this different from white-label Semrush or Ahrefs reports?", a: "Semrush and Ahrefs export raw data tables aimed at SEO professionals. SiteScoper's white-label reports are written by AI in plain English and prioritised by impact — ready to hand to a client without an analyst's edit pass." },
  { q: "Is there a per-report fee?", a: "No. Pro includes unlimited audits across unlimited client domains. There is no per-report or per-client surcharge." },
  { q: "Can I resell the audits to my clients?", a: "Yes. You can charge your clients whatever you like for the audits you deliver. That is the entire point of a white-label tool." },
  { q: "Do I need a separate account per client?", a: "No. Run every client domain from a single Pro account and export each report with your shared agency branding." },
];

const WhiteLabelSeoReports = () => {
  const { isPro } = useSubscription();
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
        <title>White Label SEO Audit Reports for Agencies | SiteScoper</title>
        <meta name="description" content="Deliver branded, client-ready SEO audit reports under your own agency brand. Unlimited audits, AI-written findings, instant PDF export." />
        <link rel="canonical" href="https://sitescoper.com/white-label-seo-reports" />
        <meta property="og:title" content="White Label SEO Audit Reports — SiteScoper" />
        <meta property="og:description" content="Branded, client-ready SEO audits for agencies and freelancers. Unlimited reports, your logo, your colors." />
        <meta property="og:url" content="https://sitescoper.com/white-label-seo-reports" />
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
            <Palette className="w-3.5 h-3.5" />
            White label SEO reports
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
            Client-ready SEO audits, under your agency's brand
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Run unlimited white-label SEO audits across every client domain. Export polished PDF reports with your logo, your colors, and AI-written findings your clients can actually read.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">Run a free audit</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">See Pro pricing</Link>
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
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">When to send a white-label audit</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">Three deliverables your agency can ship this week.</p>
          <ol className="grid md:grid-cols-3 gap-6">
            {useCases.map((s, i) => (
              <li key={s.t} className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-heading font-bold text-primary mb-2">{i + 1}</div>
                <h3 className="font-heading font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">SiteScoper vs. typical white-label SEO tools</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Most "white-label" SEO platforms still hand your client a Semrush-style data dump. SiteScoper ships a report your client can actually act on.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-heading font-semibold">Feature</th>
                  <th className="p-4 font-heading font-semibold">SiteScoper Pro</th>
                  <th className="p-4 font-heading font-semibold text-muted-foreground">Typical tool</th>
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
          <h2 className="text-3xl font-heading font-bold mb-3">
            {isPro ? "You're all set — ship branded audits today" : "Start shipping branded audits today"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {isPro
              ? "Your Pro plan unlocks unlimited white-label audits. Head to the dashboard to run your next one."
              : "Free to try. Upgrade to Pro to remove SiteScoper branding and unlock unlimited white-label client audits."}
          </p>
          <Button asChild size="lg">
            <Link to={isPro ? "/dashboard" : "/pricing"}>
              {isPro ? "Go to dashboard" : "Upgrade to Pro"}
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default WhiteLabelSeoReports;