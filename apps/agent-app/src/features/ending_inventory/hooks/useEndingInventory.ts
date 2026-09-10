import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import { countSoldByProduct } from "@/src/features/store/core/count-sold-by-product";
import { getSalesByRouteSession } from "@/src/features/store/services/sales-services";
import { useSnackbar } from "@/src/shared/hooks/useSnackbar";
import { upsertEndingInventoryCounts } from "../services/ending-inventory-save-service";
import { mergeEndingInventoryRows } from "../core/merge-ending-inventory-rows";
import { computeExpectedEnding } from "../core/compute-expected-ending";
import { stepCount } from "../core/step-count";
import type { EndingInventoryRow } from "../types/ending-inventory-types";
import type { EndingInventoryCountField } from "../types/ending-inventory-count-field";

/**
 * Runs the ending-inventory count screen for one route session, taken from the
 * sessionId and routeName navigation params.
 *
 * @returns endingInventory with:
 *   - sessionId, routeName — the session being counted
 *   - items — the rows shown on screen (mergeEndingInventoryRows builds the
 *     initial values)
 *   - saving — true while save() is writing
 *   - updateCount(productId, field, delta) — step one row's bad-order or balance
 *     count and save that row now
 *   - setCount(productId, field, value) — set one row's count to an exact typed
 *     value and save that row now
 *   - save() — write every row's counts, for the Submit action
 * @sideEffects Loads rows from the local session_inventory, sales and
 *   ending_inventory tables on mount and whenever sessionId changes. Writes go
 *   through SQLite and the outbox via upsertEndingInventoryCounts.
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
  const { showSuccess } = useSnackbar();

  const load = useCallback(() => {
    if (!sessionId) return;

    // what was stocked on the truck this morning — defines which products get rows
    const morningItems = SessionInventoryDao.getBySessionId(sessionId);
    // e.g. { "prod_123": { sold: 5, bo: 2 } }, tallied from this session's sales
    const salesCounts = countSoldByProduct(getSalesByRouteSession(sessionId));
    // what should be left per product, split bad orders from good stock,
    // e.g. { "prod_123": { bo: 2, balance: 4 } }
    const expected = computeExpectedEnding(
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
        expected,
        EndingInventoryDao.getBySessionId(sessionId),
      ),
    );
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  // Persist on every change so a typed edit isn't lost if the app closes before "save".
  const setCount = useCallback(
    (productId: string, field: EndingInventoryCountField, next: number) => {
      if (!sessionId) return;
      const item = items.find((it) => it.productId === productId);
      // nothing to write if the count didn't actually move
      if (!item || item[field] === next) return;

      const updated = { ...item, [field]: next };
      // persist immediately so a single tap or edit isn't lost if the app closes before "save"
      const id = upsertEndingInventoryCounts({
        id: item.id,
        sessionId,
        productId: item.productId,
        productName: item.productName,
        endingBo: updated.endingBo,
        endingBalance: updated.endingBalance,
      });

      // id may have just been generated for the first time (row had no id yet), so store it back
      setItems((prev) =>
        prev.map((it) =>
          it.productId === productId ? { ...updated, id } : it,
        ),
      );
    },
    [sessionId, items],
  );

  const updateCount = useCallback(
    (productId: string, field: EndingInventoryCountField, delta: number) => {
      const item = items.find((it) => it.productId === productId);
      if (!item) return;
      setCount(productId, field, stepCount(item[field], delta));
    },
    [items, setCount],
  );

  const save = useCallback(() => {
    if (!sessionId) return;
    setSaving(true);
    try {
      // Write every row's current counts, not just ones the driver tapped +/-
      // on — an untouched row (e.g. correctly 0) would otherwise never reach
      // the outbox and silently fail to sync.
      const persisted = items.map((item) => ({
        ...item,
        id: upsertEndingInventoryCounts({
          id: item.id,
          sessionId,
          productId: item.productId,
          productName: item.productName,
          endingBo: item.endingBo,
          endingBalance: item.endingBalance,
        }),
      }));
      setItems(persisted);
      showSuccess("Ending inventory saved");
    } finally {
      setSaving(false);
    }
  }, [sessionId, items, showSuccess]);

  return {
    endingInventory: {
      sessionId,
      routeName,
      items,
      saving,
      updateCount,
      setCount,
      save,
    },
  };
}
