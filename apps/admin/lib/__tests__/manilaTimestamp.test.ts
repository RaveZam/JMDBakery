import { describe, expect, test } from "vitest";
import { manilaTimestamp } from "../manilaTimestamp";

// A 5:30pm Manila entry. Every one of these would move a day or eight hours if
// the value were parsed as UTC and re-rendered in the viewer's timezone.
const EVENING = "2026-09-01T17:30:00.000+00:00";

describe("manilaTimestamp.day", () => {
  test("returns the calendar day", () => {
    expect(manilaTimestamp.day("2026-09-01T10:01:31.897+00:00")).toBe(
      "2026-09-01",
    );
  });

  test("keeps an evening entry on its own day", () => {
    expect(manilaTimestamp.day(EVENING)).toBe("2026-09-01");
  });

  test("handles a timestamp stored without a timezone suffix", () => {
    expect(manilaTimestamp.day("2026-08-31T14:27:59.347")).toBe("2026-08-31");
  });

  test("returns an empty string when there is no timestamp", () => {
    expect(manilaTimestamp.day(null)).toBe("");
    expect(manilaTimestamp.day(undefined)).toBe("");
  });
});

describe("manilaTimestamp.time", () => {
  test("formats a morning time", () => {
    expect(manilaTimestamp.time("2026-09-01T10:01:31.897+00:00")).toBe(
      "10:01 AM",
    );
  });

  test("formats an afternoon time", () => {
    expect(manilaTimestamp.time("2026-08-31T14:22:20.730+00:00")).toBe(
      "2:22 PM",
    );
  });

  test("reads the stored digits without shifting them", () => {
    expect(manilaTimestamp.time(EVENING)).toBe("5:30 PM");
  });

  test("shows midnight as 12 AM and noon as 12 PM", () => {
    expect(manilaTimestamp.time("2026-09-01T00:05:00.000+00:00")).toBe(
      "12:05 AM",
    );
    expect(manilaTimestamp.time("2026-09-01T12:00:00.000+00:00")).toBe(
      "12:00 PM",
    );
  });

  test("returns an empty string when there is no time to show", () => {
    expect(manilaTimestamp.time(null)).toBe("");
    expect(manilaTimestamp.time("2026-09-01")).toBe("");
  });
});

describe("manilaTimestamp.hour", () => {
  test("returns the Manila hour as a number", () => {
    expect(manilaTimestamp.hour("2026-08-31T14:22:20.730+00:00")).toBe(14);
  });

  test("returns null when there is no time to read", () => {
    expect(manilaTimestamp.hour(null)).toBeNull();
    expect(manilaTimestamp.hour("2026-09-01")).toBeNull();
  });
});

describe("manilaTimestamp.dayShort", () => {
  test("formats as Sep 1", () => {
    expect(manilaTimestamp.dayShort("2026-09-01T10:01:16.098+00:00")).toBe(
      "Sep 1",
    );
  });

  test("keeps an evening entry on its own day", () => {
    expect(manilaTimestamp.dayShort(EVENING)).toBe("Sep 1");
  });

  test("returns an empty string for a missing date", () => {
    expect(manilaTimestamp.dayShort(null)).toBe("");
  });
});

describe("manilaTimestamp.dayLong", () => {
  test("formats as August 27, 2026", () => {
    expect(manilaTimestamp.dayLong("2026-08-27T04:22:14.403639+00:00")).toBe(
      "August 27, 2026",
    );
  });

  test("returns an empty string for a missing date", () => {
    expect(manilaTimestamp.dayLong(null)).toBe("");
  });
});

describe("manilaTimestamp.sortKey", () => {
  test("orders two timestamps as plain text", () => {
    const earlier = manilaTimestamp.sortKey("2026-08-31T14:01:36.013+00:00");
    const later = manilaTimestamp.sortKey("2026-09-01T10:01:31.897+00:00");

    expect(earlier < later).toBe(true);
  });

  test("drops the timezone suffix so suffixed and bare values line up", () => {
    expect(manilaTimestamp.sortKey("2026-09-01T10:01:31.897+00:00")).toBe(
      manilaTimestamp.sortKey("2026-09-01T10:01:31.897"),
    );
  });

  test("returns an empty string when there is no timestamp", () => {
    expect(manilaTimestamp.sortKey(null)).toBe("");
  });
});
