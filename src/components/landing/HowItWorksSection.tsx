import { motion } from "framer-motion";
import { Link2, Radar, ListChecks, Workflow } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Paste your URL",
    description: "Drop in any public website. No account needed to run your first audit.",
  },
  {
    icon: Radar,
    number: "02",
    title: "AI reads your site",
    description: "We crawl your key pages and read them like a skeptical first-time visitor.",
  },
  {
    icon: ListChecks,
    number: "03",
    title: "Get the 3 fixes",
    description: "A prioritized verdict — the handful of changes actually worth shipping this week.",
  },
];

export function HowItWorksSection() {
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
            <Workflow className="h-3 w-3" />
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            From URL to verdict in three steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="gradient-primary p-2.5 rounded-lg shadow-glow">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-heading font-bold text-3xl text-muted-foreground/20">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
