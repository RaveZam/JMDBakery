import type { ReactElement } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { sumInventory } from "../helpers/sessionHelpers";
import { useBlurredAreaBox } from "../hooks/useBlurredAreaBox";
import type { InventorySummaryRow } from "../types/session-types";
import { InventoryLoadingWatermark } from "./InventoryLoadingWatermark";

/** Every cell gets the same horizontal rhythm; only the outer edges relax it. */
const CELL = "px-3 py-1.5 text-center";
const CELL_FIRST = "pl-0 pr-3 py-1.5 text-left";
const CELL_LAST = "pl-3 pr-0 py-1.5 text-center";
const GROUP_START = "pl-4 pr-3 py-1.5 text-center border-l border-border/50";
/** Hides numbers the agent hasn't counted yet. */
const BLURRED = "blur-[3px] select-none";

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

function InventoryRow({
  row,
  countFinished,
}: {
  row: InventorySummaryRow;
  countFinished: boolean;
}): ReactElement {
  const off =
    countFinished && (row.boVariance !== 0 || row.balanceVariance !== 0);
  const blur = !countFinished && BLURRED;
  return (
    <tr
      className={cn(
        "border-t border-border/50",
        off && "border-l-2 border-l-destructive/50",
      )}
    >
      <td className={CELL_FIRST}>{row.productName}</td>
      <td className={CELL}>{row.morning}</td>
      <td className={cn(CELL, blur)}>{row.sold}</td>
      <td className={cn(GROUP_START, blur)}>{row.expectedBo}</td>
      <td className={cn(CELL, blur)}>{row.endingBo}</td>
      <td className={cn(CELL, blur)}>
        <VarianceCell variance={row.boVariance} />
      </td>
      <td className={cn(GROUP_START, blur)}>{row.expectedBalance}</td>
      <td className={cn(CELL, blur)}>{row.endingBalance}</td>
      <td className={cn(CELL_LAST, blur)}>
        <VarianceCell variance={row.balanceVariance} />
      </td>
    </tr>
  );
}

function InventoryTotalsRow({
  rows,
  countFinished,
}: {
  rows: InventorySummaryRow[];
  countFinished: boolean;
}): ReactElement {
  const totals = sumInventory(rows);
  const blur = !countFinished && BLURRED;
  return (
    <tr className="border-t border-border/50 font-medium">
      <td className={CELL_FIRST}>Total</td>
      <td className={CELL}>{totals.morning}</td>
      <td className={cn(CELL, blur)}>{totals.sold}</td>
      <td className={cn(GROUP_START, blur)}>{totals.expectedBo}</td>
      <td className={cn(CELL, blur)}>{totals.endingBo}</td>
      <td className={cn(CELL, blur)}>
        <VarianceCell variance={totals.boVariance} />
      </td>
      <td className={cn(GROUP_START, blur)}>{totals.expectedBalance}</td>
      <td className={cn(CELL, blur)}>{totals.endingBalance}</td>
      <td className={cn(CELL_LAST, blur)}>
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
  countFinished,
}: {
  rows: InventorySummaryRow[];
  countFinished: boolean;
}): ReactElement {
  const { tableRef, box } = useBlurredAreaBox();
  return (
    <div className="relative">
      <table
        ref={tableRef}
        className="w-full text-xs border-separate border-spacing-0"
      >
        <InventoryTableHead />
        <tbody>
          {rows.map((row) => (
            <InventoryRow
              key={row.productId}
              row={row}
              countFinished={countFinished}
            />
          ))}
        </tbody>
        <tfoot>
          <InventoryTotalsRow rows={rows} countFinished={countFinished} />
        </tfoot>
      </table>
      {!countFinished && box && <InventoryLoadingWatermark box={box} />}
    </div>
  );
}

export function InventorySummaryTable({
  rows,
  loading,
  countFinished,
}: {
  rows: InventorySummaryRow[];
  loading: boolean;
  countFinished: boolean;
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
      <InventoryTable rows={rows} countFinished={countFinished} />
      {countFinished ? (
        <p className="text-[11px] text-muted-foreground">
          Expected B.O. = bad orders logged · Expected balance = Morning − Sold
          − B.O. · Variance = Counted − Expected
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Sold, bad orders and balance show once the agent ends the route.
        </p>
      )}
    </div>
  );
}
