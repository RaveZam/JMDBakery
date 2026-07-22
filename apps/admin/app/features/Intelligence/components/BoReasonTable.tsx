import type { BoReasonRow } from "../helpers/computeBoReasonRanking";
import { MetricRail } from "./MetricRail";
import { PanelCard } from "./PanelCard";

function BoReasonRowItem({
  row,
  topBo,
}: {
  row: BoReasonRow;
  topBo: number;
}) {
  return (
    <li className="border-b border-border/50 py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{row.reason}</span>
        <span className="font-mono text-base font-semibold tabular-nums">
          {row.sharePct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          {row.bo.toLocaleString()} units
        </span>
      </div>
      <div className="mt-2">
        <MetricRail
          fraction={topBo === 0 ? 0 : row.bo / topBo}
          fillClass="bg-primary"
        />
      </div>
    </li>
  );
}

export function BoReasonTable({ rows }: { rows: BoReasonRow[] }) {
  const topBo = rows[0]?.bo ?? 0;

  return (
    <PanelCard
      title="Bad order reasons"
      caption="Units lost by reason, biggest cause first"
    >
      {rows.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          No data for this period.
        </p>
      ) : (
        <ul>
          {rows.map((row) => (
            <BoReasonRowItem key={row.reason} row={row} topBo={topBo} />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
