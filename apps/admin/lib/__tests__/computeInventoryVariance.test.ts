import { computeInventoryVariance } from "../computeInventoryVariance";

test("bo units are not subtracted: counting all of them reads variance 0", () => {
  // 200 loaded, 180 sold, 10 bo -> expected 20, counted 20 -> no drift
  expect(computeInventoryVariance(200, 180, 20)).toEqual({ expected: 20, variance: 0 });
});

test("counting only the good stock (excluding bo) reads a negative variance", () => {
  expect(computeInventoryVariance(200, 180, 10)).toEqual({ expected: 20, variance: -10 });
});

test("counting more than expected reads a positive variance", () => {
  expect(computeInventoryVariance(200, 180, 25)).toEqual({ expected: 20, variance: 5 });
});

test("no sales yet: expected equals morning stock", () => {
  expect(computeInventoryVariance(50, 0, 50)).toEqual({ expected: 50, variance: 0 });
});
