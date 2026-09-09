import { inventoryRowNeedsAttention } from "@/src/features/history/core/inventory-row-needs-attention";
import type { InventoryComparisonRow } from "@/src/features/history/core/inventory-comparison";

function makeRow(overrides: Partial<InventoryComparisonRow> = {}): InventoryComparisonRow {
  return {
    productId: "p1",
    productName: "Pandesal",
    start: 200,
    sold: 180,
    bo: 10,
    balance: 10,
    endBo: 10,
    endBalance: 10,
    boVariance: 0,
    balanceVariance: 0,
    ...overrides,
  };
}

test("a count matching the sales on both sides needs no attention", () => {
  expect(inventoryRowNeedsAttention(makeRow())).toBe(false);
});

test("a bad-order count that is off needs attention", () => {
  expect(inventoryRowNeedsAttention(makeRow({ boVariance: -2 }))).toBe(true);
});

test("a balance that is off needs attention", () => {
  expect(inventoryRowNeedsAttention(makeRow({ balanceVariance: 3 }))).toBe(true);
});

// An uncounted product isn't a discrepancy — the driver just hasn't got to it.
test("a product not counted yet never needs attention", () => {
  const uncounted = makeRow({
    endBo: null,
    endBalance: null,
    boVariance: null,
    balanceVariance: null,
  });
  expect(inventoryRowNeedsAttention(uncounted)).toBe(false);
});
