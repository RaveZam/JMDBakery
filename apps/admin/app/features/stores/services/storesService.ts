"use server";

import { createClient } from "@/utils/supabase/server";
import type { StoreRow, TopProduct } from "../types/store-types";

type StoreWithRevenueRow = {
  id: string;
  store_name: string;
  contact_number: string | null;
  contact_name: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  created_at: string;
  total_revenue: number | string;
};

type TopProductRow = {
  product_name: string;
  revenue: number | string;
};

export async function getStoresWithRevenue(): Promise<StoreRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_stores_with_revenue");

  if (error) throw new Error(error.message);

  return ((data ?? []) as StoreWithRevenueRow[]).map((s) => ({
    id: s.id,
    storeName: s.store_name,
    contactNumber: s.contact_number,
    contactName: s.contact_name,
    province: s.province,
    city: s.city,
    barangay: s.barangay,
    createdAt: s.created_at,
    totalRevenue: Number(s.total_revenue),
  }));
}

export async function getStoreTopProducts(
  storeId: string,
): Promise<TopProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_store_top_products", {
    p_store_id: storeId,
  });

  if (error) throw new Error(error.message);

  return ((data ?? []) as TopProductRow[]).map((p) => ({
    productName: p.product_name,
    revenue: Number(p.revenue),
  }));
}
