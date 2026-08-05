export type Product = {
  id: string;
  name: string;
  price: number;
};

export const PRESET_REASONS = [
  "Rotten",
  "Damaged",
  "Lost",
  "Returned",
  "Custom",
] as const;
export type PresetReason = (typeof PRESET_REASONS)[number];

export type SessionStoreDetails = {
  id: string;
  route_session_id: string;
  store_id: string;
  store_name: string;
  store_province: string | null;
  store_city: string | null;
  store_barangay: string | null;
  store_contact_name: string | null;
  province_name: string | null;
  visited: number;
  created_at: string;
};

export type CreditEntry = {
  id: string;
  storeId: string;
  sessionStoreId: string | null;
  entryType: "credit" | "payment";
  amount: number;
  note: string | null;
  // Who owns the row as far as Supabase is concerned: only this agent may edit
  // or delete it, even though every agent can read it.
  recordedBy: string;
  recordedByName: string | null;
  createdAt: string;
};

export type LoggedItem = {
  saleId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  boQty: number;
  boReason?: string;
  paymentType: "cash" | "credit";
};

export type SoldRowProps = {
  item: LoggedItem;
  index: number;
  onPress: () => void;
  onDelete: (i: number) => void;
};

export type SectionRowProps = {
  label: string;
  buttonLabel: string;
  onToggle: () => void;
};
