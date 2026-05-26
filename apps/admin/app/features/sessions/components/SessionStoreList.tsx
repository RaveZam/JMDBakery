"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { InventorySection } from "./InventorySection";
import { StoreItem } from "./StoreItem";

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
