import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";

export function StoreSaleBadOrderBadge({
  quantity,
  unitPrice,
}: {
  quantity: number;
  unitPrice: number;
}): ReactElement | null {
  if (quantity <= 0) return null;

  return (
    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      {quantity} pc BO · {formatCurrencyPHP(quantity * unitPrice)}
    </span>
  );
}
