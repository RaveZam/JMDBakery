import { render, screen, fireEvent } from "@testing-library/react-native";
import { CreditDetailView } from "@/src/features/store/components/credit-modal-components/CreditDetailView";
import type { CreditEntry } from "@/src/features/store/types/store-types";

// What the credit modal is allowed to offer. The gate itself is canModify —
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

const PAYMENT: CreditEntry = {
  ...ENTRY,
  entryType: "payment",
  sessionStoreId: null,
};

function renderDetailView(overrides: {
  entry?: CreditEntry;
  canModify: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  render(
    <CreditDetailView
      entry={overrides.entry ?? ENTRY}
      items={[]}
      canPay
      canModify={overrides.canModify}
      onClose={jest.fn()}
      onPay={jest.fn()}
      onEdit={overrides.onEdit ?? jest.fn()}
      onDelete={overrides.onDelete ?? jest.fn()}
    />,
  );
}

test("the agent's own credit offers Edit and Delete", () => {
  renderDetailView({ canModify: true });

  expect(screen.getByText("Edit")).toBeTruthy();
  expect(screen.getByText("Delete")).toBeTruthy();
});

test("a colleague's credit is read-only", () => {
  renderDetailView({ canModify: false });

  expect(screen.queryByText("Edit")).toBeNull();
  expect(screen.queryByText("Delete")).toBeNull();
});

test("the agent's own payment offers Edit and Delete too", () => {
  renderDetailView({ entry: PAYMENT, canModify: true });

  expect(screen.getByText("Edit")).toBeTruthy();
  expect(screen.getByText("Delete")).toBeTruthy();
});

test("a colleague's payment is read-only", () => {
  renderDetailView({ entry: PAYMENT, canModify: false });

  expect(screen.queryByText("Edit")).toBeNull();
  expect(screen.queryByText("Delete")).toBeNull();
});

test("tapping Edit opens the edit form", () => {
  const onEdit = jest.fn();
  renderDetailView({ canModify: true, onEdit });

  fireEvent.press(screen.getByText("Edit"));

  expect(onEdit).toHaveBeenCalled();
});

test("tapping Delete asks the controller to remove the entry", () => {
  const onDelete = jest.fn();
  renderDetailView({ canModify: true, onDelete });

  fireEvent.press(screen.getByText("Delete"));

  expect(onDelete).toHaveBeenCalled();
});
