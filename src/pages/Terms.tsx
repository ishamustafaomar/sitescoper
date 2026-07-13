import { AppHeader } from "@/components/AppHeader";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const Terms = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service — SiteScoper</title>
        <meta name="description" content="The terms that govern your use of SiteScoper, the AI-powered website audit and analysis tool." />
        <link rel="canonical" href="https://sitescoper.com/terms" />
        <meta property="og:title" content="Terms of Service — SiteScoper" />
        <meta property="og:description" content="Terms governing use of SiteScoper." />
        <meta property="og:url" content="https://sitescoper.com/terms" />
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
          <h1 className="text-3xl font-heading font-bold mb-2">{t("legalTerms.title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("legalPrivacy.lastUpdated", { date: new Date().toLocaleDateString() })}</p>

          <section className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s1Title")}</h2>
              <p>{t("legalTerms.s1Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s2Title")}</h2>
              <p>{t("legalTerms.s2Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s3Title")}</h2>
              <p>{t("legalTerms.s3Intro")}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>{t("legalTerms.s3Item1")}</li>
                <li>{t("legalTerms.s3Item2")}</li>
                <li>{t("legalTerms.s3Item3")}</li>
                <li>{t("legalTerms.s3Item4")}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s4Title")}</h2>
              <p>{t("legalTerms.s4Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s5Title")}</h2>
              <p>{t("legalTerms.s5Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s6Title")}</h2>
              <p>{t("legalTerms.s6Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s7Title")}</h2>
              <p>{t("legalTerms.s7Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s8Title")}</h2>
              <p>{t("legalTerms.s8Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s9Title")}</h2>
              <p>{t("legalTerms.s9Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s10Title")}</h2>
              <p>{t("legalTerms.s10Body")}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">{t("legalTerms.s11Title")}</h2>
              <p>{t("legalTerms.s11Body")}</p>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
