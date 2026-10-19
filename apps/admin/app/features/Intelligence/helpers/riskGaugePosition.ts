// The gauge shows 0% to 20%: four equal 5% bands matching badOrderBand.
export const RISK_GAUGE_MAX_PCT = 20;

/** Where the marker sits on the risk gauge, as a 0-100 percent of its width.
 * Rates above the gauge's max pin to the far right end. */
export function riskGaugePosition(ratePct: number): number {
  const clamped = Math.min(Math.max(ratePct, 0), RISK_GAUGE_MAX_PCT);
  return (clamped / RISK_GAUGE_MAX_PCT) * 100;
}
