import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

// Sitewide footer. Adds internal links to every public page —
// boosts crawl depth and gives every page a consistent set of
// authoritative outbound links.
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/40 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="gradient-primary p-1.5 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold">SiteScoper</span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The instant AI website audit tool for founders, indie hackers, and small business owners.
          </p>
        </div>

        <nav aria-label="Product" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Product</h2>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-primary">AI Website Analyzer</Link></li>
            <li><Link to="/ai-website-audit-tool" className="hover:text-primary">AI Website Audit Tool</Link></li>
            <li><Link to="/white-label-seo-reports" className="hover:text-primary">White Label SEO Reports</Link></li>
            <li><Link to="/compare" className="hover:text-primary">Compare Two Sites</Link></li>
            <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
          </ul>
        </nav>

        <nav aria-label="Resources" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Resources</h2>
          <ul className="space-y-2">
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/blog/how-to-audit-a-website-for-seo" className="hover:text-primary">How to audit a website for SEO</Link></li>
            <li><Link to="/blog/free-website-audit-checklist" className="hover:text-primary">Free website audit checklist</Link></li>
            <li><Link to="/blog/core-web-vitals-explained-for-founders" className="hover:text-primary">Core Web Vitals explained</Link></li>
            <li><Link to="/blog/small-business-seo-guide" className="hover:text-primary">Small business SEO guide</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company" className="text-sm">
          <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Company</h2>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
            <li><Link to="/auth" className="hover:text-primary">Sign in</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© {year} SiteScoper. All rights reserved.</span>
          <span>Built for founders who actually ship the fixes.</span>
        </div>
      </div>
    </footer>
  );
}
