const SEASON_LENGTH = 7; // weekly seasonality in a daily series
const LEVEL_SMOOTHING = 0.3;
const TREND_SMOOTHING = 0.05;
const SEASONAL_SMOOTHING = 0.2;

export const HOLT_WINTERS_MIN_HISTORY = SEASON_LENGTH * 2;

/** Fits an additive Holt-Winters model (level + trend + weekly seasonality)
 * over a daily value series and returns a function that forecasts `horizon`
 * days past the end of the series. Requires at least two full weeks of
 * history to seed the seasonal component. */
export function fitHoltWinters(values: number[]): (horizon: number) => number {
  const n = values.length;

  const firstSeasonAvg =
    values.slice(0, SEASON_LENGTH).reduce((sum, v) => sum + v, 0) / SEASON_LENGTH;
  const secondSeasonAvg =
    n >= SEASON_LENGTH * 2
      ? values.slice(SEASON_LENGTH, SEASON_LENGTH * 2).reduce((sum, v) => sum + v, 0) /
        SEASON_LENGTH
      : firstSeasonAvg;

  let level = firstSeasonAvg;
  let trend = (secondSeasonAvg - firstSeasonAvg) / SEASON_LENGTH;

  const seasonal = new Array(n).fill(0);
  for (let i = 0; i < SEASON_LENGTH; i++) {
    seasonal[i] = values[i] - firstSeasonAvg;
  }

  for (let t = SEASON_LENGTH; t < n; t++) {
    const priorSeasonalIdx = t - SEASON_LENGTH;
    const previousLevel = level;
    level =
      LEVEL_SMOOTHING * (values[t] - seasonal[priorSeasonalIdx]) +
      (1 - LEVEL_SMOOTHING) * (level + trend);
    trend =
      TREND_SMOOTHING * (level - previousLevel) + (1 - TREND_SMOOTHING) * trend;
    seasonal[t] =
      SEASONAL_SMOOTHING * (values[t] - level) +
      (1 - SEASONAL_SMOOTHING) * seasonal[priorSeasonalIdx];
  }

  const finalLevel = level;
  const finalTrend = trend;

  return (horizon: number) => {
    const seasonalIdx = n - SEASON_LENGTH + ((horizon - 1) % SEASON_LENGTH);
    return finalLevel + horizon * finalTrend + seasonal[seasonalIdx];
  };
}
