import { badOrderBand, type BadOrderBand } from "./badOrderBand";

export type BadOrderSeverity = {
  level: BadOrderBand;
  label: string;
  /** Tailwind text colour for the rate value. */
  textClass: string;
  /** Tailwind background colour for the rail fill and the status dot. */
  fillClass: string;
};

const STYLE: Record<BadOrderBand, Pick<BadOrderSeverity, "textClass" | "fillClass">> = {
  healthy: { textClass: "text-foreground", fillClass: "bg-primary" },
  "needs-attention": { textClass: "text-gold", fillClass: "bg-gold" },
  "high-risk": { textClass: "text-orange-600", fillClass: "bg-orange-600" },
  risky: { textClass: "text-destructive", fillClass: "bg-destructive" },
};

/** Buckets a bad order rate into the severity shown beside it. */
export function badOrderSeverity(badOrderRatePct: number): BadOrderSeverity {
  const { band, label } = badOrderBand(badOrderRatePct);
  return { level: band, label, ...STYLE[band] };
}
