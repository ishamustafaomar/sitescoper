import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4 text-white">
              Ready to hear the truth?
            </h2>
            <p className="font-body text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed text-white/90">
              Run a free audit and get the 3 fixes worth shipping this week. No credit card, 60 seconds.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="rounded-xl px-8 bg-white text-primary hover:bg-white/90 border-0 font-heading font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              Analyze my website
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-xs font-body text-white/80">
              Used by 2,400+ founders this month ·{" "}
              <Link to="/compare" className="underline inline-flex items-center gap-1">
                <Swords className="h-3 w-3" />
                battle a competitor
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
