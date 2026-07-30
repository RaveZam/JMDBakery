import { supabase } from "@/src/lib/supabase";
import { isWifiConnected } from "@/src/lib/network";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import { ProvincePriceModifiersDao } from "@/src/lib/dao/province-price-modifiers-dao";
import RoutesDao from "@/src/lib/dao/routes-dao";
import ProvincesDao from "@/src/lib/dao/province-dao";
import StoresDao from "@/src/lib/dao/store-dao";
import ProvinceStoresDao from "@/src/lib/dao/province-stores-dao";
import RouteSessionsDao from "../dao/route-sessions-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { collapseOngoingSessions } from "./collapse-ongoing-sessions";
import { latestUpdatedAt } from "./latest-updated-at";

export type DownloadResult = {
  routes: number;
  provinces: number;
  stores: number;
  sessions: number;
};

/**
 * Pulls server-owned reference data into the local DB. Runs on sign-in and
 * whenever the app returns to the foreground.
 *
 * `products` and `province_price_modifiers` are incremental: each table's
 * cursor lives in `sync_state`, so a run that finds nothing new costs one
 * empty query per table. `routes`/`provinces`/`stores`/`province_stores`/
 * `sessions` are a full pull each time (not yet incremental), run in
 * FK-safe order: routes → provinces → stores+links → sessions. `stores` is
 * scoped to only what's linked via this agent's own province_stores rows,
 * not every store in the system.
 */
export async function runDownloadSync(_userId?: string): Promise<void> {
  if (!(await isWifiConnected())) return;

  await downloadProducts();
  await downloadProvincePriceModifiers();
  await downloadRoutes();
  await downloadProvinces();
  await downloadAgentStoresAndLinks();
  await downloadSessions();
}

/**
 * Manual pull of agent-owned reference data (routes, provinces, stores).
 * Runs in FK-safe order: routes → provinces → stores → links.
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
  const stores = await downloadAgentStoresAndLinks();
  const sessions = await downloadSessions();

  return {
    routes,
    provinces: provinces ?? 0,
    stores: stores ?? 0,
    sessions: sessions ?? 0,
  };
}

// Grabs the products from supabase, and checks for new data. compared from sync_state date.
// if a date is greater than the synced_state queries for the updated data and upserts it.

async function downloadProducts(): Promise<void> {
  const lastSynced = SyncStateDao.getLastSyncedAt("products");
  let query = supabase
    .from("products")
    .select("id, product_name, product_price, deleted_at, updated_at");

  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;

  if (error || !data) {
    console.warn("[download] failed to fetch products:", error?.message);
    return;
  }

  for (const product of data) {
    if (product.deleted_at) {
      ProductsDao.deleteProduct(product.id);
      continue;
    }
    ProductsDao.upsertProduct(
      product.id,
      product.product_name,
      product.product_price,
    );
  }

  const newLastUpdatedAt = latestUpdatedAt(data);
  if (newLastUpdatedAt)
    SyncStateDao.setLastSyncedAt("products", newLastUpdatedAt);
}

async function downloadProvincePriceModifiers(): Promise<void> {
  const lastSynced = SyncStateDao.getLastSyncedAt("province_price_modifiers");
  let query = supabase
    .from("province_price_modifiers")
    .select(
      "id, product_id, province_keyword, price_modifier, deleted_at, updated_at",
    );
  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;
  if (error || !data) {
    console.warn(
      "[download] failed to fetch province price modifiers:",
      error?.message,
    );
    return;
  }

  for (const modifier of data) {
    if (modifier.deleted_at) {
      ProvincePriceModifiersDao.deleteProvincePriceModifier(modifier.id);
      continue;
    }
    ProvincePriceModifiersDao.upsertProvincePriceModifier(
      modifier.id,
      modifier.product_id,
      modifier.province_keyword,
      modifier.price_modifier,
    );
  }

  const newCursor = latestUpdatedAt(data);
  if (newCursor)
    SyncStateDao.setLastSyncedAt("province_price_modifiers", newCursor);
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

//Downloads store via checking from agent's route's province_stores, and only downloading the id's found in the link
async function downloadStores(storeIds: string[]): Promise<number | null> {
  if (storeIds.length === 0) return 0;

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, store_name, province_id, province, city, barangay, contact_number, contact_name, created_by, created_by_name",
    )
    .in("id", storeIds);
  if (error || !data) {
    console.warn("[download] failed to fetch stores:", error?.message);
    return null;
  }
  for (const row of data) {
    StoresDao.upsertStore(toLocalStore(row));
  }
  return data.length;
}

type RemoteStoreRow = {
  id: string;
  store_name: string;
  province_id: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  contact_number: string | null;
  contact_name: string | null;
  created_by: string | null;
  created_by_name: string | null;
};

function toLocalStore(row: RemoteStoreRow) {
  return {
    id: row.id,
    provinceId: row.province_id,
    name: row.store_name,
    province: row.province ?? "",
    city: row.city ?? "",
    barangay: row.barangay ?? "",
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_number ?? "",
    createdBy: row.created_by,
    createdByName: row.created_by_name,
  };
}

//download agent's provinces (RLS Scoped by what is in province_id that they own in their routes)
//and grabs the list of storeIds that exists in the store links from province_stores
async function downloadAgentStoresAndLinks(): Promise<number | null> {
  const { data: links, error } = await supabase
    .from("province_stores")
    .select("id, province_id, store_id, created_at");
  if (error || !links) {
    console.warn("[download] failed to fetch store links:", error?.message);
    return null;
  }

  const storeIds = [...new Set(links.map((link) => link.store_id))];
  const stores = await downloadStores(storeIds);
  if (stores === null) return null;

  for (const link of links) {
    try {
      // The server's created_at, not this device's clock — the link already
      // happened somewhere else and this is only a copy of it.
      ProvinceStoresDao.upsertLink(
        link.id,
        link.province_id,
        link.store_id,
        link.created_at,
      );
    } catch (linkError) {
      // A store row missing locally (e.g. a partial prior sync) FK-fails this
      // one link; skip it instead of losing the rest of the batch.
      console.warn(
        `[download] failed to link store ${link.store_id} to province ${link.province_id}:`,
        linkError,
      );
    }
  }
  return stores;
}

async function downloadSessions(): Promise<number | null> {
  const { data, error } = await supabase
    .from("route_sessions")
    .select("*")
    .is("deleted_at", null);
  if (error || !data) {
    console.warn("[download] failed to fetch sessions:", error?.message);
    return null;
  }
  for (const row of collapseOngoingSessions(data)) {
    RouteSessionsDao.upsertSession({
      routeName: row.route_name,
      sessionDate: row.session_date,
      conductedBy: row.conducted_by,
      conductedByName: row.conducted_by_name,
      status: row.status,
      createdAt: row.created_at,
      id: row.id,
    });
  }
  return data.length;
}
