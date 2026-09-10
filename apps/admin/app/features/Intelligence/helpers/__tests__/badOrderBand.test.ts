import { describe, expect, test } from "vitest";
import { badOrderBand } from "../badOrderBand";

describe("badOrderBand", () => {
  test("under 5% is healthy", () => {
    expect(badOrderBand(0)).toEqual({ band: "healthy", label: "Healthy" });
    expect(badOrderBand(4.9).band).toBe("healthy");
  });

  test("5% up to 10% is needs attention", () => {
    expect(badOrderBand(5)).toEqual({
      band: "needs-attention",
      label: "Needs attention",
    });
    expect(badOrderBand(9.9).band).toBe("needs-attention");
  });

  test("10% up to 15% is high risk", () => {
    expect(badOrderBand(10)).toEqual({ band: "high-risk", label: "High risk" });
    expect(badOrderBand(14.9).band).toBe("high-risk");
  });

  test("15% and above is risky", () => {
    expect(badOrderBand(15)).toEqual({ band: "risky", label: "Risky" });
    expect(badOrderBand(100).band).toBe("risky");
  });
});
