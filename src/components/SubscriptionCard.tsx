import { Sparkles, Gift } from "lucide-react";

export function SubscriptionCard() {
  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Plan
        </h2>
        <span className="text-xs font-body px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1">
          <Gift className="h-3 w-3" /> Early access
        </span>
      </div>
      <p className="text-sm text-muted-foreground font-body">
        SiteScoper is 100% free during early access — every feature is unlocked on every account. No credit card, no trial timer, no "Pro plan". We'll give you plenty of notice if that ever changes.
      </p>
    </section>
  );
}