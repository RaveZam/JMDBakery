import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDateRange } from "../helpers/getDateRange";

// Pin "now" so the ranges are deterministic. Mid-month avoids month-rollover
// noise except where a test asks for it.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0)); // 2026-07-15, local time
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getDateRange", () => {
  test("collapses to a single day for today", () => {
    expect(getDateRange("today")).toEqual({
      from: "2026-07-15",
      to: "2026-07-15",
    });
  });

  test("spans 7 inclusive days for the 7-day range", () => {
    expect(getDateRange("7days")).toEqual({
      from: "2026-07-09",
      to: "2026-07-15",
    });
  });

  test("spans 30 inclusive days for the 30-day range", () => {
    expect(getDateRange("30days")).toEqual({
      from: "2026-06-16",
      to: "2026-07-15",
    });
  });

  test("walks back across a month boundary", () => {
    vi.setSystemTime(new Date(2026, 6, 3, 12, 0, 0)); // 2026-07-03

    expect(getDateRange("7days")).toEqual({
      from: "2026-06-27",
      to: "2026-07-03",
    });
  });

  test("walks back across a year boundary", () => {
    vi.setSystemTime(new Date(2026, 0, 2, 12, 0, 0)); // 2026-01-02

    expect(getDateRange("7days")).toEqual({
      from: "2025-12-27",
      to: "2026-01-02",
    });
  });
});
