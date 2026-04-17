import { motion } from "framer-motion";
import { Target, Megaphone, ShieldCheck, DollarSign, Palette, Mail, Scale, Globe, BarChart3, Search, Sparkles, Zap } from "lucide-react";

const categories = [
  { icon: Target, title: "Product & Value Prop", description: "Is your value proposition clear in 5 seconds? Does the product solve a real problem?", color: "from-rose-500 to-pink-600" },
  { icon: Megaphone, title: "Positioning & Copy", description: "Sharp, persuasive, benefits-driven writing — or vague jargon that puts visitors to sleep?", color: "from-violet-500 to-purple-600" },
  { icon: Palette, title: "Brand & Visual Identity", description: "Logo, color, typography, voice — does it feel cohesive and distinctive, or generic?", color: "from-fuchsia-500 to-pink-600" },
  { icon: ShieldCheck, title: "Trust & Credibility", description: "Social proof, testimonials, logos, security signals — what's building or breaking trust?", color: "from-emerald-500 to-teal-600" },
  { icon: DollarSign, title: "Pricing & Packaging", description: "Plan structure, anchoring, free tier, and clarity. Is your pricing helping or hurting conversion?", color: "from-amber-500 to-orange-600" },
  { icon: Zap, title: "Conversion & UX", description: "CTA strength, visual hierarchy, navigation flow, and the path from landing to action.", color: "from-blue-500 to-indigo-600" },
  { icon: Mail, title: "Email & Lead Capture", description: "Newsletter, lead magnets, follow-up signals — are you capturing intent before visitors leave?", color: "from-sky-500 to-cyan-600" },
  { icon: Scale, title: "Legal & Compliance", description: "Privacy policy, terms, cookie consent, GDPR readiness — table stakes you can't skip.", color: "from-slate-500 to-gray-600" },
  { icon: Globe, title: "Internationalization", description: "Language switcher, currency, locale awareness — are you ready for a global audience?", color: "from-teal-500 to-emerald-600" },
  { icon: BarChart3, title: "Analytics & Measurement", description: "Visible tracking, event hygiene, attribution clues — can you actually measure what matters?", color: "from-yellow-500 to-amber-600" },
  { icon: Search, title: "SEO & Discovery", description: "Meta tags, structured data, performance, accessibility — the technical foundation.", color: "from-cyan-500 to-blue-600" },
  { icon: Sparkles, title: "Polish & Feel", description: "Micro-animations, copy quality, mobile feel — the details that separate good from great.", color: "from-pink-500 to-rose-600" },
];

export function CategoriesSection() {
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
            What we analyze
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            20+ dimensions of website excellence
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            We go far beyond surface-level SEO to evaluate what actually makes a website convert, retain, and grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-[var(--shadow-md)] transition-all group"
              >
                <div className={`bg-gradient-to-br ${cat.color} p-3 rounded-xl w-fit mb-4 shadow-[var(--shadow-md)] group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
