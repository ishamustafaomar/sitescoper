import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Lock, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInBenefitsProps {
  variant?: "section" | "card";
}

export function SignInBenefits({ variant = "section" }: SignInBenefitsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const anonItems = [
    t("signin.anonItem1"),
    t("signin.anonItem2"),
    t("signin.anonItem3"),
  ];
  const memberItems = [
    t("signin.memberItem1"),
    t("signin.memberItem2"),
    t("signin.memberItem3"),
    t("signin.memberItem4"),
  ];

  if (variant === "card") {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h4 className="font-heading font-semibold text-sm">{t("auth.benefitsTitle")}</h4>
        </div>
        <ul className="space-y-1.5">
          {memberItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Check className="h-3 w-3 text-accent shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {t("signin.sectionTitle")}
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            {t("signin.sectionSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6 space-y-4"
          >
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg text-muted-foreground">
                {t("signin.anonTitle")}
              </h3>
              <p className="text-xs font-body text-muted-foreground/80">
                Try it instantly — limited features.
              </p>
            </div>
            <ul className="space-y-2">
              {anonItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-border/60 space-y-1.5">
              <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground/70">
                Not included
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-xs font-body text-muted-foreground/80">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>History &amp; score trends</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-body text-muted-foreground/80">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>Public share links</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-body text-muted-foreground/80">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>Compare scans over time</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 space-y-4 relative shadow-glow"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body uppercase tracking-wider">
              Recommended
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("signin.memberTitle")}
              </h3>
              <p className="text-xs font-body text-muted-foreground">
                Everything above, plus everything below — free, no credit card.
              </p>
            </div>
            <ul className="space-y-2">
              {memberItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span><span className="font-semibold">{item}</span></span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs font-body text-primary pt-1">
              <InfinityIcon className="h-3.5 w-3.5" />
              <span>No usage limits — ever.</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                {t("signin.ctaCreate")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                {t("signin.ctaLogin")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}