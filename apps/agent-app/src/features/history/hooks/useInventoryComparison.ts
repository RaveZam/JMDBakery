import { useCallback, useMemo, useState } from "react";
import { useHistorySessionContext } from "../context/HistorySessionContext";
import { buildInventoryComparison } from "../core/inventory-comparison";
import { inventoryRowNeedsAttention } from "../core/inventory-row-needs-attention";
import { toggleInSet } from "../core/toggle-in-set";

/**
 * Builds the morning-against-counted comparison for the session being viewed,
 * and holds the two pieces of view state that go with it: which rows are
 * expanded, and whether the list is filtered to the ones that disagree.
 *
 * @returns `{ comparison }` where:
 *          - `rows` — the rows to render, already filtered when the "needs
 *            attention" tab is on. Empty with the filter on means everything
 *            reconciled; empty with it off means no stock was loaded.
 *          - `hasStock` — false when no morning inventory was logged at all, the
 *            case where the section shows its empty card instead of a table.
 *          - `attentionCount` — how many products disagree with the sales, across
 *            all rows rather than the visible ones, so the tab's label holds still.
 *          - `showOnlyAttention` / `setShowOnlyAttention` — the filter tab.
 *          - `isExpanded(productId)` / `toggleRow(productId)` — per-row detail panel.
 */
export function useInventoryComparison() {
  const session = useHistorySessionContext();
  const [showOnlyAttention, setShowOnlyAttention] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const rows = useMemo(
    () =>
      buildInventoryComparison(
        session.inventory,
        session.endingInventory,
        session.salesByStore,
      ),
    [session.inventory, session.endingInventory, session.salesByStore],
  );
  // the same list backs the count on the tab and the filtered view behind it
  const attentionRows = useMemo(
    () => rows.filter(inventoryRowNeedsAttention),
    [rows],
  );

  const toggleRow = useCallback((productId: string) => {
    setExpanded((prev) => toggleInSet(prev, productId));
  }, []);

  return {
    comparison: {
      rows: showOnlyAttention ? attentionRows : rows,
      hasStock: session.inventory.length > 0,
      attentionCount: attentionRows.length,
      showOnlyAttention,
      setShowOnlyAttention,
      isExpanded: (productId: string) => expanded.has(productId),
      toggleRow,
    },
  };
}
