import type { ReactElement } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { sumInventory } from "../helpers/sessionHelpers";
import type { InventorySummaryRow } from "../types/session-types";

/** Every cell gets the same horizontal rhythm; only the outer edges relax it. */
const CELL = "px-3 py-1.5 text-center";
const CELL_FIRST = "pl-0 pr-3 py-1.5 text-left";
const CELL_LAST = "pl-3 pr-0 py-1.5 text-center";
const GROUP_START = "pl-4 pr-3 py-1.5 text-center border-l border-border/50";

function VarianceCell({ variance }: { variance: number }): ReactElement {
  if (variance === 0) {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-muted-foreground">
        <CheckCircle2 className="h-3 w-3" />0
      </span>
    );
  }
  const isShort = variance < 0;
  return (
    <span
      className={cn(
        "font-medium",
        isShort ? "text-destructive" : "text-amber-600 dark:text-amber-400",
      )}
    >
      {isShort ? variance : `+${variance}`}
    </span>
  );
}

function InventoryRow({ row }: { row: InventorySummaryRow }): ReactElement {
  const off = row.boVariance !== 0 || row.balanceVariance !== 0;
  return (
    <tr
      className={cn(
        "border-t border-border/50",
        off && "border-l-2 border-l-destructive/50",
      )}
    >
      <td className={CELL_FIRST}>{row.productName}</td>
      <td className={CELL}>{row.morning}</td>
      <td className={CELL}>{row.sold}</td>
      <td className={GROUP_START}>{row.expectedBo}</td>
      <td className={CELL}>{row.endingBo}</td>
      <td className={CELL}>
        <VarianceCell variance={row.boVariance} />
      </td>
      <td className={GROUP_START}>{row.expectedBalance}</td>
      <td className={CELL}>{row.endingBalance}</td>
      <td className={CELL_LAST}>
        <VarianceCell variance={row.balanceVariance} />
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
      <td className={CELL_FIRST}>Total</td>
      <td className={CELL}>{totals.morning}</td>
      <td className={CELL}>{totals.sold}</td>
      <td className={GROUP_START}>{totals.expectedBo}</td>
      <td className={CELL}>{totals.endingBo}</td>
      <td className={CELL}>
        <VarianceCell variance={totals.boVariance} />
      </td>
      <td className={GROUP_START}>{totals.expectedBalance}</td>
      <td className={CELL}>{totals.endingBalance}</td>
      <td className={CELL_LAST}>
        <VarianceCell variance={totals.balanceVariance} />
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

function InventoryTableHead(): ReactElement {
  return (
    <thead>
      <tr className="text-muted-foreground">
        <th
          className={cn(CELL_FIRST, "font-medium align-bottom")}
          rowSpan={2}
        />
        <th className={cn(CELL, "font-medium align-bottom")} rowSpan={2}>
          Morning
        </th>
        <th className={cn(CELL, "font-medium align-bottom")} rowSpan={2}>
          Sold
        </th>
        <th
          className="px-3 py-1.5 text-center font-medium border-l border-border/50"
          colSpan={3}
        >
          Bad orders
        </th>
        <th
          className="px-3 py-1.5 text-center font-medium border-l border-border/50"
          colSpan={3}
        >
          Balance
        </th>
      </tr>
      <tr className="text-muted-foreground">
        <th className={cn(GROUP_START, "font-medium")}>Exp</th>
        <th className={cn(CELL, "font-medium")}>Counted</th>
        <th className={cn(CELL, "font-medium")}>Var</th>
        <th className={cn(GROUP_START, "font-medium")}>Exp</th>
        <th className={cn(CELL, "font-medium")}>Counted</th>
        <th className={cn(CELL_LAST, "font-medium")}>Var</th>
      </tr>
    </thead>
  );
}

function InventoryTable({
  rows,
}: {
  rows: InventorySummaryRow[];
}): ReactElement {
  return (
    <table className="w-full text-xs border-separate border-spacing-0">
      <InventoryTableHead />
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
    <div className="space-y-3 overflow-x-auto">
      <InventoryTable rows={rows} />
      <p className="text-[11px] text-muted-foreground">
        Expected B.O. = bad orders logged · Expected balance = Morning − Sold −
        B.O. · Variance = Counted − Expected
      </p>
    </div>
  );
}
