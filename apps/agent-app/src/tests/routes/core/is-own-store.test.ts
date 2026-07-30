import { isOwnStore } from "@/src/features/routes/core/is-own-store";

test("a store the signed-in agent registered is theirs", () => {
  expect(isOwnStore({ created_by: "agent-1" }, "agent-1")).toBe(true);
});

test("a store a colleague registered is not", () => {
  expect(isOwnStore({ created_by: "agent-2" }, "agent-1")).toBe(false);
});

// Failing this way only turns Delete into Remove, which unlinks and can be
// undone. Guessing "own" would let anyone destroy a colleague's store.
test("an unattributed store is not own, so nothing unknown looks destroyable", () => {
  expect(isOwnStore({ created_by: null }, "agent-1")).toBe(false);
});

test("nothing is own before the agent is known", () => {
  expect(isOwnStore({ created_by: "agent-1" }, null)).toBe(false);
  expect(isOwnStore({ created_by: null }, null)).toBe(false);
});
