"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Loader2,
  Package,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  SessionInventoryRow,
  SessionRow,
  SessionStoreSaleRow,
  SessionStoreRow,
} from "../types/session-types";
import {
  formatSessionDate,
  groupStoresByProvince,
  visitRate,
} from "../helpers/sessionHelpers";
import { getStoreSales } from "../services/sessionsService";
import { formatAddress } from "@/app/features/stores/helpers/storeHelpers";

function InventorySection({
  inventory,
  loading,
}: {
  inventory: SessionInventoryRow[];
  loading: boolean;
}): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">Morning Inventory</span>
        {!loading && (
          <span className="text-xs text-muted-foreground">
            {inventory.length} product{inventory.length !== 1 ? "s" : ""}
          </span>
        )}
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border/50 px-3 py-2">
          {loading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading inventory...
            </div>
          ) : inventory.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">
              No inventory recorded for this session.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-1 text-left font-medium">Product</th>
                  <th className="pb-1 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="py-1 pr-2">{item.productName}</td>
                    <td className="py-1 text-right">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-1 font-medium">Total</td>
                  <td className="py-1 text-right font-medium">
                    {inventory.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function SalesTable({
  sales,
  loading,
}: {
  sales: SessionStoreSaleRow[];
  loading: boolean;
}): ReactElement {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading sales...
      </div>
    );
  }
  if (sales.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        No sales recorded for this store.
      </p>
    );
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="pb-1 text-left font-medium">Product</th>
          <th className="pb-1 text-right font-medium">Qty</th>
          <th className="pb-1 text-right font-medium">B.O.</th>
          <th className="pb-1 text-right font-medium">Total</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((s) => (
          <tr key={s.id} className="border-t border-border/50">
            <td className="py-1 pr-2">{s.productName}</td>
            <td className="py-1 text-right">{s.quantitySold}</td>
            <td className="py-1 text-right">{s.quantityBO}</td>
            <td className="py-1 text-right">₱{s.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="py-1 text-right font-medium">Total</td>
          <td className="py-1 text-right font-medium">
            {sales.reduce((sum, s) => sum + s.quantitySold, 0)}
          </td>
          <td className="py-1 text-right font-medium">
            {sales.reduce((sum, s) => sum + s.quantityBO, 0)}
          </td>
          <td className="py-1 text-right font-medium">
            ₱{sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function StoreItem({
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
          <SalesTable sales={sales} loading={salesLoading} />
        </div>
      )}
    </div>
  );
}

export function SessionStoreList({
  session,
  stores,
  loading,
  inventory,
  inventoryLoading,
}: {
  session: SessionRow;
  stores: SessionStoreRow[];
  loading: boolean;
  inventory: SessionInventoryRow[];
  inventoryLoading: boolean;
}): ReactElement {
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [sales, setSales] = useState<SessionStoreSaleRow[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  async function handleStoreClick(store: SessionStoreRow) {
    if (expandedStoreId === store.id) {
      setExpandedStoreId(null);
      return;
    }
    setExpandedStoreId(store.id);
    setSalesLoading(true);
    const result = await getStoreSales(store.id);
    setSales(result);
    setSalesLoading(false);
  }

  const rate = visitRate(stores.filter((s) => s.visited).length, stores.length);
  const provinceGroups = groupStoresByProvince(stores);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{session.routeName}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatSessionDate(session.sessionDate)} &middot;{" "}
          {session.conductedByName} &middot;{" "}
          <span className="font-medium text-foreground">{rate}</span> visit rate
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <InventorySection inventory={inventory} loading={inventoryLoading} />
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading stores...
          </p>
        ) : stores.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No stores in this session.
          </p>
        ) : (
          provinceGroups.map((group) => (
            <div key={group.key}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.displayName}
              </p>
              <div className="space-y-2">
                {group.stores.map((store) => (
                  <StoreItem
                    key={store.id}
                    store={store}
                    expanded={expandedStoreId === store.id}
                    sales={expandedStoreId === store.id ? sales : []}
                    salesLoading={expandedStoreId === store.id && salesLoading}
                    onClick={() => handleStoreClick(store)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
