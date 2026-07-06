export type Product = {
  id: string;
  name: string;
  price: number;
};

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

export type EditData = {
  productId: string;
  qty: number;
  boQty: number;
  boReason?: string;
};

export type AdderPanelProps = {
  products: Product[];
  showPrice: boolean;
  editData?: EditData;
  remainingByProduct?: Record<string, number>;
  onAdd: (
    productId: string,
    qty: number,
    boQty: number,
    boReason?: string,
  ) => void;
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

export type StoreHeaderProps = {
  storeName: string;
  location?: string;
  onBack: () => void;
};

export type OrdersSectionProps = {
  items: { item: LoggedItem; idx: number }[];
  onAddPress: () => void;
  onItemPress: (idx: number) => void;
  onDeleteItem: (idx: number) => void;
};

export type VisitFooterProps = {
  netTotal: number;
  onConfirm: () => void;
};
