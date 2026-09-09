import { parseCountEntry } from "@/src/features/ending_inventory/core/parse-count-entry";

test("reads a typed number", () => {
  expect(parseCountEntry("47")).toBe(47);
});

test("an empty field mid-edit reads as 0, not NaN", () => {
  expect(parseCountEntry("")).toBe(0);
});

test("text that isn't a number reads as 0", () => {
  expect(parseCountEntry("abc")).toBe(0);
});

test("takes the leading digits when a stray character follows", () => {
  expect(parseCountEntry("4a7")).toBe(4);
});

test("a negative entry clamps to 0", () => {
  expect(parseCountEntry("-3")).toBe(0);
});
