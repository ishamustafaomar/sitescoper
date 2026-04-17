import { motion } from "framer-motion";
import { Rocket, Briefcase, ShoppingBag, PenTool, GraduationCap, Building2 } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "SaaS Founders",
    description: "Validate your landing page messaging before launch. Find conversion blockers fast.",
  },
  {
    icon: Briefcase,
    title: "Agencies",
    description: "Audit client websites quickly. Generate professional reports to win new business.",
  },
  {
    icon: ShoppingBag,
    title: "Ecommerce",
    description: "Optimize product pages, trust signals, and checkout flow for higher conversions.",
  },
  {
    icon: PenTool,
    title: "Designers",
    description: "Get objective feedback on your portfolio or client projects before shipping.",
  },
  {
    icon: GraduationCap,
    title: "Students & Learners",
    description: "Learn what makes great websites by analyzing real ones with AI-powered breakdowns.",
  },
  {
    icon: Building2,
    title: "Marketing Teams",
    description: "Benchmark your site against competitors. Track improvements over time.",
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-body mb-4">
            Who it's for
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Built for anyone shipping on the web
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Whether you're launching a startup or auditing a client site, SiteScoper helps you ship better.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-[var(--shadow-md)] transition-all"
              >
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-heading font-semibold text-base mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {uc.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
