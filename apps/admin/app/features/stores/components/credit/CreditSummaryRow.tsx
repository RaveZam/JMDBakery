import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import type { CreditSummary } from "../../types/store-types";
import { CreditBalanceCard } from "./CreditBalanceCard";
import { CreditStatCard } from "./CreditStatCard";

export function CreditSummaryRow({
  summary,
}: {
  summary: CreditSummary;
}): ReactElement {
  const lastPayment = summary.lastPaymentAt
    ? new Date(summary.lastPaymentAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <div className="grid grid-cols-4 gap-4">
      <CreditBalanceCard balance={summary.balance} />
      <CreditStatCard
        label="Credit taken"
        value={formatCurrencyPHP(summary.creditTaken)}
      />
      <CreditStatCard
        label="Paid back"
        value={formatCurrencyPHP(summary.paidBack)}
      />
      <CreditStatCard label="Last payment" value={lastPayment} />
    </div>
  );
}
