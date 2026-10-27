import { describe, it, expect } from "vitest";
import { findingBasis } from "./finding-verification";

describe("findingBasis", () => {
  it("treats findings with no recorded check as AI hypotheses", () => {
    expect(findingBasis({})).toBe("hypothesis");
  });
  it("does not trust a 'verified' label without a recorded check", () => {
    expect(findingBasis({ verification: "verified", verified_by: " " })).toBe("hypothesis");
  });
  it("labels findings confirmed by a recorded technical check as verified", () => {
    expect(findingBasis({ verification: "verified", verified_by: "3 images have empty alt" })).toBe("verified");
  });
});
