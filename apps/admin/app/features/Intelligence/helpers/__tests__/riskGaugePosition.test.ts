import { describe, expect, test } from "vitest";
import { riskGaugePosition } from "../riskGaugePosition";

describe("riskGaugePosition", () => {
  test("maps each 5% band boundary to a quarter of the gauge", () => {
    expect(riskGaugePosition(0)).toBe(0);
    expect(riskGaugePosition(5)).toBe(25);
    expect(riskGaugePosition(10)).toBe(50);
    expect(riskGaugePosition(15)).toBe(75);
    expect(riskGaugePosition(20)).toBe(100);
  });

  test("pins rates past 20% to the far right", () => {
    expect(riskGaugePosition(42)).toBe(100);
  });

  test("pins negative rates to the far left", () => {
    expect(riskGaugePosition(-3)).toBe(0);
  });
});
