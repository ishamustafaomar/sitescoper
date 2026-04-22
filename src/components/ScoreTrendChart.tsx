import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScoreTrendChartProps {
  url: string;
  currentId?: string;
}

interface Point {
  date: string;
  fullDate: string;
  score: number;
}

export function ScoreTrendChart({ url, currentId }: ScoreTrendChartProps) {
  const [points, setPoints] = useState<Point[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("analysis_history")
        .select("id, overall_score, created_at")
        .eq("url", url)
        .order("created_at", { ascending: true })
        .limit(50);
      if (cancelled) return;
      const mapped = (data || []).map((r: any) => ({
        date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        fullDate: new Date(r.created_at).toLocaleString(),
        score: r.overall_score,
      }));
      setPoints(mapped);
    })();
    return () => { cancelled = true; };
  }, [url, currentId]);

  if (!points || points.length < 2) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-sm">Score over time</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          {points?.length === 1
            ? "Re-scan this URL after improvements to see your progress chart."
            : "Loading…"}
        </p>
      </div>
    );
  }

  const first = points[0].score;
  const last = points[points.length - 1].score;
  const delta = last - first;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-accent" : delta < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-sm">Score over time</h3>
          <span className="text-[10px] text-muted-foreground font-body">{points.length} scans</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-heading font-semibold ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {delta > 0 ? "+" : ""}{delta} pts
        </div>
      </div>

      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
              labelFormatter={(_, payload: any) => payload?.[0]?.payload?.fullDate ?? ""}
              formatter={(value: number) => [`${value}/100`, "Score"]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#scoreFill)"
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}