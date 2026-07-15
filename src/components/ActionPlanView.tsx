import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActionPlan } from "@/lib/api";

interface ActionPlanViewProps {
  plan: ActionPlan;
}

export function ActionPlanView({ plan }: ActionPlanViewProps) {
  const { t } = useTranslation();
  if (!plan?.days?.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground font-body">
        {t("actionPlanView.noPlan")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plan.headline && (
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-body mb-2">
            <Calendar className="h-3 w-3" />
            {t("actionPlanView.headlineBadge")}
          </div>
          <p className="text-sm font-heading font-semibold leading-snug">{plan.headline}</p>
        </div>
      )}

      <div className="relative space-y-2">
        {/* timeline line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" aria-hidden />

        {plan.days.map((d, i) => (
          <motion.div
            key={`${d.day}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="relative flex gap-4 pl-0"
          >
            <div className="relative z-10 shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xs shadow-[var(--shadow-md)]">
              {d.day}
            </div>
            <div className="flex-1 bg-card border border-border rounded-xl p-4 space-y-1.5 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h4 className="font-heading font-semibold text-sm leading-snug">{d.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-body shrink-0">
                  <Clock className="h-3 w-3" />
                  {d.estimated_minutes ?? 30}m
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{d.task}</p>
              {d.category && (
                <div className="inline-flex items-center gap-1 text-[10px] font-body text-muted-foreground/80">
                  <CheckCircle2 className="h-3 w-3" />
                  {d.category}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
