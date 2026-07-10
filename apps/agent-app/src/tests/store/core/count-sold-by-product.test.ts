import { countSoldByProduct } from "./count-sold-by-product";
import type { LoggedItem } from "../types/store-types";

const item = (over: Partial<LoggedItem>): LoggedItem => ({
  saleId: "sale",
  productId: "p1",
  productName: "Pandesal",
  price: 5,
  qty: 0,
  boQty: 0,
  ...over,
});

test("empty input is an empty map", () => {
  expect(countSoldByProduct([])).toEqual({});
});

test("single row maps to its sold and bo totals", () => {
  expect(countSoldByProduct([item({ qty: 40, boQty: 2 })])).toEqual({
    p1: { sold: 40, bo: 2 },
  });
});

test("multiple rows for the same product accumulate", () => {
  const result = countSoldByProduct([
    item({ productId: "p1", qty: 40, boQty: 2 }),
    item({ productId: "p1", qty: 10, boQty: 1 }),
  ]);
  expect(result).toEqual({ p1: { sold: 50, bo: 3 } });
});

test("different products stay separate", () => {
  const result = countSoldByProduct([
    item({ productId: "p1", qty: 40, boQty: 2 }),
    item({ productId: "p2", qty: 12, boQty: 0 }),
  ]);
  expect(result).toEqual({
    p1: { sold: 40, bo: 2 },
    p2: { sold: 12, bo: 0 },
  });
});
