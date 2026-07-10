import { computeRemaining } from "@/src/features/store/core/compute-remaining";

test("empty items is an empty map", () => {
  expect(computeRemaining([], {})).toEqual({});
});

test("no sales yet leaves the full stocked qty remaining", () => {
  expect(computeRemaining([{ productId: "p1", qty: 40 }], {})).toEqual({
    p1: 40,
  });
});

test("subtracts sold and bo counts from stocked qty", () => {
  const result = computeRemaining(
    [{ productId: "p1", qty: 40 }],
    { p1: { sold: 15, bo: 2 } },
  );
  expect(result).toEqual({ p1: 23 });
});

test("multiple products are computed independently", () => {
  const result = computeRemaining(
    [
      { productId: "p1", qty: 40 },
      { productId: "p2", qty: 12 },
    ],
    { p1: { sold: 15, bo: 0 } },
  );
  expect(result).toEqual({ p1: 25, p2: 12 });
});
