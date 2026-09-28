import { useState, type ReactElement } from "react";

import { useResetOnChange } from "@/hooks/useResetOnChange";
import { useStoreSales } from "../hooks/useStoreSales";
import { StoreSaleRow } from "./StoreSaleRow";
import { StoreSaleDetailModal } from "./StoreSaleDetailModal";
import { StoreSalesPagination } from "./StoreSalesPagination";
import type { StoreSale } from "../types/store-types";

export function StoreSalesLog({ storeIds }: { storeIds: string[] }): ReactElement {
  const salesLog = useStoreSales(storeIds);
  const [selectedSale, setSelectedSale] = useState<StoreSale | null>(null);

  // A store switch with a row still open would show the previous store's
  // sale, so the selection is dropped along with the ids it came from.
  useResetOnChange(storeIds, () => setSelectedSale(null));

  return (
    <section>
      <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Sales Log (Last 30 Days)
      </h3>

      {salesLog.loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : salesLog.error ? (
        <p className="text-sm text-destructive">{salesLog.error}</p>
      ) : salesLog.sales.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales recorded.</p>
      ) : (
        <>
          <ul className="max-h-80 divide-y overflow-y-auto">
            {salesLog.sales.map((sale) => (
              <StoreSaleRow key={sale.id} sale={sale} onClick={() => setSelectedSale(sale)} />
            ))}
          </ul>
          <StoreSalesPagination
            page={salesLog.page}
            totalCount={salesLog.totalCount}
            onPageChange={salesLog.goToPage}
          />
        </>
      )}

      <StoreSaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </section>
  );
}
