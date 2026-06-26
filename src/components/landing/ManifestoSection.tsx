import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function ManifestoSection() {
  return (
    <section className="px-4 pt-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl px-8 py-12 md:px-10 md:py-14 text-center border border-primary/20"
          style={{
            background:
              "linear-gradient(160deg, hsl(var(--primary) / 0.08), transparent)",
          }}
        >
          <Quote className="h-7 w-7 mx-auto mb-4 text-primary/50" aria-hidden="true" />
          <p className="font-heading font-semibold text-2xl md:text-3xl leading-snug tracking-tight">
            Most tools hand you a 200-row checklist. SiteScoper hands you the{" "}
            <span className="text-primary">three things</span> actually worth doing this week.
          </p>
        </motion.div>
      </div>
    </section>
  );
}