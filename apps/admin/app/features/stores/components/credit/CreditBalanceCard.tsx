import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";

export function CreditBalanceCard({
  balance,
}: {
  balance: number;
}): ReactElement {
  const owes = balance > 0;

  return (
    <div
      className={`rounded-xl px-4 py-3 ${owes ? "bg-destructive/10" : "bg-primary/10"}`}
    >
      <p className="text-xs text-muted-foreground">Outstanding balance</p>
      <p
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          owes ? "text-destructive" : "text-primary"
        }`}
      >
        {formatCurrencyPHP(balance)}
      </p>
      {!owes && (
        <p className="mt-0.5 text-xs text-muted-foreground">Fully settled</p>
      )}
    </div>
  );
}
