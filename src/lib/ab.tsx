/**
 * Lightweight always-on A/B testing.
 *
 * - Each browser gets a stable visitor id.
 * - A visitor is bucketed deterministically (hash of visitor id + test key),
 *   so the same person always sees the same version.
 * - Exposure and conversion are written once per visitor per test.
 * - When a test has finished, its winning version becomes the permanent
 *   default for that surface with no code change.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Surface = "home_hero" | "home_cta" | "pricing_cta" | "report_gate";

export interface VariantConfig {
  id: string;
  [key: string]: unknown;
}

export interface Experiment {
  key: string;
  surface: string;
  goal: string;
  status: "queued" | "running" | "completed" | "archived";
  winner: string | null;
  variants: VariantConfig[];
}

const VISITOR_KEY = "ss_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id || id.length < 12) {
      id = `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "no-storage-visitor";
  }
}

function bucket(visitorId: string, key: string, count: number): number {
  let h = 2166136261;
  const input = `${visitorId}:${key}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, count);
}

interface AbContextValue {
  experiments: Experiment[];
  ready: boolean;
}

const AbContext = createContext<AbContextValue>({ experiments: [], ready: false });

export function AbProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("ab_experiments")
          .select("key,surface,goal,status,winner,variants,ended_at")
          .in("status", ["running", "completed"])
          .order("ended_at", { ascending: false, nullsFirst: true })
          .limit(60);
        if (!cancelled) {
          setExperiments(
            (data ?? []).map((row) => ({
              key: row.key,
              surface: row.surface,
              goal: row.goal,
              status: row.status as Experiment["status"],
              winner: row.winner,
              variants: (row.variants as unknown as VariantConfig[]) ?? [],
            })),
          );
        }
      } catch {
        /* tests are an optimisation — never block the page */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ experiments, ready }), [experiments, ready]);
  return <AbContext.Provider value={value}>{children}</AbContext.Provider>;
}

const recorded = new Set<string>();

async function record(experimentKey: string, variant: string, event: string) {
  const visitorId = getVisitorId();
  const dedupe = `${experimentKey}:${visitorId}:${event}`;
  if (recorded.has(dedupe)) return;
  recorded.add(dedupe);
  try {
    await supabase
      .from("ab_events")
      .insert({ experiment_key: experimentKey, variant, visitor_id: visitorId, event });
  } catch {
    /* a lost measurement must never break the page */
  }
}

export interface UseExperimentResult<T> {
  /** The winning (or assigned) configuration for this surface. */
  config: T | null;
  variant: string;
  /** Call when the visitor completes the goal for this surface. */
  convert: () => void;
  ready: boolean;
}

/**
 * Resolves the version of a surface this visitor should see.
 * A finished test's winner becomes the permanent default automatically.
 */
export function useExperiment<T extends VariantConfig = VariantConfig>(
  surface: Surface,
  options?: { enabled?: boolean },
): UseExperimentResult<T> {
  const { experiments, ready } = useContext(AbContext);
  // A visitor who cannot be shown the test copy (e.g. the variants are only
  // written in one language) must stay out of the test entirely, so they see
  // the normal translated page and never skew the results.
  const enabled = options?.enabled !== false;

  const live = enabled
    ? experiments.find((e) => e.surface === surface && e.status === "running")
    : undefined;
  const settled = enabled
    ? experiments.find(
        (e) => e.surface === surface && e.status === "completed" && e.winner,
      )
    : undefined;

  const active = live ?? null;
  const variant = active
    ? (active.variants[bucket(getVisitorId(), active.key, active.variants.length)]?.id ?? "control")
    : (settled?.winner ?? "control");

  const source = active ?? settled ?? null;
  const config = (source?.variants.find((v) => v.id === variant) ?? null) as T | null;

  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    void record(active.key, variant, "exposure");
  }, [active?.key, variant]);

  const convert = useCallback(() => {
    if (!active) return;
    void record(active.key, variant, active.goal);
  }, [active?.key, active?.goal, variant]);

  return { config, variant, convert, ready };
}
