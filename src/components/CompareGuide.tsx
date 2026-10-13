import { useTranslation } from "react-i18next";
import { ArrowRight, Search, Target, Scale } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function CompareIntro() {
  const { t } = useTranslation();
  return (
    <header className="space-y-4 max-w-3xl">
      <p className="flex items-center gap-2 text-sm text-accent font-body"><Search className="h-4 w-4" aria-hidden="true" />SiteScoper · {t("compare.seo.badge")}</p>
      <h1 className="text-4xl md:text-5xl font-heading">{t("compare.seo.title")}</h1>
      <p className="text-muted-foreground font-body leading-relaxed max-w-2xl">{t("compare.seo.intro")}</p>
    </header>
  );
}

export function CompareGuide() {
  const { t } = useTranslation();
  const rows = [
    { key: "seo", a: 58, b: 76 },
    { key: "content", a: 71, b: 63 },
    { key: "trust", a: 49, b: 52 },
  ];
  return (
    <div className="font-body">
      <section className="py-10 border-t border-border space-y-5" aria-labelledby="compare-explanation">
        <h2 id="compare-explanation" className="font-heading text-3xl">{t("compare.seo.whyTitle")}</h2>
        <p className="max-w-3xl text-muted-foreground leading-relaxed">{t("compare.seo.whyBody")}</p>
        <div className="grid md:grid-cols-3 gap-6 pt-3">
          {[Search, Target, Scale].map((Icon, i) => (
            <div key={i} className="space-y-2">
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="font-heading text-xl">{t(`compare.seo.step${i + 1}Title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`compare.seo.step${i + 1}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="comparison-example" className="py-10 border-t border-border space-y-5 scroll-mt-24" aria-labelledby="compare-example-title">
        <div className="space-y-2">
          <h2 id="compare-example-title" className="font-heading text-3xl">{t("compare.seo.exampleTitle")}</h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{t("compare.seo.exampleNote")}</p>
        </div>
        <div className="overflow-x-auto border border-border rounded-md">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">{t("compare.seo.exampleTitle")}. {t("compare.seo.exampleNote")}</caption>
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="p-4 font-medium">{t("compare.seo.category")}</th>
                <th scope="col" className="p-4 font-medium text-center">{t("compare.seo.yourPage")}</th>
                <th scope="col" className="p-4 font-medium text-center">{t("compare.seo.competitorPage")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="p-4 font-medium">{t(`compare.seo.${row.key}Label`)}</th>
                  <td className="p-4 text-center tabular-nums">{row.a} / 100</td>
                  <td className="p-4 text-center tabular-nums">{row.b} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {rows.map((row) => (
            <div key={row.key} className="space-y-2">
              <h3 className="text-xl font-heading">{t(`compare.seo.${row.key}Takeaway`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`compare.seo.${row.key}Action`)}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground border-l-2 border-accent pl-4 leading-relaxed">{t("compare.seo.limitations")}</p>
      </section>

      <section className="py-10 border-t border-border" aria-labelledby="compare-faq-title">
        <h2 id="compare-faq-title" className="font-heading text-3xl mb-6">{t("compare.seo.faqTitle")}</h2>
        <Accordion type="single" collapsible>
          {[1, 2, 3, 4, 5].map((n) => (
            <AccordionItem key={n} value={`compare-faq-${n}`} className="group">
              <AccordionTrigger className="text-left font-body font-medium hover:no-underline">{t(`compare.seo.faq.q${n}`)}</AccordionTrigger>
              <AccordionContent forceMount className="text-muted-foreground leading-relaxed group-data-[state=closed]:hidden">{t(`compare.seo.faq.a${n}`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button variant="outline" asChild><Link to="/seo-audit-report">{t("compare.seo.auditGuide")}<ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" asChild><Link to="/">{t("compare.seo.freeAudit")}<ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" asChild><Link to="/roast-my-website">{t("roastComparison.nav")}<ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
    </div>
  );
}