import {
  RISK_GAUGE_MAX_PCT,
  riskGaugePosition,
} from "../../helpers/riskGaugePosition";

// One bar per badOrderBand, best to worst.
const SEGMENT_COLORS = [
  "bg-primary/60",
  "bg-amber-400",
  "bg-orange-500",
  "bg-red-500",
];

const TICKS = [5, 10, 15];

export function RiskGauge({ ratePct }: { ratePct: number }) {
  const markerLeft = riskGaugePosition(ratePct);

  return (
    <div
      role="meter"
      aria-label="Bad order rate"
      aria-valuemin={0}
      aria-valuemax={RISK_GAUGE_MAX_PCT}
      aria-valuenow={Math.min(ratePct, RISK_GAUGE_MAX_PCT)}
      aria-valuetext={`${ratePct.toFixed(1)}%`}
      className="mt-5"
    >
      <div className="relative">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {SEGMENT_COLORS.map((color) => (
            <span key={color} className={`flex-1 ${color}`} />
          ))}
        </div>
        <span
          aria-hidden
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card"
          style={{ left: `${markerLeft}%` }}
        />
      </div>
      <div aria-hidden className="relative mt-2 h-4">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 text-[11px] tabular-nums text-muted-foreground"
            style={{ left: `${riskGaugePosition(tick)}%` }}
          >
            {tick}%
          </span>
        ))}
      </div>
    </div>
  );
}
