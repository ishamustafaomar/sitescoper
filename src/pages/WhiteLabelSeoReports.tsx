import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FileText, Palette, Users, Download, Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";

const WhiteLabelSeoReports = () => {
  const { isPro } = useSubscription();
  const { t } = useTranslation();

  const features = [
    { icon: Palette, title: t("pages.whiteLabel.f1Title"), body: t("pages.whiteLabel.f1Body") },
    { icon: FileText, title: t("pages.whiteLabel.f2Title"), body: t("pages.whiteLabel.f2Body") },
    { icon: Users, title: t("pages.whiteLabel.f3Title"), body: t("pages.whiteLabel.f3Body") },
    { icon: Download, title: t("pages.whiteLabel.f4Title"), body: t("pages.whiteLabel.f4Body") },
  ];

  const useCases = [
    { t: t("pages.whiteLabel.u1Title"), b: t("pages.whiteLabel.u1Body") },
    { t: t("pages.whiteLabel.u2Title"), b: t("pages.whiteLabel.u2Body") },
    { t: t("pages.whiteLabel.u3Title"), b: t("pages.whiteLabel.u3Body") },
  ];

  const comparison = [
    { feature: t("pages.whiteLabel.cmp1"), us: true, them: false },
    { feature: t("pages.whiteLabel.cmp2"), us: true, them: false },
    { feature: t("pages.whiteLabel.cmp3"), us: true, them: false },
    { feature: t("pages.whiteLabel.cmp4"), us: true, them: true },
    { feature: t("pages.whiteLabel.cmp5"), us: true, them: true },
    { feature: t("pages.whiteLabel.cmp6"), us: true, them: false },
  ];

  const faqs = [
    { q: t("pages.whiteLabel.faq1q"), a: t("pages.whiteLabel.faq1a") },
    { q: t("pages.whiteLabel.faq2q"), a: t("pages.whiteLabel.faq2a") },
    { q: t("pages.whiteLabel.faq3q"), a: t("pages.whiteLabel.faq3a") },
    { q: t("pages.whiteLabel.faq4q"), a: t("pages.whiteLabel.faq4a") },
    { q: t("pages.whiteLabel.faq5q"), a: t("pages.whiteLabel.faq5a") },
    { q: t("pages.whiteLabel.faq6q"), a: t("pages.whiteLabel.faq6a") },
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
        <title>{t("pages.whiteLabel.metaTitle")}</title>
        <meta name="description" content={t("pages.whiteLabel.metaDesc")} />
        <link rel="canonical" href="https://sitescoper.com/white-label-seo-reports" />
        <meta property="og:title" content={t("pages.whiteLabel.ogTitle")} />
        <meta property="og:description" content={t("pages.whiteLabel.ogDesc")} />
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
            {t("pages.whiteLabel.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
            {t("pages.whiteLabel.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("pages.whiteLabel.heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">{t("pages.whiteLabel.runFreeAudit")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">{t("pages.whiteLabel.seeProPricing")}</Link>
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
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">{t("pages.whiteLabel.useCasesTitle")}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">{t("pages.whiteLabel.useCasesSubtitle")}</p>
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
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">{t("pages.whiteLabel.compareTitle")}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            {t("pages.whiteLabel.compareSubtitle")}
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-heading font-semibold">{t("pages.whiteLabel.colFeature")}</th>
                  <th className="p-4 font-heading font-semibold">{t("pages.whiteLabel.colUs")}</th>
                  <th className="p-4 font-heading font-semibold text-muted-foreground">{t("pages.whiteLabel.colThem")}</th>
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
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">{t("pages.whiteLabel.faqTitle")}</h2>
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
            {isPro ? t("pages.whiteLabel.ctaTitleReady") : t("pages.whiteLabel.ctaTitleStart")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {isPro ? t("pages.whiteLabel.ctaBodyPro") : t("pages.whiteLabel.ctaBodyFree")}
          </p>
          <Button asChild size="lg">
            <Link to={isPro ? "/dashboard" : "/pricing"}>
              {isPro ? t("pages.whiteLabel.goDashboard") : t("pages.whiteLabel.upgradeToPro")}
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default WhiteLabelSeoReports;
