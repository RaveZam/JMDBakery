"use server";

import { createClient } from "@/utils/supabase/server";
import { STORE_SALES_PAGE_SIZE } from "../types/store-types";
import type { StoreSalesPage } from "../types/store-types";

type StoreSaleRow = {
  id: string;
  created_at: string;
  product_name: string | null;
  unit_price: number | string | null;
  quantity_sold: number | null;
  quantity_bo: number | null;
  bo_reason: string | null;
  total: number | string | null;
  agent_name: string | null;
  total_count: number | string;
};

/**
 * One page of a store's sales in the last 30 days, newest first. Uncached —
 * the Sales Log panel is opened rarely enough that a fresh read is fine.
 */
export async function getStoreSales(
  storeIds: string[],
  page: number,
): Promise<StoreSalesPage> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_store_sales_log", {
    p_store_ids: storeIds,
    p_limit: STORE_SALES_PAGE_SIZE,
    p_offset: (page - 1) * STORE_SALES_PAGE_SIZE,
  });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as StoreSaleRow[];

  return {
    sales: rows.map((row) => ({
      id: row.id,
      productName: row.product_name ?? "Unknown product",
      unitPrice: Number(row.unit_price ?? 0),
      quantitySold: Number(row.quantity_sold ?? 0),
      quantityBadOrder: Number(row.quantity_bo ?? 0),
      badOrderReason: row.bo_reason,
      total: Number(row.total ?? 0),
      agentName: row.agent_name,
      createdAt: row.created_at,
    })),
    totalCount: rows.length > 0 ? Number(rows[0].total_count) : 0,
  };
}
