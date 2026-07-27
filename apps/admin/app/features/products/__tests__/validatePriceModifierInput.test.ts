import { describe, expect, test } from "vitest";
import { validatePriceModifierInput } from "../helpers/validatePriceModifierInput";

describe("validatePriceModifierInput", () => {
  test("accepts a keyword and a negative modifier", () => {
    expect(validatePriceModifierInput("isabela", "-1")).toEqual({
      input: { keyword: "isabela", modifier: -1 },
    });
  });

  test("accepts a positive modifier", () => {
    expect(validatePriceModifierInput("manila", "2.5")).toEqual({
      input: { keyword: "manila", modifier: 2.5 },
    });
  });

  test("trims surrounding whitespace off the keyword", () => {
    expect(validatePriceModifierInput("   isabela   ", "-1")).toEqual({
      input: { keyword: "isabela", modifier: -1 },
    });
  });

  test("rejects an empty keyword", () => {
    expect(validatePriceModifierInput("", "-1")).toEqual({
      error: "Keyword is required.",
    });
  });

  test("rejects a whitespace-only keyword", () => {
    expect(validatePriceModifierInput("   ", "-1")).toEqual({
      error: "Keyword is required.",
    });
  });

  test("rejects a modifier that is not a number", () => {
    expect(validatePriceModifierInput("isabela", "abc")).toEqual({
      error: "Modifier must be a number.",
    });
  });
});
