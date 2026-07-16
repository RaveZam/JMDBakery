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
