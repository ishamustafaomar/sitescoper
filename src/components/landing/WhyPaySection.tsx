import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";

const FREE_PERKS: string[] = [
  "3 website scans per month",
  "Full prioritized action roadmap",
  "Category scores & findings",
  "No credit card required",
];

const PRO_PERKS: string[] = [
  "Unlimited site analyses",
  "Deep product simulation (AI plays your product)",
  "Side-by-side competitor battle mode",
  "Chat with your report (AI)",
  "1-click PDF export",
  "Unlimited, searchable history",
  "Priority Gemini-powered scans",
];

export function WhyPaySection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  // Pro users get a slimmer, non-salesy layout on the landing page.
  if (isPro) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">
            <Crown className="h-3 w-3" /> Simple pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Start free. Upgrade when you're serious.
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Every founder gets 3 free scans a month. Ship faster with SiteScoper Pro — unlimited scans, deep product simulation, competitor compare, chat-with-report and PDF exports.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col"
          >
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-lg font-bold">Free</div>
              <div>
                <span className="text-3xl font-heading font-bold">$0</span>
                <span className="text-xs text-muted-foreground font-body ml-1">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {FREE_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? "Go to dashboard" : "Start free"}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 flex flex-col relative"
          >
            <span className="absolute -top-3 right-6 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider">
              Most popular
            </span>
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-lg font-bold text-primary inline-flex items-center gap-1.5">
                <Crown className="h-4 w-4" /> Pro
              </div>
              <div>
                <span className="text-3xl font-heading font-bold">$19</span>
                <span className="text-xs text-muted-foreground font-body ml-1">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {PRO_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" className="shadow-glow" onClick={() => navigate("/pricing")}>
              <Sparkles className="h-3.5 w-3.5" /> Upgrade to Pro
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
