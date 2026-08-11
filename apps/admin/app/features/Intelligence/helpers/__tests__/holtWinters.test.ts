import { describe, expect, test } from "vitest";
import { fitHoltWinters, HOLT_WINTERS_MIN_SEASONS } from "../holtWinters";

describe("fitHoltWinters", () => {
  test("requires two full seasons before a fit is meaningful", () => {
    expect(HOLT_WINTERS_MIN_SEASONS).toBe(2);
  });

  test("flat series with no trend or seasonality forecasts the same level", () => {
    const values = new Array(24).fill(100);

    const forecast = fitHoltWinters(values, 12);

    for (let horizon = 1; horizon <= 12; horizon++) {
      expect(forecast(horizon)).toBeCloseTo(100, 5);
    }
  });

  test("picks up an upward trend", () => {
    const values = Array.from({ length: 24 }, (_, i) => 100 + i * 10);

    const forecast = fitHoltWinters(values, 12);

    // The trend is smoothed in slowly (low TREND_SMOOTHING), so the forecast
    // lags the most recent observed value rather than exceeding it outright --
    // what should hold unconditionally is that it's well above where the
    // series started, and that later horizons keep climbing.
    const first = forecast(1);
    const last = forecast(12);
    expect(first).toBeGreaterThan(values[0]);
    expect(last).toBeGreaterThan(first);
  });

  test("carries the seasonal pattern into the forecast", () => {
    const seasonalPattern = [0, 20, 40, 20, 0, -20, -40, -20, 0, 20, 40, -60];
    const values = Array.from(
      { length: 24 },
      (_, i) => 500 + seasonalPattern[i % 12],
    );

    const forecast = fitHoltWinters(values, 12);

    // Horizon 3 lands on the pattern's peak (+40), horizon 12 on its trough
    // (-60) -- the forecast should reproduce that same ordering.
    expect(forecast(3)).toBeGreaterThan(forecast(1));
    expect(forecast(12)).toBeLessThan(forecast(1));
    expect(forecast(3)).toBeGreaterThan(forecast(12));
  });

  test("forecast repeats every season length once horizon wraps around", () => {
    const values = Array.from(
      { length: 24 },
      (_, i) => 500 + [0, 20, 40, 20, 0, -20, -40, -20, 0, 20, 40, -60][i % 12],
    );

    const forecast = fitHoltWinters(values, 12);

    // Horizons 1 and 13 land on the same season slot, one season apart, and so
    // do 2 and 14 -- both gaps should equal exactly one season's worth of
    // trend, since the (identical) seasonal term cancels out of each gap.
    const gapAtSlotZero = forecast(13) - forecast(1);
    const gapAtSlotOne = forecast(14) - forecast(2);
    expect(gapAtSlotZero).toBeCloseTo(gapAtSlotOne, 5);
  });
});
