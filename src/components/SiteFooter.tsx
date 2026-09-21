import { Link } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import logoMark from "@/assets/logo-mark.png";
import logoWordmark from "@/assets/logo-wordmark.png";

// Sitewide footer. Adds internal links to every public page —
// boosts crawl depth and gives every page a consistent set of
// authoritative outbound links.
export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/40 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <img src={logoMark} alt="" width={28} height={28} className="h-7 w-7 object-contain" loading="lazy" />
            <img src={logoWordmark} alt="SiteScoper" className="h-[15px] w-auto object-contain dark:invert" loading="lazy" />
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("siteFooter.tagline")}
          </p>
        </div>

        <nav aria-label="Product" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("siteFooter.product")}</h2>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-primary">{t("siteFooter.analyzer")}</Link></li>
            <li><Link to="/ai-website-audit-tool" className="hover:text-primary">{t("siteFooter.auditTool")}</Link></li>
            <li><Link to="/white-label-seo-reports" className="hover:text-primary">{t("siteFooter.whiteLabel")}</Link></li>
            <li><Link to="/compare" className="hover:text-primary">{t("siteFooter.compareTwo")}</Link></li>
            <li><Link to="/pricing" className="hover:text-primary">{t("siteFooter.pricing")}</Link></li>
          </ul>
        </nav>

        <nav aria-label="Audits" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("siteFooter.audits")}</h2>
          <ul className="space-y-2">
            <li><Link to="/ux-audit" className="hover:text-primary">{t("siteFooter.uxAudit")}</Link></li>
            <li><Link to="/cro-audit" className="hover:text-primary">{t("siteFooter.croAudit")}</Link></li>
            <li><Link to="/landing-page-audit" className="hover:text-primary">{t("siteFooter.landingPageAudit")}</Link></li>
            <li><Link to="/seo-audit-report" className="hover:text-primary">{t("siteFooter.seoAuditReport")}</Link></li>
            <li><Link to="/best-ai-website-audit-tools" className="hover:text-primary">Best AI audit tools</Link></li>
          </ul>
        </nav>

        <nav aria-label="Free tools" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("siteFooter.tools")}</h2>
          <ul className="space-y-2">
            <li><Link to="/tools/open-graph-checker" className="hover:text-primary">{t("siteFooter.ogChecker")}</Link></li>
            <li><Link to="/tools/llms-txt-generator" className="hover:text-primary">{t("siteFooter.llmsTxt")}</Link></li>
            <li><Link to="/tools" className="hover:text-primary">{t("siteFooter.allTools")}</Link></li>
            <li><Link to="/website-audit-statistics" className="hover:text-primary">Website audit statistics</Link></li>
          </ul>
        </nav>

        <nav aria-label="Resources" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("siteFooter.resources")}</h2>
          <ul className="space-y-2">
            <li><Link to="/blog" className="hover:text-primary">{t("siteFooter.blog")}</Link></li>
            <li><Link to="/blog/how-to-audit-a-website-for-seo" className="hover:text-primary">{t("siteFooter.howToAudit")}</Link></li>
            <li><Link to="/blog/free-website-audit-checklist" className="hover:text-primary">{t("siteFooter.checklist")}</Link></li>
            <li><Link to="/blog/open-graph-tags-guide" className="hover:text-primary">{t("siteFooter.openGraphGuide")}</Link></li>
            <li><Link to="/blog/core-web-vitals-explained-for-founders" className="hover:text-primary">{t("siteFooter.coreWebVitals")}</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">{t("siteFooter.privacy")}</Link></li>
            <li><Link to="/terms" className="hover:text-primary">{t("siteFooter.terms")}</Link></li>
            <li><Link to="/auth" className="hover:text-primary">{t("siteFooter.signIn")}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>{t("siteFooter.rights", { year })}</span>
          <span>{t("siteFooter.builtFor")}</span>
        </div>
      </div>
    </footer>
  );
}
