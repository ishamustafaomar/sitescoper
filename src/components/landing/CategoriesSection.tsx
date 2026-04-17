import { motion } from "framer-motion";
import { Target, Eye, MessageSquare, ShieldCheck, Zap, Search } from "lucide-react";

const categories = [
  {
    icon: Target,
    title: "Product & Value Prop",
    description: "Is your value proposition clear in 5 seconds? Does the product solve a real problem?",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Eye,
    title: "Positioning & Market Fit",
    description: "Who is this for? What makes you different? Are you targeting the right audience?",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Messaging & Copy",
    description: "Is the writing sharp, persuasive, and benefits-driven? Or is it filled with vague jargon?",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Credibility",
    description: "Social proof, testimonials, logos, security signals — what's building (or breaking) trust?",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "UX & Design",
    description: "Visual hierarchy, navigation flow, mobile experience, and overall polish.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Search,
    title: "SEO & Technical",
    description: "Meta tags, structured data, performance, accessibility — the technical foundation.",
    color: "from-cyan-500 to-blue-600",
  },
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
            Six dimensions of website excellence
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            We go beyond surface-level SEO to evaluate what actually makes a website convert.
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
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all group"
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
