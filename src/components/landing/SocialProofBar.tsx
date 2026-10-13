import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SocialProofBar() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-border bg-muted/20">
      <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-center gap-7 flex-wrap">
        <a
          href="#sample-report"
          className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground underline underline-offset-4 decoration-[hsl(var(--accent))] decoration-2 hover:text-[hsl(var(--accent))] transition-colors"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {t("landing.socialProof.sample")}
        </a>
        <span className="hidden sm:block w-px h-5 bg-border" />
        <span className="font-body text-sm text-muted-foreground">
          {t("landing.socialProof.trusted")}
        </span>
      </div>
    </section>
  );
}
