import type { AnalysisSuggestion } from "@/lib/api";

export type FindingBasis = "verified" | "hypothesis";

/**
 * A finding counts as a "Verified check" only when a technical check confirmed it
 * and recorded what it checked. Everything else — including every AI-written finding
 * without a recorded check — is an "AI hypothesis".
 */
export function findingBasis(s: Pick<AnalysisSuggestion, "verification" | "verified_by">): FindingBasis {
  return s.verification === "verified" && !!s.verified_by?.trim() ? "verified" : "hypothesis";
}
