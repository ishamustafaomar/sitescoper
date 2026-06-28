import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERKS: string[] = [
  "Unlimited site analyses",
  "Full prioritized action roadmap",
  "Deep product simulation (AI plays your product)",
  "Product ideas & strategy section",
  "Unlimited, searchable history",
  "Side-by-side competitor battle mode",
  "Chat with your report (AI)",
  "1-click PDF export",
  "Priority Gemini-powered scans",
];

export function WhyPaySection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">
            <Gift className="h-3 w-3" /> Early access — 100% free
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Everything's free. No catch.
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            We're in early access. Every feature is unlocked for every account — no credit card, no trial timer, no "Pro plan". When we eventually charge for something, the people using SiteScoper today will help us decide what.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="font-heading text-lg font-bold text-primary inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Unlocked for everyone
              </div>
              <p className="text-xs text-muted-foreground font-body mt-0.5">Sign in with email or Google and you've got it all.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-heading font-bold">$0</div>
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

          <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-xs text-muted-foreground font-body text-center sm:text-left">
              We'll tell you well in advance if anything moves behind a paywall.
            </p>
            <Button size="sm" className="shadow-glow" onClick={() => navigate("/auth")}>
              <Sparkles className="h-3.5 w-3.5" /> Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
