import { hasEnoughStock } from "@/src/features/store/core/has-enough-stock";

test("requested quantity within remaining is enough", () => {
  expect(hasEnoughStock({ quantity: 5, boQty: 2, remaining: 10 })).toBe(true);
});

test("requested quantity over remaining is not enough", () => {
  expect(hasEnoughStock({ quantity: 4, boQty: 3, remaining: 5 })).toBe(false);
});

test("requested quantity exactly matching remaining is enough", () => {
  expect(hasEnoughStock({ quantity: 5, boQty: 0, remaining: 5 })).toBe(true);
});

test("editing adds the sale's original quantity/boQty back before checking", () => {
  const input = {
    quantity: 8,
    boQty: 0,
    remaining: 5,
    editingOriginal: { quantity: 3, boQty: 1 },
  };
  expect(hasEnoughStock(input)).toBe(true);
});

test("editing still rejects a request beyond the restored total", () => {
  const input = {
    quantity: 10,
    boQty: 0,
    remaining: 5,
    editingOriginal: { quantity: 3, boQty: 1 },
  };
  expect(hasEnoughStock(input)).toBe(false);
});
