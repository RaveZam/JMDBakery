import { describe, expect, test } from "vitest";
import { formatSalesXLabel } from "../helpers/formatSalesXLabel";

// 2026-07-15 was a Wednesday.
const WEDNESDAY = "2026-07-15";

describe("formatSalesXLabel", () => {
  test("labels a 30-day axis with month and day", () => {
    expect(formatSalesXLabel(WEDNESDAY, "30days")).toBe("Jul 15");
  });

  test("labels a 7-day axis with the weekday", () => {
    expect(formatSalesXLabel(WEDNESDAY, "7days")).toBe("Wed");
  });

  test("labels a single-day axis with the weekday", () => {
    expect(formatSalesXLabel(WEDNESDAY, "today")).toBe("Wed");
  });
});
