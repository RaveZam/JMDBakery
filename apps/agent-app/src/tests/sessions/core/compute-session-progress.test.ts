import { computeSessionProgress } from "./compute-session-progress";

test("empty session is 0% with no divide-by-zero", () => {
  expect(computeSessionProgress(0, 0)).toEqual({
    visited: 0,
    total: 0,
    ratio: 0,
    percent: 0,
  });
});

test("half visited is 50%", () => {
  expect(computeSessionProgress(1, 2)).toEqual({
    visited: 1,
    total: 2,
    ratio: 0.5,
    percent: 50,
  });
});

test("all visited is 100%", () => {
  const p = computeSessionProgress(3, 3);
  expect(p.ratio).toBe(1);
  expect(p.percent).toBe(100);
});

test("percent is rounded for uneven ratios", () => {
  // 1/3 = 0.333… → 33, not 33.3
  expect(computeSessionProgress(1, 3).percent).toBe(33);
  // 2/3 = 0.666… → 67 (rounds up)
  expect(computeSessionProgress(2, 3).percent).toBe(67);
});
