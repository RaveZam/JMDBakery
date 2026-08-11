import type { ReactElement } from "react";
import { Wallet } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { CreditLedgerList } from "./CreditLedgerList";
import type {
  CreditLedgerEntry,
  StoreCreditByStore,
} from "../types/store-types";

function BalanceBlock({ balance }: { balance: number }): ReactElement {
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
      {!owes && <p className="mt-0.5 text-xs text-muted-foreground">Fully settled</p>}
    </div>
  );
}

function TotalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

function CreditTotals({ store }: { store: StoreCreditByStore }): ReactElement {
  const lastPayment = store.lastPaymentAt
    ? new Date(store.lastPaymentAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <div className="mt-3 space-y-1">
      <TotalRow
        label="Credit taken"
        value={formatCurrencyPHP(store.creditTaken)}
      />
      <TotalRow label="Paid back" value={formatCurrencyPHP(store.paidBack)} />
      <TotalRow label="Last payment" value={lastPayment} />
    </div>
  );
}

function LedgerSection({
  entries,
}: {
  entries: CreditLedgerEntry[];
}): ReactElement {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        This store has never taken credit.
      </p>
    );
  }
  return <CreditLedgerList entries={entries} />;
}

export function StoreCreditPanel({
  store,
  entries,
}: {
  store: StoreCreditByStore;
  entries: CreditLedgerEntry[];
}): ReactElement {
  return (
    <div className="w-64 shrink-0 px-4 py-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Credit (All Time)
        </h3>
      </div>

      <BalanceBlock balance={store.balance} />
      <CreditTotals store={store} />

      <h4 className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ledger
      </h4>
      <LedgerSection entries={entries} />
    </div>
  );
}
