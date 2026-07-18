import { describe, expect, test } from "vitest";
import { formatCurrencyPHP } from "../helpers/formatCurrencyPHP";

describe("formatCurrencyPHP", () => {
  test("prefixes the peso sign", () => {
    expect(formatCurrencyPHP(0)).toBe("₱0");
  });

  test("groups thousands", () => {
    expect(formatCurrencyPHP(1234567)).toBe("₱1,234,567");
  });

  test("drops the centavos", () => {
    expect(formatCurrencyPHP(1234.56)).toBe("₱1,235");
  });
});
