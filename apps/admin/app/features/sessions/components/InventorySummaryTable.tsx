import type { ReactElement } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { sumInventory } from "../helpers/sessionHelpers";
import type { InventorySummaryRow } from "../types/session-types";

function VarianceCell({ variance }: { variance: number }): ReactElement {
  if (variance === 0) {
    return (
      <span className="inline-flex items-center justify-end gap-1 text-muted-foreground">
        <CheckCircle2 className="h-3 w-3" />0
      </span>
    );
  }
  const isShort = variance < 0;
  return (
    <span
      className={cn(
        "font-medium",
        isShort
          ? "text-destructive"
          : "text-amber-600 dark:text-amber-400",
      )}
    >
      {isShort ? variance : `+${variance}`}
    </span>
  );
}

function InventoryRow({ row }: { row: InventorySummaryRow }): ReactElement {
  return (
    <tr
      className={cn(
        "border-t border-border/50",
        row.variance !== 0 && "border-l-2 border-l-destructive/50",
      )}
    >
      <td className="py-1 pr-2">{row.productName}</td>
      <td className="py-1 text-right">{row.morning}</td>
      <td className="py-1 text-right">{row.sold}</td>
      <td className="py-1 text-right">{row.backOrder}</td>
      <td className="py-1 text-right">{row.expected}</td>
      <td className="py-1 text-right">{row.ending}</td>
      <td className="py-1 pl-2 text-right">
        <VarianceCell variance={row.variance} />
      </td>
    </tr>
  );
}

function InventoryTotalsRow({
  rows,
}: {
  rows: InventorySummaryRow[];
}): ReactElement {
  const totals = sumInventory(rows);
  return (
    <tr className="border-t border-border/50 font-medium">
      <td className="py-1">Total</td>
      <td className="py-1 text-right">{totals.morning}</td>
      <td className="py-1 text-right">{totals.sold}</td>
      <td className="py-1 text-right">{totals.backOrder}</td>
      <td className="py-1 text-right">{totals.expected}</td>
      <td className="py-1 text-right">{totals.ending}</td>
      <td className="py-1 pl-2 text-right">
        <VarianceCell variance={totals.variance} />
      </td>
    </tr>
  );
}

function LoadingRow(): ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      Loading inventory...
    </div>
  );
}

function InventoryTable({ rows }: { rows: InventorySummaryRow[] }): ReactElement {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="pb-1 text-left font-medium">Product</th>
          <th className="pb-1 text-right font-medium">Morning</th>
          <th className="pb-1 text-right font-medium">Sold</th>
          <th className="pb-1 text-right font-medium">B.O.</th>
          <th className="pb-1 text-right font-medium">Expected</th>
          <th className="pb-1 text-right font-medium">Ending</th>
          <th className="pb-1 pl-2 text-right font-medium">Variance</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <InventoryRow key={row.productId} row={row} />
        ))}
      </tbody>
      <tfoot>
        <InventoryTotalsRow rows={rows} />
      </tfoot>
    </table>
  );
}

export function InventorySummaryTable({
  rows,
  loading,
}: {
  rows: InventorySummaryRow[];
  loading: boolean;
}): ReactElement {
  if (loading) return <LoadingRow />;
  if (rows.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-muted-foreground">
        No inventory recorded for this session.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <InventoryTable rows={rows} />
      <p className="text-[11px] text-muted-foreground">
        Expected = Morning − Sold − B.O. · Variance = Ending − Expected
      </p>
    </div>
  );
}
