export type StoreRow = {
  id: string;
  storeName: string;
  contactNumber: string | null;
  contactName: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  createdAt: string;
  totalRevenue: number;
};

// One card in the admin grid after storeHelpers.groupStoresByLocation() merges
// StoreRows that share the same (storeName, barangay, city, province), e.g.
// duplicate DB rows created by inconsistent casing/whitespace at data entry.
// `id`/display fields come from the most-recently-created row in the group;
// `memberIds` lists every underlying stores.id folded into this card (a
// single-element array when no duplicates were found for that store).
export type GroupedStoreRow = StoreRow & { memberIds: string[] };

export type TopProduct = { productName: string; revenue: number };

// All-time, unlike revenue, which is windowed: a debt taken three months ago
// is still owed today.
export type StoreCredit = {
  storeId: string;
  creditTaken: number;
  paidBack: number;
  balance: number;
  lastPaymentAt: string | null;
};

// A grouped store card with its credit totals folded in (see
// attachCreditToStores). Omits storeId because the card already carries the
// canonical `id` plus every `memberIds` the totals were summed across.
export type StoreCreditByStore = GroupedStoreRow & Omit<StoreCredit, "storeId">;

// Rank is assigned across every store before the search filter runs, so a row
// shows its true standing on the revenue board even in a filtered list.
export type RankedStore = StoreCreditByStore & { rank: number };

export type CreditLedgerEntry = {
  id: string;
  entryType: "credit" | "payment";
  amount: number;
  note: string | null;
  /** Who typed the entry into the app. */
  recordedByName: string | null;
  /** Who accepted the cash. Already resolved to recordedByName when the same. */
  tenderedByName: string | null;
  createdAt: string;
};

export type StoreStats = {
  storeCount: number;
  totalRevenue: number;
  topProvince: string | null;
};
