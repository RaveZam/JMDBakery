import { buildInventoryComparison } from "@/src/features/history/core/inventory-comparison";

const morning = [{ productId: "p1", productName: "Loaf", qty: 200 }];

test("bo counted in expected: end matching morning-sold-only reads variance 0", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", quantity: 20 }],
    { store1: [{ productId: "p1", qty: 180, boQty: 10 }] },
  );
  expect(rows).toEqual([
    {
      productId: "p1",
      productName: "Loaf",
      start: 200,
      sold: 180,
      bo: 10,
      end: 20,
      expected: 20,
      balance: 10,
      variance: 0,
    },
  ]);
});

test("counting only the good stock (excluding bo) reads a negative variance", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", quantity: 10 }],
    { store1: [{ productId: "p1", qty: 180, boQty: 10 }] },
  );
  expect(rows[0].expected).toBe(20);
  // balance drops the 10 BO units: 200 - 180 - 10
  expect(rows[0].balance).toBe(10);
  expect(rows[0].variance).toBe(-10);
});

test("sales split across stores are summed separately for sold and bo", () => {
  const rows = buildInventoryComparison(
    morning,
    [{ productId: "p1", productName: "Loaf", quantity: 20 }],
    {
      store1: [{ productId: "p1", qty: 100, boQty: 4 }],
      store2: [{ productId: "p1", qty: 80, boQty: 6 }],
    },
  );
  expect(rows[0]).toMatchObject({ sold: 180, bo: 10 });
});

test("no ending row yet: end and variance are null, not 0", () => {
  const rows = buildInventoryComparison(morning, [], {
    store1: [{ productId: "p1", qty: 50, boQty: 0 }],
  });
  expect(rows[0].end).toBeNull();
  expect(rows[0].variance).toBeNull();
  expect(rows[0].expected).toBe(150);
});

test("product present in ending but not morning still gets a row", () => {
  const rows = buildInventoryComparison(
    [],
    [{ productId: "p2", productName: "Bun", quantity: 5 }],
    {},
  );
  expect(rows).toEqual([
    {
      productId: "p2",
      productName: "Bun",
      start: 0,
      sold: 0,
      bo: 0,
      end: 5,
      expected: 0,
      balance: 0,
      variance: 5,
    },
  ]);
});

test("does not mutate its inputs", () => {
  const morningInput = [{ productId: "p1", productName: "Loaf", qty: 200 }];
  const endingInput = [{ productId: "p1", productName: "Loaf", quantity: 20 }];
  const salesInput = { store1: [{ productId: "p1", qty: 180, boQty: 10 }] };

  buildInventoryComparison(morningInput, endingInput, salesInput);

  expect(morningInput).toEqual([{ productId: "p1", productName: "Loaf", qty: 200 }]);
  expect(endingInput).toEqual([{ productId: "p1", productName: "Loaf", quantity: 20 }]);
  expect(salesInput).toEqual({ store1: [{ productId: "p1", qty: 180, boQty: 10 }] });
});
