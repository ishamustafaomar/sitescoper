import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, BarChart3, Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const AiWebsiteAuditTool = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Sparkles, title: t("pages.aiTool.f1Title"), body: t("pages.aiTool.f1Body") },
    { icon: Zap, title: t("pages.aiTool.f2Title"), body: t("pages.aiTool.f2Body") },
    { icon: BarChart3, title: t("pages.aiTool.f3Title"), body: t("pages.aiTool.f3Body") },
    { icon: Shield, title: t("pages.aiTool.f4Title"), body: t("pages.aiTool.f4Body") },
  ];

  const comparison = [
    { feature: t("pages.aiTool.cmp1"), us: true, them: false },
    { feature: t("pages.aiTool.cmp2"), us: true, them: true },
    { feature: t("pages.aiTool.cmp3"), us: true, them: false },
    { feature: t("pages.aiTool.cmp4"), us: true, them: false },
    { feature: t("pages.aiTool.cmp5"), us: true, them: true },
    { feature: t("pages.aiTool.cmp6"), us: true, them: true },
  ];

  const faqs = [
    { q: t("pages.aiTool.faq1q"), a: t("pages.aiTool.faq1a") },
    { q: t("pages.aiTool.faq2q"), a: t("pages.aiTool.faq2a") },
    { q: t("pages.aiTool.faq3q"), a: t("pages.aiTool.faq3a") },
    { q: t("pages.aiTool.faq4q"), a: t("pages.aiTool.faq4a") },
    { q: t("pages.aiTool.faq5q"), a: t("pages.aiTool.faq5a") },
  ];

  const steps = [
    { n: "1", t: t("pages.aiTool.s1Title"), b: t("pages.aiTool.s1Body") },
    { n: "2", t: t("pages.aiTool.s2Title"), b: t("pages.aiTool.s2Body") },
    { n: "3", t: t("pages.aiTool.s3Title"), b: t("pages.aiTool.s3Body") },
  ];

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
        <title>{t("pages.aiTool.metaTitle")}</title>
        <meta name="description" content={t("pages.aiTool.metaDesc")} />
        <link rel="canonical" href="https://sitescoper.com/ai-website-audit-tool" />
        <meta property="og:title" content={t("pages.aiTool.ogTitle")} />
        <meta property="og:description" content={t("pages.aiTool.ogDesc")} />
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
            {t("pages.aiTool.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
            {t("pages.aiTool.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("pages.aiTool.heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">{t("pages.aiTool.runFreeAudit")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">{t("pages.aiTool.seePricing")}</Link>
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
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">{t("pages.aiTool.howTitle")}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">{t("pages.aiTool.howSubtitle")}</p>
          <ol className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <li key={s.n} className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-heading font-bold text-primary mb-2">{s.n}</div>
                <h3 className="font-heading font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">{t("pages.aiTool.compareTitle")}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            {t("pages.aiTool.compareSubtitle")}
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-heading font-semibold">{t("pages.aiTool.colFeature")}</th>
                  <th className="p-4 font-heading font-semibold">{t("pages.aiTool.colUs")}</th>
                  <th className="p-4 font-heading font-semibold text-muted-foreground">{t("pages.aiTool.colThem")}</th>
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
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">{t("pages.aiTool.faqTitle")}</h2>
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
          <h2 className="text-3xl font-heading font-bold mb-3">{t("pages.aiTool.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t("pages.aiTool.ctaBody")}
          </p>
          <Button asChild size="lg">
            <Link to="/">{t("pages.aiTool.runFreeAudit")}</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AiWebsiteAuditTool;
