import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sitescoper_cookie_consent_v1";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Delay to avoid CLS / blocking first paint
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Allow keyboard users (and automated tools) to dismiss with Escape
  // by accepting essentials only.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        accept("essential");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, ts: Date.now() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
          role="dialog"
          aria-label={t("consent.title")}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <Cookie className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-sm">{t("consent.title")}</h3>
                <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
                  <Trans
                    i18nKey="consent.body"
                    components={{
                      privacy: <Link to="/privacy" className="underline hover:text-foreground" />,
                    }}
                  />
                </p>
              </div>
              <button
                onClick={() => accept("essential")}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label={t("consent.essential")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => accept("essential")}>
                {t("consent.essential")}
              </Button>
              <Button size="sm" variant="hero" className="flex-1 text-xs" onClick={() => accept("all")}>
                {t("consent.accept")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}