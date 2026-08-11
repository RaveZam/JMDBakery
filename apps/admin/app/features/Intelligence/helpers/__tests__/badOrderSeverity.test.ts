import { describe, expect, test } from "vitest";
import { badOrderSeverity } from "../badOrderSeverity";

describe("badOrderSeverity", () => {
  test("classifies below 10% as healthy", () => {
    expect(badOrderSeverity(0).level).toBe("healthy");
    expect(badOrderSeverity(9.9).level).toBe("healthy");
  });

  test("classifies 10% up to 20% as watch", () => {
    expect(badOrderSeverity(10).level).toBe("watch");
    expect(badOrderSeverity(19.9).level).toBe("watch");
  });

  test("classifies 20% and above as critical", () => {
    expect(badOrderSeverity(20).level).toBe("critical");
    expect(badOrderSeverity(100).level).toBe("critical");
  });

  test("returns a matching label and style classes for each level", () => {
    expect(badOrderSeverity(5)).toEqual({
      level: "healthy",
      label: "Healthy",
      textClass: "text-foreground",
      fillClass: "bg-primary",
    });
    expect(badOrderSeverity(15)).toEqual({
      level: "watch",
      label: "Watch",
      textClass: "text-gold",
      fillClass: "bg-gold",
    });
    expect(badOrderSeverity(25)).toEqual({
      level: "critical",
      label: "Critical",
      textClass: "text-destructive",
      fillClass: "bg-destructive",
    });
  });
});
