import { canModifyCreditEntry } from "@/src/features/store/core/can-modify-credit-entry";

const OWN_PAST_CREDIT = {
  recordedBy: "agent-1",
  entryType: "credit" as const,
  sessionStoreId: "ss-old",
};

test("the agent who recorded an entry may change it", () => {
  expect(canModifyCreditEntry(OWN_PAST_CREDIT, "agent-1", "ss-open")).toBe(
    true,
  );
});

test("a colleague's entry is read-only, however it got onto this device", () => {
  expect(
    canModifyCreditEntry(
      { ...OWN_PAST_CREDIT, recordedBy: "agent-2" },
      "agent-1",
      "ss-open",
    ),
  ).toBe(false);
});

test("nobody signed in means nothing is writable", () => {
  expect(canModifyCreditEntry(OWN_PAST_CREDIT, null, "ss-open")).toBe(false);
});

test("the credit for the visit being logged is not correctable — the orders are", () => {
  expect(
    canModifyCreditEntry(
      { ...OWN_PAST_CREDIT, sessionStoreId: "ss-open" },
      "agent-1",
      "ss-open",
    ),
  ).toBe(false);
});

test("a payment taken on the visit being logged still is", () => {
  expect(
    canModifyCreditEntry(
      { recordedBy: "agent-1", entryType: "payment", sessionStoreId: "ss-open" },
      "agent-1",
      "ss-open",
    ),
  ).toBe(true);
});

test("a payment carries no visit at all, and is correctable", () => {
  expect(
    canModifyCreditEntry(
      { recordedBy: "agent-1", entryType: "payment", sessionStoreId: null },
      "agent-1",
      "ss-open",
    ),
  ).toBe(true);
});

test("off a visit, nothing is being re-derived and an own credit stands", () => {
  expect(
    canModifyCreditEntry(
      { ...OWN_PAST_CREDIT, sessionStoreId: "ss-open" },
      "agent-1",
      null,
    ),
  ).toBe(true);
});
