import { describe, expect, test } from "vitest";
import { formatHourLabel } from "../helpers/formatHourLabel";

describe("formatHourLabel", () => {
  test.each([
    [0, "12am"],
    [1, "1am"],
    [11, "11am"],
    [12, "12pm"],
    [13, "1pm"],
    [23, "11pm"],
  ])("renders hour %i as %s", (hour, expected) => {
    expect(formatHourLabel(hour)).toBe(expected);
  });
});
