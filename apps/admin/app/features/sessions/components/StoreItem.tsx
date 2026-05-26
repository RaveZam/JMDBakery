import type { ReactElement } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatAddress } from "@/app/features/stores/helpers/storeHelpers";
import type {
  SessionStoreRow,
  SessionStoreSaleRow,
} from "../types/session-types";
import { StoreSalesTable } from "./StoreSalesTable";

export function StoreItem({
  store,
  expanded,
  sales,
  salesLoading,
  onClick,
}: {
  store: SessionStoreRow;
  expanded: boolean;
  sales: SessionStoreSaleRow[];
  salesLoading: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <div className="rounded-xl border bg-background">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        {store.visited ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{store.storeName}</p>
          <p className="text-xs text-muted-foreground">
            {formatAddress(store.barangay, store.city, store.province)}
          </p>
        </div>
        <Badge variant={store.visited ? "success" : "pending"}>
          {store.visited ? "Visited" : "Pending"}
        </Badge>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/50 px-3 py-2">
          <StoreSalesTable sales={sales} loading={salesLoading} />
        </div>
      )}
    </div>
  );
}
