import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FREE_PRO_MODE } from "@/lib/free-access";

export function EarlyAccessBanner() {
  const { t } = useTranslation();
  if (!FREE_PRO_MODE) return null;
  return (
    <div className="w-full border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs sm:text-sm font-body text-primary">
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        <span>
          <strong className="font-semibold">{t("earlyAccess.badge")}</strong> — {t("earlyAccess.banner")}
        </span>
      </span>
    </div>
  );
}
