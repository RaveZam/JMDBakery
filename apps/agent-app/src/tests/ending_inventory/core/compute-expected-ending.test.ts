import { computeExpectedEnding } from "@/src/features/ending_inventory/core/compute-expected-ending";

test("empty items is an empty map", () => {
  expect(computeExpectedEnding([], {})).toEqual({});
});

test("no sales yet leaves the full stocked qty expected", () => {
  expect(computeExpectedEnding([{ productId: "p1", qty: 40 }], {})).toEqual({
    p1: 40,
  });
});

test("bo units are not subtracted, only sold is", () => {
  const result = computeExpectedEnding([{ productId: "p1", qty: 200 }], {
    p1: { sold: 180, bo: 10 },
  });
  expect(result).toEqual({ p1: 20 });
});

test("multiple products are computed independently", () => {
  const result = computeExpectedEnding(
    [
      { productId: "p1", qty: 40 },
      { productId: "p2", qty: 12 },
    ],
    { p1: { sold: 15, bo: 3 } },
  );
  expect(result).toEqual({ p1: 25, p2: 12 });
});

test("does not mutate its inputs", () => {
  const items = [{ productId: "p1", qty: 40 }];
  const salesCounts = { p1: { sold: 15, bo: 2 } };
  computeExpectedEnding(items, salesCounts);
  expect(items).toEqual([{ productId: "p1", qty: 40 }]);
  expect(salesCounts).toEqual({ p1: { sold: 15, bo: 2 } });
});
