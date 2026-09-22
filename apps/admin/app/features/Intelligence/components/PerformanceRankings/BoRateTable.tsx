import type { BoRateRow } from "../helpers/computeBoRateByKey";
import {
  badOrderSeverity,
  type BadOrderSeverity,
} from "../helpers/badOrderSeverity";
import { MetricRail } from "./MetricRail";
import { PanelCard } from "./PanelCard";

function RowMeta({
  row,
  severity,
}: {
  row: BoRateRow;
  severity: BadOrderSeverity;
}) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span className="font-mono tabular-nums">
        {row.bo.toLocaleString()} bad of {(row.sold + row.bo).toLocaleString()}{" "}
        units
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${severity.fillClass}`}
          aria-hidden
        />
        {severity.label}
      </span>
    </div>
  );
}

function BadOrderRow({
  row,
  worstRatePct,
}: {
  row: BoRateRow;
  worstRatePct: number;
}) {
  const severity = badOrderSeverity(row.boRatePct);

  return (
    <li className="border-b border-border/50 py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{row.key}</span>
        <span
          className={`font-mono text-base font-semibold tabular-nums ${severity.textClass}`}
        >
          {row.boRatePct.toFixed(1)}%
        </span>
      </div>
      <RowMeta row={row} severity={severity} />
      <div className="mt-2">
        <MetricRail
          fraction={worstRatePct === 0 ? 0 : row.boRatePct / worstRatePct}
          fillClass={severity.fillClass}
        />
      </div>
    </li>
  );
}

export function BoRateTable({
  title,
  caption,
  rows,
}: {
  title: string;
  caption: string;
  rows: BoRateRow[];
}) {
  const worstRatePct = rows[0]?.boRatePct ?? 0;

  return (
    <PanelCard title={title} caption={caption}>
      {rows.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          No data for this period.
        </p>
      ) : (
        <ul>
          {rows.map((row) => (
            <BadOrderRow key={row.key} row={row} worstRatePct={worstRatePct} />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
