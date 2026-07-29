// Migrated from supabase/functions/semrush-overview (Deno edge function).
import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/semrush";

type Input = { url: string; database?: string };

type SemrushPayload = {
  data?: { columnNames?: string[]; rows?: unknown[][] };
  error?: string;
  status?: number;
} | null;

function rowsToObjects(payload: SemrushPayload): Record<string, unknown>[] {
  const cols: string[] = payload?.data?.columnNames ?? [];
  const rows: unknown[][] = payload?.data?.rows ?? [];
  return rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
}

async function semrushGet(path: string, params: Record<string, string>): Promise<SemrushPayload> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;
  if (!LOVABLE_API_KEY || !SEMRUSH_API_KEY) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY_URL}${path}?${qs}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": SEMRUSH_API_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Semrush ${path} failed [${res.status}]: ${text}`);
    return { error: text, status: res.status };
  }
  return (await res.json()) as SemrushPayload;
}

export const semrushOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as Partial<Input>;
    if (!data.url || typeof data.url !== "string") throw new Error("url required");
    return { url: data.url, database: data.database ?? "us" };
  })
  .handler(async ({ data }) => {
    const { requireSupabaseAuth } = await import("@/lib/supabase.server");
    await requireSupabaseAuth();

    if (!process.env.SEMRUSH_API_KEY) return { connected: false as const };

    let domain: string;
    try {
      domain = new URL(data.url).hostname.replace(/^www\./, "");
    } catch {
      throw new Error("invalid url");
    }
    const database = data.database;

    const [ranksRes, organicRes, blOverviewRes, blRefdomainsRes] = await Promise.all([
      semrushGet("/domains/domain_ranks", { domain, database, export_columns: "Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac" }),
      semrushGet("/domains/domain_organic", { domain, database, display_limit: "15", export_columns: "Ph,Po,Nq,Cp,Tr,Ur" }),
      semrushGet("/backlinks/backlinks_overview", { target: domain, target_type: "root_domain" }),
      semrushGet("/backlinks/backlinks_refdomains", { target: domain, target_type: "root_domain", display_limit: "10" }),
    ]);

    const quotaError = [ranksRes, organicRes, blOverviewRes, blRefdomainsRes].find(
      (r) => r?.error && /TOTAL LIMIT EXCEEDED|limit exceeded/i.test(String(r.error)),
    );

    return {
      connected: true as const,
      domain,
      quotaExceeded: !!quotaError,
      ranks: rowsToObjects(ranksRes)[0] || null,
      organic: rowsToObjects(organicRes),
      backlinks: rowsToObjects(blOverviewRes)[0] || null,
      refdomains: rowsToObjects(blRefdomainsRes),
    };
  });