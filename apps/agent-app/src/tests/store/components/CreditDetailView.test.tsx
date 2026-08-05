import { render, screen, fireEvent } from "@testing-library/react-native";
import { CreditDetailView } from "@/src/features/store/components/credit-modal-components/CreditDetailView";
import type { CreditController } from "@/src/features/store/hooks/useCredit";
import type { CreditEntry } from "@/src/features/store/types/store-types";

// What the credit slip is allowed to offer. The gate itself is canModify —
// Supabase only lets an agent write back entries they recorded.

const ENTRY: CreditEntry = {
  id: "entry-1",
  storeId: "store-9",
  sessionStoreId: "ss-1",
  entryType: "credit",
  amount: 750,
  note: null,
  recordedBy: "agent-1",
  recordedByName: "Raven",
  createdAt: "2026-08-05T00:00:00.000Z",
};

function makeCredit(overrides: {
  entry?: CreditEntry;
  canModify?: boolean;
  balance?: number;
}): CreditController {
  return {
    entries: [ENTRY],
    balance: overrides.balance ?? 750,
    remainingByEntryId: {},
    reload: jest.fn(),
    modal: {
      mode: "entry",
      entry: overrides.entry ?? ENTRY,
      items: [],
      openEntry: jest.fn(),
      openPayment: jest.fn(),
      openEdit: jest.fn(),
      close: jest.fn(),
    },
    payment: {
      text: "",
      amount: 0,
      setText: jest.fn(),
      payFull: jest.fn(),
      reset: jest.fn(),
      record: jest.fn(),
    },
    edit: {
      text: "750",
      amount: 750,
      setText: jest.fn(),
      canModify: overrides.canModify ?? true,
      open: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    },
  } as unknown as CreditController;
}

test("the agent's own credit offers Edit and Delete", () => {
  render(<CreditDetailView credit={makeCredit({ canModify: true })} />);

  expect(screen.getByText("Edit")).toBeTruthy();
  expect(screen.getByText("Delete")).toBeTruthy();
});

test("a colleague's credit is read-only", () => {
  render(<CreditDetailView credit={makeCredit({ canModify: false })} />);

  expect(screen.queryByText("Edit")).toBeNull();
  expect(screen.queryByText("Delete")).toBeNull();
});

const PAYMENT: CreditEntry = {
  ...ENTRY,
  entryType: "payment",
  sessionStoreId: null,
};

test("the agent's own payment offers Edit and Delete too", () => {
  render(
    <CreditDetailView
      credit={makeCredit({ entry: PAYMENT, canModify: true })}
    />,
  );

  expect(screen.getByText("Edit")).toBeTruthy();
  expect(screen.getByText("Delete")).toBeTruthy();
});

test("a colleague's payment is read-only", () => {
  render(
    <CreditDetailView
      credit={makeCredit({ entry: PAYMENT, canModify: false })}
    />,
  );

  expect(screen.queryByText("Edit")).toBeNull();
  expect(screen.queryByText("Delete")).toBeNull();
});

test("tapping Edit opens the edit form", () => {
  const credit = makeCredit({ canModify: true });
  render(<CreditDetailView credit={credit} />);

  fireEvent.press(screen.getByText("Edit"));

  expect(credit.modal.openEdit).toHaveBeenCalled();
});

test("tapping Delete asks the controller to remove the entry", () => {
  const credit = makeCredit({ canModify: true });
  render(<CreditDetailView credit={credit} />);

  fireEvent.press(screen.getByText("Delete"));

  expect(credit.edit.remove).toHaveBeenCalled();
});
