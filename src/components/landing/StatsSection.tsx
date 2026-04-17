import { motion } from "framer-motion";

const stats = [
  { value: "60s", label: "Average analysis time" },
  { value: "8+", label: "Pages crawled per site" },
  { value: "6", label: "Analysis dimensions" },
  { value: "100%", label: "Free to try" },
];

export function StatsSection() {
  return (
    <section className="py-16 px-4 border-y border-border bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-body">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
