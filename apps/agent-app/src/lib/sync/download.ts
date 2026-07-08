import { supabase } from "@/src/lib/supabase";
import { isWifiConnected } from "@/src/lib/network";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import RoutesDao from "@/src/lib/dao/routes-dao";
import ProvincesDao from "@/src/lib/dao/province-dao";
import StoresDao from "@/src/lib/dao/store-dao";
import RouteSessionsDao from "../dao/route-sessions-dao";
import { collapseOngoingSessions } from "./collapse-ongoing-sessions";

export type DownloadResult = {
  routes: number;
  provinces: number;
  stores: number;
  sessions: number;
};

/**
 * Pulls server-owned reference data into the local DB. Runs once per signed-in
 * user (triggered from the auth flow).
 */
export async function runDownloadSync(_userId?: string): Promise<void> {
  if (!(await isWifiConnected())) return;

  await downloadProducts();
}

/**
 * Manual pull of agent-owned reference data (routes, provinces, stores).
 * Runs in FK-safe order: routes → provinces → stores.
 * Aborts if routes fail — provinces and stores depend on them via FK.
 */
export async function downloadReferenceData(): Promise<DownloadResult> {
  if (!(await isWifiConnected())) {
    throw new Error(
      "No wifi connection. Connect to the internet and try again.",
    );
  }

  const routes = await downloadRoutes();
  if (routes === null)
    throw new Error(
      "Failed to download routes. Check your connection and try again.",
    );
  const provinces = await downloadProvinces();
  const stores = await downloadStores();
  const sessions = await downloadSessions();

  return {
    routes,
    provinces: provinces ?? 0,
    stores: stores ?? 0,
    sessions: sessions ?? 0,
  };
}

async function downloadProducts(): Promise<void> {
  const { data, error } = await supabase.from("products").select("*");
  if (error || !data) {
    console.warn("[download] failed to fetch products:", error?.message);
    return;
  }

  for (const product of data) {
    ProductsDao.upsertProduct(
      product.id,
      product.product_name,
      product.product_price,
    );
  }
}

async function downloadRoutes(): Promise<number | null> {
  const { data, error } = await supabase
    .from("agent_routes")
    .select("id, name");
  if (error || !data) {
    console.warn("[download] failed to fetch routes:", error?.message);
    return null;
  }
  for (const row of data) {
    RoutesDao.upsertRoute(row.id, row.name);
  }
  return data.length;
}

async function downloadProvinces(): Promise<number | null> {
  const { data, error } = await supabase
    .from("agent_provinces")
    .select("id, name, route_id");
  if (error || !data) {
    console.warn("[download] failed to fetch provinces:", error?.message);
    return null;
  }
  for (const row of data) {
    ProvincesDao.upsertProvince(row.id, row.route_id, row.name);
  }
  return data.length;
}

async function downloadStores(): Promise<number | null> {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, store_name, province_id, province, city, barangay, contact_number, contact_name",
    );
  if (error || !data) {
    console.warn("[download] failed to fetch stores:", error?.message);
    return null;
  }
  for (const row of data) {
    StoresDao.upsertStore({
      id: row.id,
      provinceId: row.province_id,
      name: row.store_name,
      province: row.province ?? "",
      city: row.city ?? "",
      barangay: row.barangay ?? "",
      contactName: row.contact_name ?? "",
      contactPhone: row.contact_number ?? "",
    });
  }
  return data.length;
}

async function downloadSessions(): Promise<number | null> {
  const { data, error } = await supabase.from("route_sessions").select("*");
  if (error || !data) {
    console.warn("[download] failed to fetch sessions:", error?.message);
    return null;
  }
  for (const row of collapseOngoingSessions(data)) {
    RouteSessionsDao.upsertSession(
      row.route_name,
      row.session_date,
      row.conducted_by,
      row.status,
      row.id,
    );
  }
  return data.length;
}
