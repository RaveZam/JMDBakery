import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import { formatAddress } from "../helpers/storeHelpers";
import type { StoreRow } from "../types/store-types";

export function StoreCard({
  store,
  onSelect,
}: {
  store: StoreRow;
  onSelect: (store: StoreRow) => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={() => onSelect(store)}
      className="flex w-full flex-col gap-4 rounded-2xl border bg-background p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div>
        <h3 className="truncate text-sm font-semibold">{store.storeName}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatAddress(store.barangay, store.city, store.province)}
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold tabular-nums">
          {formatCurrencyPHP(store.totalRevenue)}
        </p>
        <p className="text-xs text-muted-foreground">Total revenue</p>
      </div>
    </button>
  );
}
