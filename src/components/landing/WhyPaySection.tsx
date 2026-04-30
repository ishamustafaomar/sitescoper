import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS: { label: string; free: string | boolean; pro: string | boolean; highlight?: boolean }[] = [
  { label: "Site analyses",                                  free: "1 / month",      pro: "Unlimited",                  highlight: true },
  { label: "Overall score & traffic-light breakdown",        free: true,             pro: true },
  { label: "Action items per scan",                          free: "Top 3 only",     pro: "Full prioritized roadmap",   highlight: true },
  { label: "Deep product reasoning (AI plays your product)", free: "Surface only",   pro: "Full deep simulation",       highlight: true },
  { label: "Product ideas & strategy section",               free: false,            pro: true },
  { label: "Saved analysis history",                         free: "Last 1 scan",    pro: "Unlimited & searchable" },
  { label: "Side-by-side competitor compare",                free: "Preview only",   pro: "Full battle mode",           highlight: true },
  { label: "Chat with your report (AI)",                     free: false,            pro: true },
  { label: "1-click PDF export",                             free: false,            pro: true },
  { label: "Priority Gemini-powered scans",                  free: false,            pro: true },
];

function Cell({ value, pro }: { value: string | boolean; pro?: boolean }) {
  if (value === true) return <Check className={`h-4 w-4 inline ${pro ? "text-primary" : "text-muted-foreground"}`} />;
  if (value === false) return <Lock className="h-3.5 w-3.5 inline text-muted-foreground/40" />;
  return <span className={pro ? "text-foreground" : "text-muted-foreground"}>{value}</span>;
}

export function WhyPaySection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">
            <Crown className="h-3 w-3" /> Why pay money?
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            What does Pro actually unlock?
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Free is great for kicking the tires. Pro is where SiteScoper actually plays your product, finds the bugs in your logic, and writes the fixes for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border-2 border-primary/20 overflow-hidden bg-card"
        >
          <div className="grid grid-cols-[1.4fr_1fr_1.2fr]">
            {/* Header */}
            <div className="p-4 bg-muted/40 border-b border-border" />
            <div className="p-4 bg-muted/40 border-b border-border text-center">
              <div className="font-heading text-base font-bold">Free account</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">$0 forever</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b-2 border-primary text-center">
              <div className="font-heading text-base font-bold text-primary inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Pro
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">from $13.25/mo</div>
            </div>

            {/* Rows */}
            {ROWS.map((row, i) => (
              <div key={row.label} className="contents">
                <div className={`p-3.5 border-b border-border text-sm font-body ${row.highlight ? "font-semibold" : ""} ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                  {row.label}
                </div>
                <div className={`p-3.5 border-b border-border text-center text-sm ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                  <Cell value={row.free} />
                </div>
                <div className={`p-3.5 border-b-2 border-primary/30 text-center text-sm bg-primary/5 ${row.highlight ? "font-semibold" : ""}`}>
                  <Cell value={row.pro} pro />
                </div>
              </div>
            ))}

            {/* CTA row */}
            <div className="p-4" />
            <div className="p-4 text-center">
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/auth")}>
                Stay on Free
              </Button>
            </div>
            <div className="p-4 text-center bg-primary/5">
              <Button size="sm" className="w-full shadow-glow" onClick={() => navigate("/pricing")}>
                <Sparkles className="h-3.5 w-3.5" /> See Pro pricing
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">Cancel anytime. Keep Pro until the end of your paid period.</p>
      </div>
    </section>
  );
}
