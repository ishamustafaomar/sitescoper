import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toolsHub } from "@/content/tools";

const ToolsHub = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <AppHeader />
    <main className="flex-1 w-full">
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-12 md:pt-20 md:pb-16">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground/80">Free tools</li>
            </ol>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-4">Free, no account</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-balance mb-5 max-w-3xl">Free SEO &amp; website tools</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Small, focused utilities built from the same checks that power the full SiteScoper audit. No signup, no email, nothing stored.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {toolsHub.map((tool) => (
            <li key={tool.href} className="border border-border bg-card hover:border-foreground transition-colors">
              <Link to={tool.href} className="block p-6 md:p-8 h-full">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{tool.eyebrow}</p>
                <h2 className="font-heading text-2xl font-semibold mb-2">{tool.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-5">{tool.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">Open tool <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">Why we give these away</h2>
          <div className="space-y-4 text-[17px] text-foreground/85 leading-relaxed">
            <p>
              A full website audit covers dozens of checks across UX, SEO, copy, conversion and performance. Some of those checks are useful on their own, several times a week, without needing the whole report: is this share image going to render on LinkedIn? Does this site have an llms.txt yet?
            </p>
            <p>
              So we broke them out. Each tool runs the same code as the corresponding section of the audit, returns in seconds, and links to the full report when you want the rest of the picture. If there is a check you wish existed as a standalone tool, <Link to="/compare" className="underline underline-offset-4 hover:text-primary">tell us</Link>.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link to="/ux-audit" className="border border-border px-3 py-1.5 hover:border-foreground">UX audit</Link>
            <Link to="/cro-audit" className="border border-border px-3 py-1.5 hover:border-foreground">CRO audit</Link>
            <Link to="/landing-page-audit" className="border border-border px-3 py-1.5 hover:border-foreground">Landing page audit</Link>
            <Link to="/seo-audit-report" className="border border-border px-3 py-1.5 hover:border-foreground">SEO audit report</Link>
            <Link to="/blog" className="border border-border px-3 py-1.5 hover:border-foreground">Guides</Link>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default ToolsHub;
