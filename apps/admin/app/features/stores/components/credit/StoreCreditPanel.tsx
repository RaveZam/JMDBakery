import { useMemo, type ReactElement } from "react";
import { Wallet } from "lucide-react";

import { useCredit } from "../../hooks/useCredit";
import { summarizeCreditEntries } from "../../core/summarizeCreditEntries";
import type { StoreCreditByStore } from "../../types/store-types";
import { CreditSummaryRow } from "./CreditSummaryRow";
import { CreditLedgerSection } from "./CreditLedgerSection";

export function StoreCreditPanel({
  store,
}: {
  store: StoreCreditByStore;
}): ReactElement {
  const credit = useCredit(store.id);
  const summary = useMemo(
    () => summarizeCreditEntries(credit.entries),
    [credit.entries],
  );

  return (
    <div className="flex h-full flex-col px-6 py-5">
      <div className="mb-4 flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Credit (All Time)
        </h3>
      </div>

      <CreditSummaryRow summary={summary} />

      <h4 className="mb-1 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ledger
      </h4>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CreditLedgerSection
          entries={credit.entries}
          loading={credit.loading}
          error={credit.error}
        />
      </div>
    </div>
  );
}
