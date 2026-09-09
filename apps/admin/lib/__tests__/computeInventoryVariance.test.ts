import { computeInventoryVariance } from "../computeInventoryVariance";

test("a clean route: counts match expectation on both sides", () => {
  expect(computeInventoryVariance(200, 180, 10, 10, 10)).toEqual({
    expectedBo: 10,
    expectedBalance: 10,
    boVariance: 0,
    balanceVariance: 0,
  });
});

test("balance short of expectation reads a negative balance variance", () => {
  expect(computeInventoryVariance(200, 180, 10, 10, 5)).toEqual({
    expectedBo: 10,
    expectedBalance: 10,
    boVariance: 0,
    balanceVariance: -5,
  });
});

test("more counted than expected reads a positive variance", () => {
  expect(computeInventoryVariance(200, 180, 10, 10, 15)).toEqual({
    expectedBo: 10,
    expectedBalance: 10,
    boVariance: 0,
    balanceVariance: 5,
  });
});

test("a bad order counted as good stock reads off on both variances", () => {
  // 10 expected BO, 0 counted; 10 expected balance, 20 counted.
  expect(computeInventoryVariance(200, 180, 10, 0, 20)).toEqual({
    expectedBo: 10,
    expectedBalance: 10,
    boVariance: -10,
    balanceVariance: 10,
  });
});

test("no sales, no bad orders: everything expected as balance", () => {
  expect(computeInventoryVariance(50, 0, 0, 0, 50)).toEqual({
    expectedBo: 0,
    expectedBalance: 50,
    boVariance: 0,
    balanceVariance: 0,
  });
});
