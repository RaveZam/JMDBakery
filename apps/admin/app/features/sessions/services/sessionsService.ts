"use server";

import { createClient } from "@/utils/supabase/server";
import { mergeInventorySummary } from "../helpers/sessionHelpers";
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
    status: row.status as "ongoing" | "completed",
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

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, total",
    )
    .eq("session_store_id", sessionStoreId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as SessionStoreSaleQueryRow[];
  return rows.map(mapSaleRow);
}

type InventorySnapshotQueryRow = {
  product_id: string;
  snapshot_product_name: string;
  quantity: number;
};

// `sales.session_store_id -> session_stores.id` is many-to-one: Postgrest
// returns `session_stores` as a single object at runtime, even though
// supabase-js's query-string type inference (no generated Database types
// here) guesses an array for every embedded relation. Cast to the true
// runtime shape (same gotcha as `SessionStoreQueryRow` above).
type SessionSaleAggQueryRow = {
  product_id: string;
  snapshot_product_name: string;
  quantity_sold: number;
  quantity_bo: number;
  session_stores: { route_session_id: string } | null;
};

function mapInventorySnapshotRow(row: InventorySnapshotQueryRow): {
  productId: string;
  productName: string;
  quantity: number;
} {
  return {
    productId: row.product_id,
    productName: row.snapshot_product_name,
    quantity: row.quantity,
  };
}

function mapSessionSaleAggRow(row: SessionSaleAggQueryRow): {
  productId: string;
  productName: string;
  quantitySold: number;
  quantityBO: number;
} {
  return {
    productId: row.product_id,
    productName: row.snapshot_product_name,
    quantitySold: row.quantity_sold,
    quantityBO: row.quantity_bo,
  };
}

export async function getSessionInventory(
  sessionId: string,
): Promise<InventorySummaryRow[]> {
  const supabase = await createClient();

  const [morningRes, endingRes, salesRes] = await Promise.all([
    supabase
      .from("session_inventory")
      .select("product_id, snapshot_product_name, quantity")
      .eq("route_session_id", sessionId),
    supabase
      .from("ending_inventory")
      .select("product_id, snapshot_product_name, quantity")
      .eq("route_session_id", sessionId),
    supabase
      .from("sales")
      .select(
        "product_id, snapshot_product_name, quantity_sold, quantity_bo, session_stores!inner(route_session_id)",
      )
      .eq("session_stores.route_session_id", sessionId),
  ]);

  if (morningRes.error) throw new Error(morningRes.error.message);
  if (endingRes.error) throw new Error(endingRes.error.message);
  if (salesRes.error) throw new Error(salesRes.error.message);

  const morningRows = (morningRes.data ??
    []) as unknown as InventorySnapshotQueryRow[];
  const endingRows = (endingRes.data ??
    []) as unknown as InventorySnapshotQueryRow[];
  const salesRows = (salesRes.data ??
    []) as unknown as SessionSaleAggQueryRow[];

  return mergeInventorySummary(
    morningRows.map(mapInventorySnapshotRow),
    endingRows.map(mapInventorySnapshotRow),
    salesRows.map(mapSessionSaleAggRow),
  );
}
