import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import { countSoldByProduct } from "@/src/features/store/core/count-sold-by-product";
import { computeRemaining } from "@/src/features/store/core/compute-remaining";
import { getSalesByRouteSession } from "@/src/features/store/services/sales-services";
import { upsertEndingInventoryQty } from "../services/ending-inventory-save-service";
import { mergeEndingInventoryRows } from "../core/merge-ending-inventory-rows";
import type { EndingInventoryRow } from "../types/ending-inventory-types";

/**
 * Loads and manages the ending-inventory count screen for the current route
 * session, read from `sessionId`/`routeName` navigation params.
 *
 * @returns `{ endingInventory }` where:
 *          - `sessionId` / `routeName` — the session being counted, from route params.
 *          - `items` — current `EndingInventoryRow[]` shown on screen (see
 *            `mergeEndingInventoryRows` for how a row's initial values are derived).
 *          - `saving` — true while `save()`'s persistence is in flight.
 *          - `updateQty(productId, delta)` — adjusts one row's quantity by `delta`
 *            (e.g. +1/-1 from a stepper) and immediately persists just that row.
 *          - `save()` — persists every row's current quantity, e.g. for a final
 *            "Submit" action.
 * @sideEffects On mount (and whenever `sessionId` changes), reloads rows from the
 *              local `session_inventory` / `sales` / `ending_inventory` tables.
 *              `updateQty` and `save` write through to SQLite and the outbox via
 *              `upsertEndingInventoryQty`.
 */
export function useEndingInventory() {
  const params = useLocalSearchParams<{
    sessionId?: string;
    routeName?: string;
  }>();
  const sessionId = params.sessionId;
  const routeName =
    typeof params.routeName === "string" ? params.routeName : "";

  const [items, setItems] = useState<EndingInventoryRow[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!sessionId) return;

    // what was stocked on the truck this morning — defines which products get rows
    const morningItems = SessionInventoryDao.getBySessionId(sessionId);
    // e.g. { "prod_123": { sold: 5, bo: 2 } }, tallied from this session's sales
    const salesCounts = countSoldByProduct(getSalesByRouteSession(sessionId));
    // expected count left per product: morning qty - sold - bo, e.g. { "prod_123": 4 }
    const remaining = computeRemaining(
      morningItems.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      })),
      salesCounts,
    );

    // merges morning stock + expected counts + any already-saved counts into the rows shown on screen
    setItems(
      mergeEndingInventoryRows(
        morningItems,
        remaining,
        EndingInventoryDao.getBySessionId(sessionId),
      ),
    );
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateQty = useCallback(
    (productId: string, delta: number) => {
      if (!sessionId || delta === 0) return;
      const item = items.find((it) => it.productId === productId);
      if (!item) return;

      // never let a stepper tap push the count below 0
      const quantity = Math.max(0, item.quantity + delta);
      // persist immediately so a single +/- tap isn't lost if the app closes before "save"
      const id = upsertEndingInventoryQty({
        id: item.id,
        sessionId,
        productId: item.productId,
        productName: item.productName,
        quantity,
      });

      // id may have just been generated for the first time (row had no id yet), so store it back
      setItems((prev) =>
        prev.map((it) =>
          it.productId === productId ? { ...it, id, quantity } : it,
        ),
      );
    },
    [sessionId, items],
  );

  const save = useCallback(() => {
    if (!sessionId) return;
    setSaving(true);
    try {
      // Write every row's current count, not just ones the driver tapped +/-
      // on — an untouched row (e.g. correctly 0) would otherwise never reach
      // the outbox and silently fail to sync.
      const persisted = items.map((item) => ({
        ...item,
        id: upsertEndingInventoryQty({
          id: item.id,
          sessionId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
        }),
      }));
      setItems(persisted);
    } finally {
      setSaving(false);
    }
  }, [sessionId, items]);

  return {
    endingInventory: { sessionId, routeName, items, saving, updateQty, save },
  };
}
