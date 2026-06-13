import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreRing } from "@/components/ScoreRing";
import { runSeoAudit, type SeoAuditResult } from "@/lib/seoAudit";
import { CheckRow } from "./CheckRow";
import { useToast } from "@/hooks/use-toast";

export function SeoAuditTab({ url }: { url: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await runSeoAudit(url);
      setResult(r);
    } catch (e: any) {
      setError(e.message || "Audit failed");
      toast({ title: "SEO audit failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result && !loading) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-body">Auditing on-page SEO…</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-destructive font-body">{error}</p>
        <Button variant="outline" size="sm" onClick={run}>
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  if (!result) return null;

  const failed = result.checks.filter((c) => c.status === "fail");
  const warnings = result.checks.filter((c) => c.status === "warn");
  const passed = result.checks.filter((c) => c.status === "pass");

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <ScoreRing score={result.score} size={64} />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> On-page SEO audit
          </h3>
          <p className="text-xs text-muted-foreground font-body">
            {passed.length} passed · {warnings.length} warnings · {failed.length} failed
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={run} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> Re-run
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["failed", "warnings"]} className="space-y-2">
        {failed.length > 0 && (
          <AccordionItem value="failed" className="bg-card border border-border rounded-2xl px-4">
            <AccordionTrigger className="font-heading text-sm">
              <span className="text-destructive">Failed ({failed.length})</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              {failed.map((c) => <CheckRow key={c.id} check={c} />)}
            </AccordionContent>
          </AccordionItem>
        )}
        {warnings.length > 0 && (
          <AccordionItem value="warnings" className="bg-card border border-border rounded-2xl px-4">
            <AccordionTrigger className="font-heading text-sm">
              <span className="text-primary">Warnings ({warnings.length})</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              {warnings.map((c) => <CheckRow key={c.id} check={c} />)}
            </AccordionContent>
          </AccordionItem>
        )}
        {passed.length > 0 && (
          <AccordionItem value="passed" className="bg-card border border-border rounded-2xl px-4">
            <AccordionTrigger className="font-heading text-sm">
              <span className="text-accent">Passed ({passed.length})</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              {passed.map((c) => <CheckRow key={c.id} check={c} />)}
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="headings" className="bg-card border border-border rounded-2xl px-4">
          <AccordionTrigger className="font-heading text-sm">
            Headings outline ({result.headings.length})
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {result.headings.length === 0 ? (
              <p className="text-xs text-muted-foreground font-body">No headings detected.</p>
            ) : (
              <ul className="space-y-1 text-xs font-body">
                {result.headings.map((h, i) => (
                  <li key={i} className="flex gap-2" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                    <span className="text-muted-foreground shrink-0">H{h.level}</span>
                    <span className="truncate">{h.text || <em className="text-muted-foreground">(empty)</em>}</span>
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="head" className="bg-card border border-border rounded-2xl px-4">
          <AccordionTrigger className="font-heading text-sm">Raw head data</AccordionTrigger>
          <AccordionContent className="pb-3">
            <pre className="text-[11px] font-mono bg-muted/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(result.head, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}