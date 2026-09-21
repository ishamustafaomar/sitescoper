import { motion } from "framer-motion";
import { Search, Gauge, MousePointerClick, FileSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/router-compat";

const ITEMS = [
  { icon: Search, key: "seo" },
  { icon: Gauge, key: "technical" },
  { icon: MousePointerClick, key: "ux" },
  { icon: FileSearch, key: "content" },
] as const;

/**
 * Substantive, crawlable explanation of what the audit covers. Also carries the
 * topical vocabulary (SEO audits, technical SEO, Core Web Vitals) that the
 * homepage was missing relative to competing pages.
 */
export function ScopeSection() {
  const { t } = useTranslation();
  return (
    <section className="px-4 py-16" aria-labelledby="scope-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="scope-heading" className="font-heading font-semibold text-3xl md:text-4xl tracking-tight mb-4">
            {t("landing.scope.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-10 font-body">{t("landing.scope.intro")}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {ITEMS.map(({ icon: Icon, key }) => (
              <div key={key} className="border border-border rounded-2xl p-6 bg-card">
                <Icon className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
                <h3 className="font-heading font-semibold text-lg mb-2">{t(`landing.scope.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {t(`landing.scope.${key}.body`)}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-8 font-body max-w-2xl">
            {t("landing.scope.outro")}{" "}
            <Link to="/blog/how-to-audit-a-website-for-seo" className="text-primary underline underline-offset-4">
              {t("landing.scope.link")}
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
