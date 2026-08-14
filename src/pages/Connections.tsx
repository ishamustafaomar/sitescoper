import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plug, Search, Sparkles, Bell, Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CONNECTORS, CONNECTOR_CATEGORIES, type ConnectorCategory } from "@/lib/connectors-catalog";
import { cn } from "@/lib/utils";

export default function Connections() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ConnectorCategory | "all">("all");
  const [requested, setRequested] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONNECTORS.filter(
      (c) => (cat === "all" || c.category === cat) && (!q || c.name.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  const request = (id: string, name: string) => {
    if (requested.includes(id)) return;
    setRequested((r) => [...r, id]);
    toast({ title: t("connections.requested", { app: name }), description: t("connections.requestedDesc") });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">
          <header className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-body text-primary">
              <Sparkles className="h-3 w-3" /> {t("connections.badge")}
            </div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
              <Plug className="h-6 w-6 text-muted-foreground" />
              {t("connections.title")}
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-2xl">{t("connections.subtitle")}</p>
          </header>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("connections.searchPlaceholder")}
                className="pl-9 font-body"
                aria-label={t("connections.searchPlaceholder")}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", ...CONNECTOR_CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c as ConnectorCategory | "all")}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-body transition-colors border",
                    cat === c
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {t(`connections.categories.${c}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => {
              const done = requested.includes(c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-[var(--shadow-sm)] hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-[13px] font-heading font-bold text-white"
                      style={{ backgroundColor: c.color }}
                      aria-hidden="true"
                    >
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-heading font-semibold text-sm truncate">{c.name}</h2>
                        {c.popular && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-body">
                            {t("connections.popular")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {t(`connections.blurbs.${c.blurb}`, { app: c.name })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">
                      {t(`connections.status.${c.status}`)}
                    </span>
                    <Button
                      size="sm"
                      variant={done ? "secondary" : "outline"}
                      className="text-xs font-body"
                      onClick={() => request(c.id, c.name)}
                      disabled={done}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                      {done ? t("connections.onList") : t("connections.notifyMe")}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground font-body text-center py-10">{t("connections.noResults")}</p>
          )}

          <section className="bg-card border border-border rounded-2xl p-6 space-y-2">
            <h2 className="font-heading font-semibold">{t("connections.missingTitle")}</h2>
            <p className="text-sm text-muted-foreground font-body">{t("connections.missingDesc")}</p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
