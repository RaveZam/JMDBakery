import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import { sumSales } from "../helpers/sessionHelpers";
import type { SessionStoreSaleRow } from "../types/session-types";
import { SalePaymentTypeTag } from "./SalePaymentTypeTag";

function TotalsRow({
  label,
  figures,
}: {
  label: string;
  figures: { quantitySold: number; quantityBO: number; total: number };
}): ReactElement {
  return (
    <tr className="border-t border-border/50">
      <td className="py-1 font-medium">{label}</td>
      <td />
      <td />
      <td className="py-1 text-right font-medium">{figures.quantitySold}</td>
      <td className="py-1 text-right font-medium">{figures.quantityBO}</td>
      <td className="py-1 text-right font-medium">
        {formatCurrencyPHP(figures.total)}
      </td>
    </tr>
  );
}

function SalesTotalsRows({
  sales,
}: {
  sales: SessionStoreSaleRow[];
}): ReactElement {
  const totals = sumSales(sales);
  return (
    <>
      <TotalsRow label="Cash total" figures={totals.cash} />
      <TotalsRow label="Credit total" figures={totals.credit} />
    </>
  );
}

function SalesRow({ sale }: { sale: SessionStoreSaleRow }): ReactElement {
  return (
    <tr className="border-t border-border/50">
      <td className="py-1 pr-2">{sale.productName}</td>
      <td className="py-1 pr-2 whitespace-nowrap text-muted-foreground">
        {manilaTimestamp.time(sale.createdAt)}
      </td>
      <td className="py-1 pr-2">
        <SalePaymentTypeTag paymentType={sale.paymentType} />
      </td>
      <td className="py-1 text-right">{sale.quantitySold}</td>
      <td className="py-1 text-right">{sale.quantityBO}</td>
      <td className="py-1 text-right">{formatCurrencyPHP(sale.total)}</td>
    </tr>
  );
}

function LoadingRow(): ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      Loading logged items...
    </div>
  );
}

export function StoreSalesTable({
  sales,
  loading,
}: {
  sales: SessionStoreSaleRow[];
  loading: boolean;
}): ReactElement {
  if (loading) return <LoadingRow />;
  if (sales.length === 0) {
    return (
      <p className="px-3 py-3 text-xs text-muted-foreground">
        No items logged for this store.
      </p>
    );
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="pb-1 text-left font-medium">Product</th>
          <th className="pb-1 text-left font-medium">Time</th>
          <th className="pb-1 text-left font-medium">Paid</th>
          <th className="pb-1 text-right font-medium">Qty</th>
          <th className="pb-1 text-right font-medium">B.O.</th>
          <th className="pb-1 text-right font-medium">Total</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((s) => (
          <SalesRow key={s.id} sale={s} />
        ))}
      </tbody>
      <tfoot>
        <SalesTotalsRows sales={sales} />
      </tfoot>
    </table>
  );
}
