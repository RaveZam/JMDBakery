import { sumCollectedPayments } from "@/src/features/history/core/sum-collected-payments";

test("adds the payments up", () => {
  expect(sumCollectedPayments([{ amount: 300 }, { amount: 450.5 }])).toBe(750.5);
});

test("a session that collected nothing totals zero", () => {
  expect(sumCollectedPayments([])).toBe(0);
});
