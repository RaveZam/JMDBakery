export type SessionRow = {
  id: string;
  routeName: string;
  sessionDate: string;
  conductedBy: string;
  conductedByName: string;
  status: "ongoing" | "completed";
  createdAt: string;
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
  productName: string;
  snapshotPrice: number;
  quantitySold: number;
  quantityBO: number;
  boReason: string | null;
  total: number;
};

export type SessionInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  createdAt: string;
};
