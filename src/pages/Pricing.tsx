import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Gift, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";

const PERKS: string[] = [
  "Unlimited site analyses",
  "Full prioritized action roadmap",
  "Deep product simulation (AI plays your product)",
  "Product ideas & strategy section",
  "Unlimited, searchable analysis history",
  "Unlimited saved websites for re-scanning",
  "Side-by-side competitor battle mode",
  "Chat with your report (AI)",
  "1-click PDF export",
  "Priority Gemini-powered scans",
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing — SiteScoper is free during early access</title>
        <meta name="description" content="SiteScoper is 100% free while we're in early access. Unlimited AI website audits, deep product simulation, PDF exports, competitor compare — every feature unlocked." />
        <link rel="canonical" href="https://sitescoper.com/pricing" />
        <meta property="og:title" content="Pricing — SiteScoper is free during early access" />
        <meta property="og:description" content="Every feature unlocked, no credit card, no trial timer. Free during early access." />
        <meta property="og:url" content="https://sitescoper.com/pricing" />
        <meta property="og:type" content="website" />
      </Helmet>
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body mb-4">
            <Gift className="h-3 w-3" /> Early access
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            SiteScoper is free.<br />Every feature, for everyone.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're focused on making SiteScoper genuinely useful before we figure out pricing. So right now, every feature is unlocked for every account — no credit card, no trial timer, no "Pro plan".
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="font-heading text-xl font-bold text-primary inline-flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5" /> Everything, unlocked
                </div>
                <p className="text-xs text-muted-foreground font-body mt-1">Sign in with email or Google. That's it.</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-heading font-bold">$0</div>
                <div className="text-[11px] text-muted-foreground font-body">while we're in early access</div>
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 pt-6 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-xs text-muted-foreground font-body text-center sm:text-left max-w-md">
                When we eventually charge for something, the people using SiteScoper now will help us decide what — and you'll hear about it long before anything changes.
              </p>
              <Button size="lg" className="shadow-glow" onClick={() => navigate("/auth")}>
                <Sparkles className="h-4 w-4" /> Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">No credit card. No trial timer. No "Pro plan".</p>
      </main>
    </div>
  );
}