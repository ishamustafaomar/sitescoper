import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Loader2, PenLine, ArrowRight, Lock } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { writeCopy, type CopyResult } from "@/lib/copywriter.functions";

function CopyText({ text, className = "" }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`group flex items-start justify-between gap-3 border border-border bg-card p-3 ${className}`}>
      <p className="font-body text-sm leading-relaxed">{text}</p>
      <button
        type="button"
        aria-label="Copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          } catch {
            /* clipboard blocked */
          }
        }}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Results({ r }: { r: CopyResult }) {
  return (
    <div className="space-y-10">
      <div className="border border-border bg-muted/30 p-4 font-body text-sm">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Who this page is for</div>
        {r.audience}
      </div>

      <Section title="Headline options">
        {r.current.h1 && <p className="text-xs text-muted-foreground font-body">Now: <span className="line-through">{r.current.h1}</span></p>}
        {r.headlines.map((h) => (
          <div key={h.text} className="space-y-1">
            <CopyText text={h.text} className="text-lg" />
            <p className="text-xs text-muted-foreground font-body pl-1">{h.why}</p>
          </div>
        ))}
      </Section>

      <Section title="Subheadline">
        <CopyText text={r.subheadline} />
      </Section>

      <div className="grid gap-8 md:grid-cols-2">
        <Section title="Button labels">
          {r.current.ctas.length > 0 && <p className="text-xs text-muted-foreground font-body">Now: {r.current.ctas.slice(0, 4).join(" · ")}</p>}
          {r.ctas.map((c) => <CopyText key={c} text={c} />)}
        </Section>
        <Section title="Value points">
          {r.valueProps.map((v) => <CopyText key={v} text={v} />)}
        </Section>
      </div>

      <Section title="Google title & description">
        {r.current.title && <p className="text-xs text-muted-foreground font-body">Now: {r.current.title}</p>}
        <CopyText text={r.metaTitle} />
        <CopyText text={r.metaDescription} />
      </Section>

      {r.notes && (
        <p className="font-body text-sm text-muted-foreground border-l-2 border-primary pl-3">{r.notes}</p>
      )}
    </div>
  );
}

export default function Copywriter() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const m = useMutation({ mutationFn: () => writeCopy({ data: { url: url.trim(), goal: goal.trim() } }) });
  const res = m.data;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Free tool · AI copywriter</p>
          <h1 className="font-heading text-4xl md:text-5xl leading-tight">Paste your link. Get better words for your website.</h1>
          <p className="font-body text-muted-foreground">
            We read your page and write new headlines, a subheadline, button labels, value points and a Google title and description. Only from what's really on your page, nothing made up. Your first try is free, no account needed.
          </p>
        </header>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) m.mutate();
          }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input aria-label="Website address" placeholder="yoursite.com" value={url} onChange={(e) => setUrl(e.target.value)} className="h-12" />
            <Button type="submit" className="h-12" disabled={m.isPending || !url.trim()}>
              {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
              {m.isPending ? "Writing…" : "Write my copy"}
            </Button>
          </div>
          <Input aria-label="Goal (optional)" placeholder="Optional: what should visitors do? e.g. book a demo" value={goal} onChange={(e) => setGoal(e.target.value)} />
          {m.isPending && <p className="text-sm text-muted-foreground font-body" role="status">Reading your page and writing options. This takes about 20–40 seconds.</p>}
        </form>

        {m.isError && <p className="text-sm text-destructive font-body">Something went wrong. Please try again.</p>}

        {res && !res.ok && (
          res.needsAccount ? (
            <div className="border-2 border-primary/30 bg-primary/5 p-6 space-y-3">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /><h2 className="font-heading text-xl">Keep writing with a free account</h2></div>
              <p className="font-body text-sm text-muted-foreground">You've used your free try. A free account gives you more rewrites every day, plus your audits saved to your dashboard.</p>
              <Button asChild><Link to={`/auth?redirect=${encodeURIComponent("/tools/copywriter")}`}>Create free account <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          ) : (
            <p className="text-sm text-destructive font-body">{res.error}</p>
          )
        )}

        {res && res.ok && (
          <>
            <Results r={res.result} />
            <div className="border border-border p-6 space-y-3">
              <h2 className="font-heading text-xl">Words are one part. See everything else.</h2>
              <p className="font-body text-sm text-muted-foreground">Run a full audit for ranked fixes across design, SEO, speed and conversion.</p>
              <Button asChild variant="outline"><Link to={`/?url=${encodeURIComponent(res.result.url)}`}>Audit this page <ArrowRight className="h-4 w-4" /></Link></Button>
              {!user && <p className="text-xs text-muted-foreground font-body">Want more rewrites? <Link to={`/auth?redirect=${encodeURIComponent("/tools/copywriter")}`} className="underline">Create a free account</Link>.</p>}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
