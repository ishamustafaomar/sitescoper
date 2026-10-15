/** Missing scores are not zero; a measured zero still counts in the average. */
export function averageHealthScore(sites: ReadonlyArray<{ last_score: number | null }>): number | null {
  const scores = sites.flatMap((site) => site.last_score == null ? [] : [site.last_score]);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
}