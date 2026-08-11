import type {
  CreditLedgerEntry,
  GroupedStoreRow,
  StoreCreditByStore,
} from "./types/store-types";

// Placeholder credit figures so the balance badge and the modal's Credit panel
// can be reviewed before anything reads store_credit_entries. Swap for a real
// query when the data layer is built; the components take these shapes already.
const MOCK_BALANCES = [8150, 2300, 0, 15600];

export const MOCK_LEDGER: CreditLedgerEntry[] = [
  {
    id: "e1",
    entryType: "payment",
    amount: 3500,
    note: null,
    recordedByName: "Marvin Dela Cruz",
    tenderedByName: "Marvin Dela Cruz",
    createdAt: "2026-08-10T09:15:00Z",
  },
  {
    id: "e2",
    entryType: "credit",
    amount: 5900,
    note: "3 orders",
    recordedByName: "Marvin Dela Cruz",
    tenderedByName: "Marvin Dela Cruz",
    createdAt: "2026-08-08T02:40:00Z",
  },
  {
    id: "e3",
    entryType: "payment",
    amount: 4750,
    note: null,
    recordedByName: "Marvin Dela Cruz",
    tenderedByName: "Marvin Dela Cruz",
    createdAt: "2026-08-05T08:05:00Z",
  },
  {
    id: "e4",
    entryType: "credit",
    amount: 4100,
    note: "2 orders",
    recordedByName: "Rico Panganiban",
    tenderedByName: "Rico Panganiban",
    createdAt: "2026-08-01T01:20:00Z",
  },
  {
    id: "e5",
    entryType: "payment",
    amount: 6000,
    note: null,
    recordedByName: "Rico Panganiban",
    tenderedByName: "Rico Panganiban",
    createdAt: "2026-07-28T07:30:00Z",
  },
];

/**
 * Gives the first few stores a balance so both states of the badge are
 * visible — one store deliberately sits at zero and should show no badge.
 */
export function attachMockCredit(
  stores: GroupedStoreRow[],
): StoreCreditByStore[] {
  return stores.map((store, index) => {
    const balance = MOCK_BALANCES[index] ?? 0;
    return {
      ...store,
      balance,
      creditTaken: balance + 54250,
      paidBack: 54250,
      lastPaymentAt: balance > 0 ? "2026-08-10T09:15:00Z" : null,
    };
  });
}
