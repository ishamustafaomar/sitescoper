import { describe, expect, it } from "vitest";
import { buildPromoPrompt, promoSize } from "./social-promo";

describe("website promo rules", () => {
  it("promotes the actual business without supplying audit scores", () => {
    const prompt = buildPromoPrompt({ brand: "Fresh Tacos", headline: "Tacos for lunch", detail: "Order online", context: "Handmade tacos and pickup orders", style: "collage" });
    expect(prompt).toContain('Business name: "Fresh Tacos"');
    expect(prompt).toContain('Headline: "Tacos for lunch"');
    expect(prompt).toContain("Preserve its actual identity");
    expect(prompt).toContain("No audit results, score ring");
    expect(prompt).not.toContain("94/100");
  });
  it("uses square and tall-story output sizes", () => {
    expect(promoSize("square")).toBe("1024x1024");
    expect(promoSize("story")).toBe("1008x1792");
  });
});