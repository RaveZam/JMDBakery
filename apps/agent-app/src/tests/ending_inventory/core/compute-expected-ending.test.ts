import { computeExpectedEnding } from "@/src/features/ending_inventory/core/compute-expected-ending";

test("empty items is an empty map", () => {
  expect(computeExpectedEnding([], {})).toEqual({});
});

test("no sales yet leaves the full stocked qty as balance and no bo", () => {
  expect(computeExpectedEnding([{ productId: "p1", qty: 40 }], {})).toEqual({
    p1: { bo: 0, balance: 40 },
  });
});

test("sold and bo are both subtracted from the balance, bo kept on its own", () => {
  const result = computeExpectedEnding([{ productId: "p1", qty: 200 }], {
    p1: { sold: 180, bo: 10 },
  });
  expect(result).toEqual({ p1: { bo: 10, balance: 10 } });
});

test("multiple products are computed independently", () => {
  const result = computeExpectedEnding(
    [
      { productId: "p1", qty: 40 },
      { productId: "p2", qty: 12 },
    ],
    { p1: { sold: 15, bo: 3 } },
  );
  expect(result).toEqual({
    p1: { bo: 3, balance: 22 },
    p2: { bo: 0, balance: 12 },
  });
});

test("does not mutate its inputs", () => {
  const items = [{ productId: "p1", qty: 40 }];
  const salesCounts = { p1: { sold: 15, bo: 2 } };
  computeExpectedEnding(items, salesCounts);
  expect(items).toEqual([{ productId: "p1", qty: 40 }]);
  expect(salesCounts).toEqual({ p1: { sold: 15, bo: 2 } });
});
