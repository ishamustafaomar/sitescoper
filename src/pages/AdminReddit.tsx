import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { redditAutopost, redditAnalytics } from "@/lib/reddit.functions";

export default function AdminReddit() {
  const { t } = useTranslation();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [pool, setPool] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, q] = await Promise.all([
      supabase.from("reddit_subreddit_pool").select("*").order("total_signups", { ascending: false }),
      supabase.from("reddit_posts").select("*, reddit_post_metrics(score, num_comments, signups_attributed, removed, checked_at)").order("created_at", { ascending: false }).limit(30),
    ]);
    setPool(p.data || []);
    setPosts(q.data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const run = async (fn: "reddit-autopost" | "reddit-analytics") => {
    setBusy(fn);
    try {
      const data = fn === "reddit-autopost" ? await redditAutopost() : await redditAnalytics();
      toast({ title: `${fn} ok`, description: JSON.stringify(data).slice(0, 200) });
      load();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  if (roleLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <div className="p-8">{t("pages.adminReddit.adminOnly")}</div>;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t("pages.adminReddit.title")}</h1>
        <div className="flex gap-2">
          <Button onClick={() => run("reddit-autopost")} disabled={busy !== null}>
            {busy === "reddit-autopost" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {t("pages.adminReddit.postNow")}
          </Button>
          <Button variant="outline" onClick={() => run("reddit-analytics")} disabled={busy !== null}>
            {busy === "reddit-analytics" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            {t("pages.adminReddit.refreshMetrics")}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="font-heading font-semibold mb-3">{t("pages.adminReddit.poolTitle", { count: pool.length })}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th>{t("pages.adminReddit.colSub")}</th><th>{t("pages.adminReddit.colStatus")}</th><th>{t("pages.adminReddit.colPosts")}</th><th>{t("pages.adminReddit.colRemovals")}</th><th>{t("pages.adminReddit.colSignups")}</th><th>{t("pages.adminReddit.colAvgScore")}</th><th>{t("pages.adminReddit.colBurnReason")}</th></tr></thead>
            <tbody>
              {pool.map(p => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2">r/{p.subreddit}</td>
                  <td><Badge variant={p.status === "active" ? "default" : "destructive"}>{p.status}</Badge></td>
                  <td>{p.posts_count}</td>
                  <td>{p.removals_count}</td>
                  <td>{p.total_signups}</td>
                  <td>{Number(p.avg_score).toFixed(1)}</td>
                  <td className="text-xs text-muted-foreground">{p.burn_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-heading font-semibold mb-3">{t("pages.adminReddit.recentPostsTitle", { count: posts.length })}</h2>
        <div className="space-y-3">
          {posts.map(p => {
            const latest = (p.reddit_post_metrics || []).sort((a: any, b: any) => +new Date(b.checked_at) - +new Date(a.checked_at))[0];
            return (
              <div key={p.id} className="border border-border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">r/{p.subreddit} · {p.title}</span>
                  <Badge variant={p.status === "posted" ? "default" : p.status === "removed" ? "destructive" : "secondary"}>{p.status}</Badge>
                </div>
                {latest && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {latest.score} upvotes · {latest.num_comments} comments · {latest.signups_attributed} signups
                  </div>
                )}
                {p.reddit_permalink && <a href={p.reddit_permalink} target="_blank" rel="noreferrer" className="text-xs text-primary underline">{t("pages.adminReddit.viewOnReddit")}</a>}
                {p.failure_reason && <div className="text-xs text-destructive mt-1">{p.failure_reason}</div>}
              </div>
            );
          })}
          {loading && <Loader2 className="animate-spin" />}
        </div>
      </Card>
    </div>
  );
}