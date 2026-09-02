export type SessionRow = {
  id: string;
  routeName: string;
  agentName: string | null;
  sessionDate: string;
  createdAt: string | null;
  status: "ongoing" | "completed" | "cancelled";
  totalStores: number;
  visitedStores: number;
};

export type SessionStoreRow = {
  id: string;
  storeId: string;
  storeName: string;
  province: string | null;
  city: string | null;
  barangay: string | null;
  visited: boolean;
};

export type SessionStoreSaleRow = {
  id: string;
  createdAt: string | null;
  productName: string;
  snapshotPrice: number;
  quantitySold: number;
  quantityBO: number;
  boReason: string | null;
  paymentType: "cash" | "credit";
  total: number;
};

export type InventorySummaryRow = {
  productId: string;
  productName: string;
  morning: number;
  sold: number;
  backOrder: number;
  expected: number;
  balance: number;
  ending: number;
  variance: number;
};

export type SessionPaymentRow = {
  id: string;
  sessionStoreId: string;
  amount: number;
  note: string | null;
  recordedByName: string | null;
  createdAt: string;
};
