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

export type TopProduct = { productName: string; revenue: number };
