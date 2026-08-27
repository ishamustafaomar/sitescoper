import { motion } from "framer-motion";
import { Target, Megaphone, ShieldCheck, DollarSign, Palette, Mail, Scale, Globe, BarChart3, Search, Sparkles, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CategoriesSection() {
  const { t } = useTranslation();
  const categories = [
    { icon: Target, title: t("landing.categories.c1t"), description: t("landing.categories.c1d"), color: "from-rose-500 to-pink-600" },
    { icon: Megaphone, title: t("landing.categories.c2t"), description: t("landing.categories.c2d"), color: "from-violet-500 to-purple-600" },
    { icon: Palette, title: t("landing.categories.c3t"), description: t("landing.categories.c3d"), color: "from-fuchsia-500 to-pink-600" },
    { icon: ShieldCheck, title: t("landing.categories.c4t"), description: t("landing.categories.c4d"), color: "from-emerald-500 to-teal-600" },
    { icon: DollarSign, title: t("landing.categories.c5t"), description: t("landing.categories.c5d"), color: "from-amber-500 to-orange-600" },
    { icon: Zap, title: t("landing.categories.c6t"), description: t("landing.categories.c6d"), color: "from-blue-500 to-indigo-600" },
    { icon: Mail, title: t("landing.categories.c7t"), description: t("landing.categories.c7d"), color: "from-sky-500 to-cyan-600" },
    { icon: Scale, title: t("landing.categories.c8t"), description: t("landing.categories.c8d"), color: "from-slate-500 to-gray-600" },
    { icon: Globe, title: t("landing.categories.c9t"), description: t("landing.categories.c9d"), color: "from-teal-500 to-emerald-600" },
    { icon: BarChart3, title: t("landing.categories.c10t"), description: t("landing.categories.c10d"), color: "from-yellow-500 to-amber-600" },
    { icon: Search, title: t("landing.categories.c11t"), description: t("landing.categories.c11d"), color: "from-cyan-500 to-blue-600" },
    { icon: Sparkles, title: t("landing.categories.c12t"), description: t("landing.categories.c12d"), color: "from-pink-500 to-rose-600" },
  ];
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
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground text-foreground text-[10px] font-body uppercase tracking-[0.18em] font-semibold mb-4">
            {t("landing.categories.badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            {t("landing.categories.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            {t("landing.categories.subtitle")}
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
