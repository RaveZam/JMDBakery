import { hasEnoughStock } from "./has-enough-stock";

test("requested qty within remaining is enough", () => {
  expect(hasEnoughStock({ qty: 5, boQty: 2, remaining: 10 })).toBe(true);
});

test("requested qty over remaining is not enough", () => {
  expect(hasEnoughStock({ qty: 4, boQty: 3, remaining: 5 })).toBe(false);
});

test("requested qty exactly matching remaining is enough", () => {
  expect(hasEnoughStock({ qty: 5, boQty: 0, remaining: 5 })).toBe(true);
});

test("editing adds the sale's original qty/boQty back before checking", () => {
  const input = {
    qty: 8,
    boQty: 0,
    remaining: 5,
    editingOriginal: { qty: 3, boQty: 1 },
  };
  expect(hasEnoughStock(input)).toBe(true);
});

test("editing still rejects a request beyond the restored total", () => {
  const input = {
    qty: 10,
    boQty: 0,
    remaining: 5,
    editingOriginal: { qty: 3, boQty: 1 },
  };
  expect(hasEnoughStock(input)).toBe(false);
});
