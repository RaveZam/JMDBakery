import { toggleInSet } from "@/src/features/history/core/toggle-in-set";

test("adds a value that wasn't in the set", () => {
  const result = toggleInSet(new Set(["a"]), "b");
  expect([...result].sort()).toEqual(["a", "b"]);
});

test("removes a value that was in the set", () => {
  const result = toggleInSet(new Set(["a", "b"]), "b");
  expect([...result]).toEqual(["a"]);
});

test("does not mutate the input set", () => {
  const input = new Set(["a"]);
  toggleInSet(input, "b");
  expect([...input]).toEqual(["a"]);
});
