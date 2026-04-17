import { motion } from "framer-motion";
import { Link2, Search, Sparkles, FileText } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Paste your URL",
    description: "Drop any website URL into the analyzer. No signup required to try it out.",
  },
  {
    icon: Search,
    number: "02",
    title: "We crawl your site",
    description: "Our crawler discovers and scrapes your most important pages — homepage, pricing, features, docs.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "AI analyzes everything",
    description: "An AI product strategist reviews your messaging, positioning, UX, SEO, and trust signals.",
  },
  {
    icon: FileText,
    number: "04",
    title: "Get actionable feedback",
    description: "Receive a detailed report with priority fixes, scores, and a downloadable PDF.",
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
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            From URL to insights in 60 seconds
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Four simple steps. Zero configuration. Real results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
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
