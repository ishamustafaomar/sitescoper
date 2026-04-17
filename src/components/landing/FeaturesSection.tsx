import { motion } from "framer-motion";
import { Sparkles, Search, Layers, Zap, Shield, BarChart3, Globe2, MessageSquareText } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Brutally Honest AI",
    description: "Get real product feedback, not generic SEO checklists. Like a YC partner reviewing your site.",
  },
  {
    icon: Layers,
    title: "Multi-Page Crawling",
    description: "We crawl up to 8 of your most important pages — pricing, features, docs, signup — for deep context.",
  },
  {
    icon: MessageSquareText,
    title: "Product Strategy Insights",
    description: "Positioning, messaging, value prop clarity, and trust signals — analyzed by AI that gets it.",
  },
  {
    icon: Search,
    title: "SEO & Technical Audit",
    description: "Title tags, meta descriptions, structured data, and accessibility issues — all checked automatically.",
  },
  {
    icon: BarChart3,
    title: "Score Tracking",
    description: "Save analyses, track scores over time, and watch your website improve with every iteration.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Full analysis in under 60 seconds. No setup, no installation, no integrations.",
  },
  {
    icon: Shield,
    title: "Trust & Credibility",
    description: "AI evaluates social proof, testimonials, and trust signals to find what's missing.",
  },
  {
    icon: Globe2,
    title: "Any Website",
    description: "Works on landing pages, SaaS products, ecommerce, blogs, portfolios, and anything in between.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body mb-4">
            <Sparkles className="h-3 w-3" />
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Everything you need to ship a better website
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            More than just SEO scoring — actionable feedback grounded in product strategy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-[var(--shadow-md)] hover:border-primary/30 transition-all"
              >
                <div className="gradient-primary p-2 rounded-lg w-fit mb-3 shadow-glow">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
