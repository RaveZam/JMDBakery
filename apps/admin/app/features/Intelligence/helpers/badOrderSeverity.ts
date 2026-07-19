export type BadOrderSeverity = {
  level: "critical" | "watch" | "healthy";
  label: string;
  /** Tailwind text colour for the rate value. */
  textClass: string;
  /** Tailwind background colour for the rail fill and the status dot. */
  fillClass: string;
};

const CRITICAL_RATE_PCT = 20;
const WATCH_RATE_PCT = 10;

/** Buckets a bad order rate into the severity shown beside it. */
export function badOrderSeverity(badOrderRatePct: number): BadOrderSeverity {
  if (badOrderRatePct >= CRITICAL_RATE_PCT) {
    return {
      level: "critical",
      label: "Critical",
      textClass: "text-destructive",
      fillClass: "bg-destructive",
    };
  }
  if (badOrderRatePct >= WATCH_RATE_PCT) {
    return {
      level: "watch",
      label: "Watch",
      textClass: "text-gold",
      fillClass: "bg-gold",
    };
  }
  return {
    level: "healthy",
    label: "Healthy",
    textClass: "text-foreground",
    fillClass: "bg-primary",
  };
}
