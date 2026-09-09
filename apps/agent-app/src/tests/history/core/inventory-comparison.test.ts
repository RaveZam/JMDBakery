import { buildInventoryComparison } from "@/src/features/history/core/inventory-comparison";

const morning = [{ productId: "p1", productName: "Loaf", qty: 200 }];

test("counts matching what the sales say read variance 0 on both sides", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", endingBo: 10, endingBalance: 10 }],
    { store1: [{ productId: "p1", qty: 180, boQty: 10 }] },
  );
  expect(rows).toEqual([
    {
      productId: "p1",
      productName: "Loaf",
      start: 200,
      sold: 180,
      bo: 10,
      balance: 10,
      endBo: 10,
      endBalance: 10,
      boVariance: 0,
      balanceVariance: 0,
    },
  ]);
});

test("bad orders counted as good stock read off on both variances", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", endingBo: 0, endingBalance: 20 }],
    { store1: [{ productId: "p1", qty: 180, boQty: 10 }] },
  );
  expect(rows[0].boVariance).toBe(-10);
  expect(rows[0].balanceVariance).toBe(10);
});

test("sales split across stores are summed separately for sold and bo", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", endingBo: 10, endingBalance: 10 }],
    {
      store1: [{ productId: "p1", qty: 100, boQty: 4 }],
      store2: [{ productId: "p1", qty: 80, boQty: 6 }],
    },
  );
  expect(rows[0]).toMatchObject({ sold: 180, bo: 10, balance: 10 });
});

test("no ending row yet: counted values and variances are null, not 0", () => {
  const rows = buildInventoryComparison(morning, [], {
    store1: [{ productId: "p1", qty: 50, boQty: 0 }],
  });
  expect(rows[0].endBo).toBeNull();
  expect(rows[0].endBalance).toBeNull();
  expect(rows[0].boVariance).toBeNull();
  expect(rows[0].balanceVariance).toBeNull();
  expect(rows[0].balance).toBe(150);
});

test("product present in ending but not morning still gets a row", () => {
  const rows = buildInventoryComparison(
    [],
    [{ productId: "p2", productName: "Bun", endingBo: 1, endingBalance: 5 }],
    {},
  );
  expect(rows).toEqual([
    {
      productId: "p2",
      productName: "Bun",
      start: 0,
      sold: 0,
      bo: 0,
      balance: 0,
      endBo: 1,
      endBalance: 5,
      boVariance: 1,
      balanceVariance: 5,
    },
  ]);
});

test("does not mutate its inputs", () => {
  const morningInput = [{ productId: "p1", productName: "Loaf", qty: 200 }];
  const endingInput = [
    { productId: "p1", productName: "Loaf", endingBo: 10, endingBalance: 10 },
  ];
  const salesInput = { store1: [{ productId: "p1", qty: 180, boQty: 10 }] };

  buildInventoryComparison(morningInput, endingInput, salesInput);

  expect(morningInput).toEqual([{ productId: "p1", productName: "Loaf", qty: 200 }]);
  expect(endingInput).toEqual([
    { productId: "p1", productName: "Loaf", endingBo: 10, endingBalance: 10 },
  ]);
  expect(salesInput).toEqual({ store1: [{ productId: "p1", qty: 180, boQty: 10 }] });
});
