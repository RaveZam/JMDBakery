import { describe, expect, test } from "vitest";
import { averageRevenueForWeekday } from "../weekdayAverage";
import type { DailyTotal } from "../../types";

// Weekday is derived via `new Date(date).getDay()`, so tests read the
// weekday back the same way instead of hardcoding it -- keeps this immune to
// the runner's timezone.
function weekdayOf(date: string): number {
  return new Date(date).getDay();
}

describe("averageRevenueForWeekday", () => {
  test("averages revenue across every occurrence of the requested weekday", () => {
    const dailyTotals: DailyTotal[] = [
      { date: "2026-07-06", revenue: 100 },
      { date: "2026-07-13", revenue: 200 },
      { date: "2026-07-07", revenue: 9999 }, // a different weekday, must be excluded
    ];
    const targetWeekday = weekdayOf("2026-07-06");
    expect(weekdayOf("2026-07-13")).toBe(targetWeekday); // same weekday, one week apart

    expect(averageRevenueForWeekday(dailyTotals, targetWeekday)).toBe(150);
  });

  test("returns 0 when no day in the totals matches the weekday", () => {
    const dailyTotals: DailyTotal[] = [{ date: "2026-07-06", revenue: 100 }];
    const otherWeekday = (weekdayOf("2026-07-06") + 1) % 7;

    expect(averageRevenueForWeekday(dailyTotals, otherWeekday)).toBe(0);
  });

  test("returns 0 for an empty list", () => {
    expect(averageRevenueForWeekday([], 0)).toBe(0);
  });
});
