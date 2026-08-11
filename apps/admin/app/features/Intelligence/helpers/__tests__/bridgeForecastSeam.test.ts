import { describe, expect, test } from "vitest";
import { bridgeForecastSeam } from "../bridgeForecastSeam";
import type { DataPoint } from "../../types";

describe("bridgeForecastSeam", () => {
  test("copies the last actual value into the first forecast so the lines connect", () => {
    const data: DataPoint[] = [
      { label: "Mon", actual: 100 },
      { label: "Tue", actual: 120 },
      { label: "Wed", forecast: 130 },
      { label: "Thu", forecast: 140 },
    ];

    const bridged = bridgeForecastSeam(data);

    expect(bridged[1]).toEqual({
      label: "Tue",
      actual: 120,
      forecast: 120,
      isSeam: true,
    });
  });

  test("leaves points untouched when there is no forecast to bridge into", () => {
    const data: DataPoint[] = [
      { label: "Mon", actual: 100 },
      { label: "Tue", actual: 120 },
    ];

    expect(bridgeForecastSeam(data)).toEqual(data);
  });

  test("does not bridge a point that already carries a forecast", () => {
    const data: DataPoint[] = [
      { label: "Mon", actual: 100, forecast: 100 },
      { label: "Tue", forecast: 110 },
    ];

    const bridged = bridgeForecastSeam(data);

    expect(bridged[0].isSeam).toBeUndefined();
  });

  test("returns an empty array unchanged", () => {
    expect(bridgeForecastSeam([])).toEqual([]);
  });
});
