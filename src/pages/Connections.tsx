import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plug, Search, Sparkles, Bell, Check, Send, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CONNECTORS, CONNECTOR_CATEGORIES, type ConnectorCategory } from "@/lib/connectors-catalog";
import { cn } from "@/lib/utils";

export default function Connections() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ConnectorCategory | "all">("all");
  const [requested, setRequested] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("integration_requests")
        .select("connector_id")
        .eq("user_id", user.id);
      if (active && data) {
        setRequested(data.map((r: { connector_id: string | null }) => r.connector_id).filter(Boolean) as string[]);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONNECTORS.filter(
      (c) => (cat === "all" || c.category === cat) && (!q || c.name.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  const request = async (id: string, name: string) => {
    if (requested.includes(id) || pending) return;
    if (!user) {
      toast({ title: t("connections.signInRequired"), variant: "destructive" });
      return;
    }
    setPending(id);
    const { error } = await supabase.from("integration_requests").insert({
      user_id: user.id,
      user_email: user.email ?? null,
      connector_id: id,
      connector_name: name,
    });
    setPending(null);
    if (error) {
      toast({ title: t("connections.requestFailed"), variant: "destructive" });
      return;
    }
    setRequested((r) => [...r, id]);
    toast({ title: t("connections.requested", { app: name }), description: t("connections.requestedDesc") });
  };

  const submitOther = async () => {
    const name = otherName.trim();
    if (!name || sending) return;
    if (!user) {
      toast({ title: t("connections.signInRequired"), variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("integration_requests").insert({
      user_id: user.id,
      user_email: user.email ?? null,
      connector_id: null,
      connector_name: name,
      note: otherNote.trim() || null,
    });
    setSending(false);
    if (error) {
      toast({ title: t("connections.requestFailed"), variant: "destructive" });
      return;
    }
    setOtherName("");
    setOtherNote("");
    toast({ title: t("connections.missingSent"), description: t("connections.missingSentDesc") });
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
                      disabled={done || pending === c.id}
                    >
                      {pending === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Bell className="h-3.5 w-3.5" />
                      )}
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
            <div className="pt-3 space-y-3">
              <Input
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder={t("connections.missingNamePlaceholder")}
                className="font-body"
                maxLength={80}
                aria-label={t("connections.missingNamePlaceholder")}
              />
              <Textarea
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                placeholder={t("connections.missingNotePlaceholder")}
                className="font-body min-h-[80px]"
                maxLength={1000}
                aria-label={t("connections.missingNotePlaceholder")}
              />
              <Button onClick={submitOther} disabled={!otherName.trim() || sending} className="font-body">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("connections.missingSubmit")}
              </Button>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
