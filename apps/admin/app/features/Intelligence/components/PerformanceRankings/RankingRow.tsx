import type { ReactNode } from "react";
import { MetricRail } from "./MetricRail";

type RankingRowProps = {
  rank: number;
  label: ReactNode;
  value: string;
  valueClassName?: string;
  detail?: ReactNode;
  fraction: number;
  fillClass: string;
};

/**
 * One row in a ranking panel: rank, name and headline value on top, an
 * optional detail line under it, and a rail comparing it with the top row.
 */
export function RankingRow({
  rank,
  label,
  value,
  valueClassName = "",
  detail,
  fraction,
  fillClass,
}: RankingRowProps) {
  return (
    <li className="border-b border-border/40 py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums">
            {String(rank).padStart(2, "0")}
          </span>
          {label}
        </div>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${valueClassName}`}
        >
          {value}
        </span>
      </div>
      {detail && (
        <div className="mt-0.5 flex pl-7 justify-between gap-3 text-xs text-muted-foreground tabular-nums">
          {detail}
        </div>
      )}
      <div className="mt-2 pl-7">
        <MetricRail fraction={fraction} fillClass={fillClass} />
      </div>
    </li>
  );
}
