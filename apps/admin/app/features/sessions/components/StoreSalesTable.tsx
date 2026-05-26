import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import type { SessionStoreSaleRow } from "../types/session-types";

export function StoreSalesTable({
  sales,
  loading,
}: {
  sales: SessionStoreSaleRow[];
  loading: boolean;
}): ReactElement {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading sales...
      </div>
    );
  }
  if (sales.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        No sales recorded for this store.
      </p>
    );
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="pb-1 text-left font-medium">Product</th>
          <th className="pb-1 text-right font-medium">Qty</th>
          <th className="pb-1 text-right font-medium">B.O.</th>
          <th className="pb-1 text-right font-medium">Total</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((s) => (
          <tr key={s.id} className="border-t border-border/50">
            <td className="py-1 pr-2">{s.productName}</td>
            <td className="py-1 text-right">{s.quantitySold}</td>
            <td className="py-1 text-right">{s.quantityBO}</td>
            <td className="py-1 text-right">₱{s.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="py-1 text-right font-medium">Total</td>
          <td className="py-1 text-right font-medium">
            {sales.reduce((sum, s) => sum + s.quantitySold, 0)}
          </td>
          <td className="py-1 text-right font-medium">
            {sales.reduce((sum, s) => sum + s.quantityBO, 0)}
          </td>
          <td className="py-1 text-right font-medium">
            ₱{sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
