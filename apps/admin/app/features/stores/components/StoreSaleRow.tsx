import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import { StoreSaleBadOrderBadge } from "./StoreSaleBadOrderBadge";
import type { StoreSale } from "../types/store-types";

export function StoreSaleRow({
  sale,
  onClick,
}: {
  sale: StoreSale;
  onClick: () => void;
}): ReactElement {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{sale.productName}</span>
          <span className="shrink-0 text-sm tabular-nums">
            {formatCurrencyPHP(sale.total)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {sale.agentName ?? "Unknown"} · {manilaTimestamp.dayShort(sale.createdAt)},{" "}
            {manilaTimestamp.time(sale.createdAt)}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
            {sale.quantitySold} sold
            <StoreSaleBadOrderBadge quantity={sale.quantityBadOrder} unitPrice={sale.unitPrice} />
          </span>
        </div>
      </button>
    </li>
  );
}
