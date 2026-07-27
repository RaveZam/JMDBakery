import { describe, expect, test, vi } from "vitest";
import { submitPriceModifierForm } from "../helpers/submitPriceModifierForm";

describe("submitPriceModifierForm", () => {
  test("calls handleUpdate with the parsed input on valid input", () => {
    const handleUpdate = vi.fn();
    const setError = vi.fn();

    submitPriceModifierForm("isabela", "-1", handleUpdate, setError);

    expect(handleUpdate).toHaveBeenCalledWith({ keyword: "isabela", modifier: -1 });
  });

  test("clears any previous error on valid input", () => {
    const handleUpdate = vi.fn();
    const setError = vi.fn();

    submitPriceModifierForm("manila", "2.5", handleUpdate, setError);

    expect(setError).toHaveBeenCalledWith(null);
  });

  test("reports the error and does not call handleUpdate on an empty keyword", () => {
    const handleUpdate = vi.fn();
    const setError = vi.fn();

    submitPriceModifierForm("", "-1", handleUpdate, setError);

    expect(setError).toHaveBeenCalledWith("Keyword is required.");
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  test("reports the error and does not call handleUpdate on a non-numeric modifier", () => {
    const handleUpdate = vi.fn();
    const setError = vi.fn();

    submitPriceModifierForm("isabela", "abc", handleUpdate, setError);

    expect(setError).toHaveBeenCalledWith("Modifier must be a number.");
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});
