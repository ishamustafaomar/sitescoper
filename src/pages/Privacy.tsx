import { AppHeader } from "@/components/AppHeader";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("legalPrivacy.title")} — SiteScoper</title>
        <meta name="description" content="How SiteScoper collects, uses, and protects your data when you analyze websites with our AI audit tool." />
        <link rel="canonical" href="https://sitescoper.com/privacy" />
        <meta property="og:title" content="Privacy Policy — SiteScoper" />
        <meta property="og:description" content="How SiteScoper handles your data." />
        <meta property="og:url" content="https://sitescoper.com/privacy" />
        <meta property="og:type" content="article" />
      </Helmet>
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-sm dark:prose-invert max-w-none font-body"
        >
          <h1 className="text-3xl font-heading font-bold mb-2">{t("legalPrivacy.title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("legalPrivacy.lastUpdated", { date: new Date().toLocaleDateString() })}</p>

          <section className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s1Title")}</h2>
              <p>{t("legalPrivacy.s1Intro")}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li dangerouslySetInnerHTML={{ __html: t("legalPrivacy.s1Item1") }} />
                <li dangerouslySetInnerHTML={{ __html: t("legalPrivacy.s1Item2") }} />
                <li dangerouslySetInnerHTML={{ __html: t("legalPrivacy.s1Item3") }} />
                <li dangerouslySetInnerHTML={{ __html: t("legalPrivacy.s1Item4") }} />
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s2Title")}</h2>
              <p>{t("legalPrivacy.s2Intro")}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>{t("legalPrivacy.s2Item1")}</li>
                <li>{t("legalPrivacy.s2Item2")}</li>
                <li>{t("legalPrivacy.s2Item3")}</li>
                <li>{t("legalPrivacy.s2Item4")}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s3Title")}</h2>
              <p>{t("legalPrivacy.s3Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s4Title")}</h2>
              <p>{t("legalPrivacy.s4Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s5Title")}</h2>
              <p>{t("legalPrivacy.s5Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s6Title")}</h2>
              <p>{t("legalPrivacy.s6Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s7Title")}</h2>
              <p>{t("legalPrivacy.s7Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalPrivacy.s8Title")}</h2>
              <p>{t("legalPrivacy.s8Body")}</p>
            </div>

          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
