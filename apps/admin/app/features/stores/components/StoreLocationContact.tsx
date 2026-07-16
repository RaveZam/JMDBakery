import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import type { StoreRow } from "../types/store-types";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): ReactElement {
  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function LocationSection({ store }: { store: StoreRow }): ReactElement {
  if (!store.province && !store.city && !store.barangay) {
    return (
      <span className="text-sm text-muted-foreground">No address on file</span>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      {store.province && (
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-muted-foreground">Province</span>
          <span>{store.province}</span>
        </div>
      )}
      {store.city && (
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-muted-foreground">City</span>
          <span>{store.city}</span>
        </div>
      )}
      {store.barangay && (
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-muted-foreground">Barangay</span>
          <span>{store.barangay}</span>
        </div>
      )}
    </div>
  );
}

export function StoreLocationContact({ store }: { store: StoreRow }): ReactElement {
  return (
    <div className="flex-1 space-y-4 px-5 py-4">
      <section>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Location
        </h3>
        <LocationSection store={store} />
      </section>

      <section>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Contact
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="w-20 shrink-0 text-muted-foreground">Owner</span>
            <span>{store.contactName ?? "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 shrink-0 text-muted-foreground">Phone</span>
            <span>{store.contactNumber ?? "—"}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Performance
        </h3>
        <StatCard label="Total revenue" value={formatCurrencyPHP(store.totalRevenue)} />
      </section>
    </div>
  );
}
