import { describe, expect, test } from "vitest";
import { validateProductInput } from "../helpers/validateProductInput";

describe("validateProductInput", () => {
  test("accepts a name and a numeric price", () => {
    expect(validateProductInput("Pandesal", "12.5")).toEqual({
      input: { name: "Pandesal", price: 12.5 },
    });
  });

  test("trims surrounding whitespace off the name", () => {
    expect(validateProductInput("   Ensaymada   ", "30")).toEqual({
      input: { name: "Ensaymada", price: 30 },
    });
  });

  test("accepts a price of exactly 0", () => {
    expect(validateProductInput("Free Sample", "0")).toEqual({
      input: { name: "Free Sample", price: 0 },
    });
  });

  test("rejects an empty name", () => {
    expect(validateProductInput("", "10")).toEqual({
      error: "Name is required.",
    });
  });

  test("rejects a whitespace-only name", () => {
    expect(validateProductInput("    ", "10")).toEqual({
      error: "Name is required.",
    });
  });

  test("rejects a negative price", () => {
    expect(validateProductInput("Pandesal", "-1")).toEqual({
      error: "Price must be a number greater than or equal to 0.",
    });
  });

  test("rejects a price that is not a number", () => {
    expect(validateProductInput("Pandesal", "abc")).toEqual({
      error: "Price must be a number greater than or equal to 0.",
    });
  });

  test("checks the name before the price", () => {
    expect(validateProductInput("", "abc")).toEqual({
      error: "Name is required.",
    });
  });

  // Documents current behaviour: Number("") is 0, so a blank price field is
  // accepted as a free product rather than rejected as missing.
  test("treats a blank price as 0", () => {
    expect(validateProductInput("Pandesal", "")).toEqual({
      input: { name: "Pandesal", price: 0 },
    });
  });
});
