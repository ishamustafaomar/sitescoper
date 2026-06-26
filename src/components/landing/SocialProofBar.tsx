import { Star } from "lucide-react";

export function SocialProofBar() {
  return (
    <section className="border-y border-border bg-muted/20">
      <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-center gap-7 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,52%)] text-[hsl(45,90%,52%)]" />
            ))}
          </div>
          <span className="font-heading font-semibold text-sm">Loved by founders</span>
        </div>
        <span className="hidden sm:block w-px h-5 bg-border" />
        <span className="font-body text-sm text-muted-foreground">
          <strong className="text-foreground font-heading">2,400+</strong> sites scored this month
        </span>
        <span className="hidden sm:block w-px h-5 bg-border" />
        <span className="font-body text-sm text-muted-foreground">
          Trusted by SaaS, ecommerce &amp; indie teams
        </span>
      </div>
    </section>
  );
}