export type Product = {
  id: string;
  name: string;
  price: number;
};

export const PRESET_REASONS = ["Rotten", "Damaged", "Lost", "Custom"] as const;
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

export type LoggedItem = {
  saleId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  boQty: number;
  boReason?: string;
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

