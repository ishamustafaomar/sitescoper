import { Calendar, Clock } from "lucide-react";

interface Day { day: number; title: string; task: string; category: string; estimated_minutes: number }
interface Props { plan?: { headline?: string; days?: Day[] } | null }

export function ActionPlanPanel({ plan }: Props) {
  if (!plan || !plan.days?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> 7-day action plan
        </h3>
        {plan.headline && <span className="text-[11px] text-muted-foreground font-body line-clamp-1">{plan.headline}</span>}
      </div>
      <div className="space-y-2">
        {plan.days.map((d) => (
          <div key={d.day} className="flex gap-3 p-2.5 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-heading font-bold text-xs">
              D{d.day}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-heading font-semibold truncate">{d.title}</p>
                <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" /> {d.estimated_minutes}m
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-body line-clamp-2">{d.task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}