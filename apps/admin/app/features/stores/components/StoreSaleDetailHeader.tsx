import type { ReactElement } from "react";
import { X } from "lucide-react";

import { manilaTimestamp } from "@/lib/manilaTimestamp";
import type { StoreSale } from "../types/store-types";

export function StoreSaleDetailHeader({
  sale,
  onClose,
}: {
  sale: StoreSale;
  onClose: () => void;
}): ReactElement {
  const time = manilaTimestamp.time(sale.createdAt);

  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border px-5 py-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Sale
        </p>
        <h2 className="mt-0.5 text-base font-semibold">{sale.productName}</h2>
        <p className="text-xs text-muted-foreground">
          {manilaTimestamp.dayShort(sale.createdAt)}
          {time && <> &middot; {time}</>}
        </p>
      </div>
      <button
        type="button"
        className="rounded-lg p-1 hover:bg-muted transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
