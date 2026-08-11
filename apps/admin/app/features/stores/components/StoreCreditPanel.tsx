import type { ReactElement } from "react";
import { Wallet } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { CreditLedgerList } from "./CreditLedgerList";
import type {
  CreditLedgerEntry,
  StoreCreditByStore,
} from "../types/store-types";

function BalanceCard({ balance }: { balance: number }): ReactElement {
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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function CreditSummaryRow({ store }: { store: StoreCreditByStore }): ReactElement {
  const lastPayment = store.lastPaymentAt
    ? new Date(store.lastPaymentAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <div className="grid grid-cols-4 gap-4">
      <BalanceCard balance={store.balance} />
      <StatCard label="Credit taken" value={formatCurrencyPHP(store.creditTaken)} />
      <StatCard label="Paid back" value={formatCurrencyPHP(store.paidBack)} />
      <StatCard label="Last payment" value={lastPayment} />
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
    <div className="flex h-full flex-col px-6 py-5">
      <div className="mb-4 flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Credit (All Time)
        </h3>
      </div>

      <CreditSummaryRow store={store} />

      <h4 className="mb-1 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ledger
      </h4>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <LedgerSection entries={entries} />
      </div>
    </div>
  );
}
