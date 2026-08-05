import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useCredit } from "@/src/features/store/hooks/useCredit";
import {
  deleteCreditEntry,
  getCreditEntriesForStore,
  updateCreditEntryAmount,
} from "@/src/features/store/services/store-credit-service";
import type { CreditEntry } from "@/src/features/store/types/store-types";

// The edit/delete wiring on the credit modal. What gets written is covered
// against a real DB in credit-entry-edit-service.test.ts; this covers what the
// screen is allowed to offer and what it hands the service.

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ sessionStoreId: "ss-1" }),
}));

jest.mock("@/src/features/store/services/store-services", () => ({
  getSessionStoreById: () => ({ store_id: "store-9" }),
}));

jest.mock("@/src/features/store/services/store-credit-service");
const mockedEntries = getCreditEntriesForStore as jest.Mock;

// Who's signed in is cached in SQLite, which this test has no schema for.
jest.mock("@/src/lib/current-user", () => ({
  getCurrentUserId: () => "agent-1",
  getCurrentUserName: () => "Raven",
}));

// A credit from an earlier visit. The one for the visit on screen is derived
// from its orders and deliberately not correctable — see the test below.
const OWN_CREDIT: CreditEntry = {
  id: "entry-1",
  storeId: "store-9",
  sessionStoreId: "ss-earlier",
  entryType: "credit",
  amount: 750,
  note: null,
  recordedBy: "agent-1",
  recordedByName: "Raven",
  createdAt: "2026-08-05T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedEntries.mockReturnValue([OWN_CREDIT]);
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

/** Render with the modal open on `entry`. */
function renderOpenOn(entry: CreditEntry) {
  mockedEntries.mockReturnValue([entry]);
  const rendered = renderHook(() => useCredit());
  act(() => rendered.result.current.openEntry(entry));
  return rendered;
}

function confirmDelete() {
  const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
  act(() =>
    buttons.find((b: { style: string }) => b.style === "destructive").onPress(),
  );
}

test("the agent's own credit offers edit and delete", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  expect(result.current.canModify).toBe(true);
});

test("a colleague's credit does not", () => {
  const { result } = renderOpenOn({ ...OWN_CREDIT, recordedBy: "agent-2" });

  expect(result.current.canModify).toBe(false);
});

// Correcting it would save and then quietly revert: the next order added,
// edited or deleted at this stop re-derives the amount from the credit orders.
test("the credit for the visit on screen does not either", () => {
  const { result } = renderOpenOn({ ...OWN_CREDIT, sessionStoreId: "ss-1" });

  expect(result.current.canModify).toBe(false);
});

test("a payment taken on the visit on screen still does", () => {
  const { result } = renderOpenOn({
    ...OWN_CREDIT,
    entryType: "payment",
    sessionStoreId: "ss-1",
  });

  expect(result.current.canModify).toBe(true);
});

test("opening the edit form seeds the field with what's on the ledger", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.openEdit());

  expect(result.current.mode).toBe("edit");
  expect(result.current.draftText).toBe("750");
});

test("saving sends the corrected amount and closes the modal", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.openEdit());
  act(() => result.current.setDraftText("600"));
  act(() => result.current.save());

  expect(updateCreditEntryAmount).toHaveBeenCalledWith("entry-1", 600);
  expect(result.current.mode).toBeNull();
});

test("an empty field saves nothing", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.openEdit());
  act(() => result.current.setDraftText(""));
  act(() => result.current.save());

  expect(updateCreditEntryAmount).not.toHaveBeenCalled();
});

test("deleting asks first, then removes the entry", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.remove());
  expect(deleteCreditEntry).not.toHaveBeenCalled();

  confirmDelete();
  expect(deleteCreditEntry).toHaveBeenCalledWith("entry-1");
  expect(result.current.mode).toBeNull();
});

test("dismissing the confirm leaves the entry alone", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.remove());

  expect(deleteCreditEntry).not.toHaveBeenCalled();
  expect(result.current.mode).toBe("entry");
});

test("closing the modal drops a half-typed correction", () => {
  const { result } = renderOpenOn(OWN_CREDIT);

  act(() => result.current.openEdit());
  act(() => result.current.setDraftText("123"));
  act(() => result.current.close());

  expect(result.current.draftText).toBe("");
});
