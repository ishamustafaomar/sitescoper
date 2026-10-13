import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";

const providers = [
  { name: "SiteScoper", key: "s", url: "https://sitescoper.com/pricing" },
  { name: "RoastFast", key: "r", url: "https://www.roastfa.st/" },
  { name: "PageRoast", key: "p", url: "https://pageroast.io/pricing" },
  { name: "Roast My Web", key: "w", url: "https://www.roastmyweb.com/" },
];

export function WebsiteRoastComparison() {
  const { t } = useTranslation();
  const text = (key: string) => t(`roastComparison.${key}`);
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-12 font-body">
        <header className="space-y-5 pb-10 max-w-3xl">
          <p className="text-sm text-accent">SiteScoper · RoastFast · PageRoast · Roast My Web</p>
          <h1 className="font-heading text-4xl md:text-5xl">{text("title")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{text("intro")}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{text("disclosure")}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/">{text("audit")}<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button variant="outline" asChild><Link to="/#sample-report">{text("sample")}</Link></Button>
          </div>
        </header>
        <section className="border-t border-border py-10 space-y-6" aria-labelledby="roast-choice">
          <h2 id="roast-choice" className="font-heading text-3xl">{text("choose")}</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            {providers.map((provider, i) => (
              <article key={provider.key} className="space-y-3">
                <h3 className="font-heading text-2xl">{provider.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{text(provider.key)}{" "}<a href={provider.url} className="underline underline-offset-4 text-foreground">[{i + 1}]</a></p>
              </article>
            ))}
          </div>
        </section>
        <section className="border-t border-border py-10 space-y-5" aria-labelledby="roast-offers">
          <h2 id="roast-offers" className="font-heading text-3xl">{text("table")}</h2>
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">{text("table")}</caption>
              <thead className="bg-muted/50"><tr><th scope="col" className="p-4">{text("tool")}</th><th scope="col" className="p-4">{text("entry")}</th></tr></thead>
              <tbody className="divide-y divide-border">
                {providers.map((provider, i) => <tr key={provider.key}><th scope="row" className="p-4 align-top font-medium">{provider.name}</th><td className="p-4 text-muted-foreground leading-relaxed">{text(`${provider.key}Entry`)}{" "}<a href={provider.url} className="underline text-foreground">[{i + 1}]</a></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
        <section className="border-t border-border py-10 space-y-4">
          <h2 className="font-heading text-3xl">{text("meaning")}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{text("meaningBody")}</p>
        </section>
        <section className="border-t border-border py-10 space-y-4">
          <h2 className="font-heading text-3xl">{text("next")}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{text("nextBody")}</p>
          <Button variant="outline" asChild><Link to="/compare">{text("compare")}<ArrowRight className="h-4 w-4" /></Link></Button>
        </section>
        <section className="border-t border-border py-10 space-y-6">
          <h2 className="font-heading text-3xl">{text("faq")}</h2>
          {[1, 2, 3].map((n) => <div key={n} className="space-y-2"><h3 className="font-heading text-xl">{text(`q${n}`)}</h3><p className="text-muted-foreground leading-relaxed max-w-3xl">{text(`a${n}`)}</p></div>)}
        </section>
        <section className="border-t border-border pt-10 space-y-4">
          <h2 className="font-heading text-2xl">{text("sources")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{text("sourcesBody")}</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            {providers.map((provider) => <li key={provider.key}><a href={provider.url} className="inline-flex items-center gap-2 underline underline-offset-4">{provider.name}<ExternalLink className="h-3 w-3" aria-hidden="true" /></a></li>)}
          </ol>
          <a href="https://pageroast.io/" className="text-sm underline underline-offset-4">PageRoast — {text("focus")}</a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}