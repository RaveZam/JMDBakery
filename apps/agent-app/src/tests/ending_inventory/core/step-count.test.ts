import { stepCount } from "@/src/features/ending_inventory/core/step-count";

test("adds the delta to the count", () => {
  expect(stepCount(4, 1)).toBe(5);
});

test("subtracts a negative delta", () => {
  expect(stepCount(4, -1)).toBe(3);
});

test("stops at zero instead of going negative", () => {
  expect(stepCount(0, -1)).toBe(0);
});

test("clamps a delta that would overshoot past zero", () => {
  expect(stepCount(2, -5)).toBe(0);
});
