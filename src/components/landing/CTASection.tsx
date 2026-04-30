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
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-[hsl(280,70%,60%)]/10 p-10 md:p-14 text-center shadow-glow"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-body mb-5">
              <Sparkles className="h-3 w-3" />
              Ready to ship better?
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-5">
              Stop guessing.
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
                Start scoping.
              </span>
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Get brutally honest, actionable feedback on your website in under a minute. Free, no signup required.
            </p>
            <Button variant="hero" size="lg" onClick={onGetStarted} className="rounded-xl px-8">
              Analyze your website
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-xs font-body text-muted-foreground">
              or{" "}
              <Link to="/compare" className="text-primary hover:underline inline-flex items-center gap-1">
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
