// APQC bad order rate bands, checked worst-to-best on inclusive lower bounds:
// 15%+ risky, 10-15% high risk, 5-10% needs attention, under 5% healthy.
// This is the one place the thresholds and their labels are defined;
// badOrderSeverity and classifyBackorderRisk add their own presentation on top.
export type BadOrderBand = "healthy" | "needs-attention" | "high-risk" | "risky";

export function badOrderBand(ratePct: number): { band: BadOrderBand; label: string } {
  if (ratePct >= 15) return { band: "risky", label: "Risky" };
  if (ratePct >= 10) return { band: "high-risk", label: "High risk" };
  if (ratePct >= 5) return { band: "needs-attention", label: "Needs attention" };
  return { band: "healthy", label: "Healthy" };
}
