"use server";

import { createClient } from "@/utils/supabase/server";
import type {
  InventorySummaryRow,
  SessionRow,
  SessionStoreRow,
  SessionStoreSaleRow,
} from "../types/session-types";

type SessionQueryRow = {
  id: string;
  route_name: string;
  session_date: string;
  status: string;
  session_stores: { visited: boolean }[] | null;
};

function mapSessionRow(row: SessionQueryRow): SessionRow {
  const storeRows = row.session_stores ?? [];
  return {
    id: row.id,
    routeName: row.route_name,
    sessionDate: row.session_date,
    status: row.status as "ongoing" | "completed" | "cancelled",
    totalStores: storeRows.length,
    visitedStores: storeRows.filter((r) => r.visited).length,
  };
}

export async function getSessions(): Promise<SessionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("route_sessions")
    .select("id, route_name, session_date, status, session_stores(visited)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapSessionRow);
}

// `session_stores.store_id -> stores.id` is many-to-one: Postgrest returns
// `stores` as a single object at runtime, even though supabase-js's
// query-string type inference (no generated Database types here) guesses
// an array for every embedded relation. Cast to the true runtime shape.
type SessionStoreQueryRow = {
  id: string;
  store_id: string;
  visited: boolean;
  stores: {
    store_name: string;
    province: string | null;
    city: string | null;
    barangay: string | null;
  } | null;
};

function mapSessionStoreRow(row: SessionStoreQueryRow): SessionStoreRow {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores?.store_name ?? "Unknown",
    province: row.stores?.province ?? null,
    city: row.stores?.city ?? null,
    barangay: row.stores?.barangay ?? null,
    visited: Boolean(row.visited),
  };
}

export async function getSessionStores(
  sessionId: string,
): Promise<SessionStoreRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_stores")
    .select(
      "id, store_id, visited, stores(store_name, province, city, barangay)",
    )
    .eq("route_session_id", sessionId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as SessionStoreQueryRow[];
  return rows.map(mapSessionStoreRow);
}

// `snapshot_product_name` is captured on the sale itself at the time it was logged —
// use it instead of joining `products`, since `product_id` can point at a
// since-deleted product (that's the whole point of the snapshot).
type SessionStoreSaleQueryRow = {
  id: string;
  snapshot_product_name: string;
  snapshot_price: number;
  quantity_sold: number;
  quantity_bo: number;
  bo_reason: string | null;
  total: number;
};

function mapSaleRow(row: SessionStoreSaleQueryRow): SessionStoreSaleRow {
  return {
    id: row.id,
    productName: row.snapshot_product_name,
    snapshotPrice: row.snapshot_price,
    quantitySold: row.quantity_sold,
    quantityBO: row.quantity_bo,
    boReason: row.bo_reason,
    total: row.total,
  };
}

export async function getStoreSales(
  sessionStoreId: string,
): Promise<SessionStoreSaleRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_store_sales", {
    p_session_store_id: sessionStoreId,
  });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as SessionStoreSaleQueryRow[];
  return rows.map(mapSaleRow);
}

type SessionInventorySummaryQueryRow = {
  product_id: string;
  product_name: string;
  morning: number;
  sold: number;
  back_order: number;
  expected: number;
  ending: number;
  variance: number;
};

function mapInventorySummaryRow(
  row: SessionInventorySummaryQueryRow,
): InventorySummaryRow {
  return {
    productId: row.product_id,
    productName: row.product_name,
    morning: row.morning,
    sold: row.sold,
    backOrder: row.back_order,
    expected: row.expected,
    ending: row.ending,
    variance: row.variance,
  };
}

export async function getSessionInventory(
  sessionId: string,
): Promise<InventorySummaryRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_session_inventory_summary", {
    p_session_id: sessionId,
  });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as SessionInventorySummaryQueryRow[];
  return rows.map(mapInventorySummaryRow);
}
