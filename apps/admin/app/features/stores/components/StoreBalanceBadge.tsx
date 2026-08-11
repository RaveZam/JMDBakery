import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";

/**
 * A store that owes nothing renders nothing at all, rather than "Owes ₱0" —
 * absence is the quieter signal and keeps the eye on the stores worth chasing.
 */
export function StoreBalanceBadge({
  balance,
}: {
  balance: number;
}): ReactElement | null {
  if (balance <= 0) return null;

  return (
    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium tabular-nums text-destructive">
      Owes {formatCurrencyPHP(balance)}
    </span>
  );
}
