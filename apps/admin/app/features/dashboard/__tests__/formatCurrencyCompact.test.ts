import { describe, expect, test } from "vitest";
import { formatCurrencyCompact } from "../helpers/formatCurrencyCompact";

describe("formatCurrencyCompact", () => {
  test("shows small amounts in full pesos", () => {
    expect(formatCurrencyCompact(0)).toBe("₱0");
    expect(formatCurrencyCompact(999)).toBe("₱999");
  });

  test("abbreviates thousands with one decimal", () => {
    expect(formatCurrencyCompact(1000)).toBe("₱1.0k");
    expect(formatCurrencyCompact(12_500)).toBe("₱12.5k");
  });

  test("abbreviates millions with one decimal", () => {
    expect(formatCurrencyCompact(1_000_000)).toBe("₱1.0M");
    expect(formatCurrencyCompact(2_450_000)).toBe("₱2.5M");
  });
});
