"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type {
  SessionRow,
  SessionStoreSaleRow,
  SessionStoreRow,
} from "../types/session-types";

async function resolveAgentNames(
  uuids: string[],
): Promise<Record<string, string>> {
  if (uuids.length === 0) return {};
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return {};
    const map: Record<string, string> = {};
    for (const user of data.users) {
      map[user.id] =
        (user.user_metadata?.name as string) || user.email || user.id;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getSessions(): Promise<SessionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("route_sessions")
    .select(
      "id, route_name, session_date, conducted_by, status, created_at, session_stores(visited)",
    )
    .order("created_at", { ascending: false }).limit(100);

  if (error) throw new Error(error.message);

  const sessions = data ?? [];
  const uuids = [...new Set(sessions.map((s) => s.conducted_by))];
  const agentNames = await resolveAgentNames(uuids);

  return sessions.map((s: any) => {
    const storeRows: { visited: boolean }[] = s.session_stores ?? [];
    return {
      id: s.id,
      routeName: s.route_name,
      sessionDate: s.session_date,
      conductedBy: s.conducted_by,
      conductedByName: agentNames[s.conducted_by] ?? s.conducted_by,
      status: s.status as "ongoing" | "completed",
      createdAt: s.created_at,
      totalStores: storeRows.length,
      visitedStores: storeRows.filter((r) => r.visited).length,
    };
  });
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

  return (data ?? []).map((ss: any) => ({
    id: ss.id,
    storeId: ss.store_id,
    storeName: ss.stores?.store_name ?? "Unknown",
    province: ss.stores?.province ?? null,
    city: ss.stores?.city ?? null,
    barangay: ss.stores?.barangay ?? null,
    visited: Boolean(ss.visited),
  }));
}

export async function getStoreSales(
  sessionStoreId: string,
): Promise<SessionStoreSaleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, snapshot_price, quantity_sold, quantity_bo, bo_reason, total, products(product_name)",
    )
    .eq("session_store_id", sessionStoreId);

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    productName: s.products?.product_name ?? "Unknown",
    snapshotPrice: s.snapshot_price,
    quantitySold: s.quantity_sold,
    quantityBO: s.quantity_bo,
    boReason: s.bo_reason,
    total: s.total,
  }));
}
