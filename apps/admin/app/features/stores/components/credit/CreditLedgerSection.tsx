import type { ReactElement } from "react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { CreditLedgerEntry } from "../../types/store-types";
import { CreditLedgerList } from "./CreditLedgerList";

export function CreditLedgerSection({
  entries,
  loading,
  error,
  onSelect,
}: {
  entries: CreditLedgerEntry[];
  loading: boolean;
  error: string | null;
  onSelect: (entry: CreditLedgerEntry) => void;
}): ReactElement {
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p className="text-xs text-destructive">{error}</p>;
  }
  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        This store has never taken credit.
      </p>
    );
  }
  return <CreditLedgerList entries={entries} onSelect={onSelect} />;
}
