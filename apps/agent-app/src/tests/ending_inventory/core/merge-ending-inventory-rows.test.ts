import { mergeEndingInventoryRows } from "@/src/features/ending_inventory/core/merge-ending-inventory-rows";
import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";

const morning: InventoryItem[] = [
  {
    inventoryId: "inv-1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 200,
  },
];

test("a product with no saved row prefills from the expected counts", () => {
  const rows = mergeEndingInventoryRows(
    morning,
    { p1: { bo: 10, balance: 10 } },
    [],
  );
  expect(rows).toEqual([
    {
      id: undefined,
      productId: "p1",
      productName: "Pandesal",
      expectedBo: 10,
      expectedBalance: 10,
      endingBo: 10,
      endingBalance: 10,
    },
  ]);
});

test("a saved count wins over the expected one", () => {
  const rows = mergeEndingInventoryRows(morning, { p1: { bo: 10, balance: 10 } }, [
    { id: "end-1", productId: "p1", productName: "Pandesal", endingBo: 3, endingBalance: 17 },
  ]);
  expect(rows[0]).toMatchObject({ id: "end-1", endingBo: 3, endingBalance: 17 });
  // The expected values stay put — they're what the saved counts are measured against.
  expect(rows[0]).toMatchObject({ expectedBo: 10, expectedBalance: 10 });
});

test("a saved count of 0 is kept, not treated as missing", () => {
  const rows = mergeEndingInventoryRows(morning, { p1: { bo: 10, balance: 10 } }, [
    { id: "end-1", productId: "p1", productName: "Pandesal", endingBo: 0, endingBalance: 0 },
  ]);
  expect(rows[0]).toMatchObject({ endingBo: 0, endingBalance: 0 });
});

test("an oversold product prefills 0 but still shows the negative expectation", () => {
  const rows = mergeEndingInventoryRows(
    morning,
    { p1: { bo: 10, balance: -5 } },
    [],
  );
  expect(rows[0].endingBalance).toBe(0);
  expect(rows[0].expectedBalance).toBe(-5);
});

test("a product with no expected entry falls back to zeroes", () => {
  const rows = mergeEndingInventoryRows(morning, {}, []);
  expect(rows[0]).toMatchObject({
    expectedBo: 0,
    expectedBalance: 0,
    endingBo: 0,
    endingBalance: 0,
  });
});

test("a saved product that wasn't stocked this morning gets no row", () => {
  const rows = mergeEndingInventoryRows(morning, { p1: { bo: 0, balance: 200 } }, [
    { id: "end-2", productId: "p2", productName: "Ensaymada", endingBo: 1, endingBalance: 2 },
  ]);
  expect(rows.map((row) => row.productId)).toEqual(["p1"]);
});
