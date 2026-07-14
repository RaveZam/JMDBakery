const PERIOD = 7; // weekly seasonality in the daily series
const ALPHA = 0.3; // level smoothing
const BETA = 0.05; // trend smoothing
const GAMMA = 0.2; // seasonal smoothing

/** Additive Holt-Winters level+trend+seasonal fit over a daily series. Returns a
 * function that forecasts `h` days past the last observed day. Needs at least
 * two full seasonal cycles (14 days) to initialize. */
export function fitHoltWinters(values: number[]): (h: number) => number {
  const n = values.length;
  const season1Avg = values.slice(0, PERIOD).reduce((s, v) => s + v, 0) / PERIOD;
  const season2Avg =
    n >= PERIOD * 2
      ? values.slice(PERIOD, PERIOD * 2).reduce((s, v) => s + v, 0) / PERIOD
      : season1Avg;

  let level = season1Avg;
  let trend = (season2Avg - season1Avg) / PERIOD;
  const seasonal = new Array(n).fill(0);
  for (let i = 0; i < PERIOD; i++) seasonal[i] = values[i] - season1Avg;

  for (let t = PERIOD; t < n; t++) {
    const seasonalIdx = t - PERIOD;
    const prevLevel = level;
    level = ALPHA * (values[t] - seasonal[seasonalIdx]) + (1 - ALPHA) * (level + trend);
    trend = BETA * (level - prevLevel) + (1 - BETA) * trend;
    seasonal[t] = GAMMA * (values[t] - level) + (1 - GAMMA) * seasonal[seasonalIdx];
  }

  const finalLevel = level;
  const finalTrend = trend;
  return (h: number) => {
    const seasonalIdx = n - PERIOD + ((h - 1) % PERIOD);
    return finalLevel + h * finalTrend + seasonal[seasonalIdx];
  };
}

export const HOLT_WINTERS_MIN_POINTS = PERIOD * 2;
