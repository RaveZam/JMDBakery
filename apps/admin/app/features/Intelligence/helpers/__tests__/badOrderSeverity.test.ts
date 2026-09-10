import { describe, expect, test } from "vitest";
import { badOrderSeverity } from "../badOrderSeverity";

describe("badOrderSeverity", () => {
  test("classifies below 5% as healthy", () => {
    expect(badOrderSeverity(0).level).toBe("healthy");
    expect(badOrderSeverity(4.9).level).toBe("healthy");
  });

  test("classifies 5% up to 10% as needs attention", () => {
    expect(badOrderSeverity(5).level).toBe("needs-attention");
    expect(badOrderSeverity(9.9).level).toBe("needs-attention");
  });

  test("classifies 10% up to 15% as high risk", () => {
    expect(badOrderSeverity(10).level).toBe("high-risk");
    expect(badOrderSeverity(14.9).level).toBe("high-risk");
  });

  test("classifies 15% and above as risky", () => {
    expect(badOrderSeverity(15).level).toBe("risky");
    expect(badOrderSeverity(100).level).toBe("risky");
  });

  test("returns a matching label and style classes for each level", () => {
    expect(badOrderSeverity(3)).toEqual({
      level: "healthy",
      label: "Healthy",
      textClass: "text-foreground",
      fillClass: "bg-primary",
    });
    expect(badOrderSeverity(7)).toEqual({
      level: "needs-attention",
      label: "Needs attention",
      textClass: "text-gold",
      fillClass: "bg-gold",
    });
    expect(badOrderSeverity(12)).toEqual({
      level: "high-risk",
      label: "High risk",
      textClass: "text-orange-600",
      fillClass: "bg-orange-600",
    });
    expect(badOrderSeverity(25)).toEqual({
      level: "risky",
      label: "Risky",
      textClass: "text-destructive",
      fillClass: "bg-destructive",
    });
  });
});
