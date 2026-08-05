import { useMemo } from "react";

import { getCreditEntryItems } from "../services/store-credit-service";
import type { CreditEntry, LoggedItem } from "../types/store-types";

// What the open credit covers, read once per entry. An entry logged against
// the store rather than a delivery has no visit to pull items from.
export function useCreditEntryItems(entry: CreditEntry | null): LoggedItem[] {
  return useMemo(
    () =>
      entry?.sessionStoreId ? getCreditEntryItems(entry.sessionStoreId) : [],
    [entry?.sessionStoreId],
  );
}
