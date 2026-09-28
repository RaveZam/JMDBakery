import type { ReactElement } from "react";

import type { StoreSale } from "../types/store-types";

export function StoreSaleBadOrderReason({ sale }: { sale: StoreSale }): ReactElement | null {
  if (sale.quantityBadOrder <= 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive">
        Reason for bad order
      </p>
      <p className="mt-1 text-sm">{sale.badOrderReason ?? "No reason recorded"}</p>
    </div>
  );
}
