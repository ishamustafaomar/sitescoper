import { describe, expect, it } from "vitest";
import { averageHealthScore } from "./dashboard-health";

describe("dashboard health data states", () => {
  it("keeps unscanned sites distinct from a measured zero", () => {
    expect(averageHealthScore([{ last_score: null }])).toBeNull();
    expect(averageHealthScore([{ last_score: 0 }])).toBe(0);
  });
  it("includes zero scores and excludes missing scores", () => {
    expect(averageHealthScore([{ last_score: 0 }, { last_score: 80 }, { last_score: null }])).toBe(40);
  });
});