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
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
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
  await downloadStoreCreditEntries();
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

export async function downloadProducts(): Promise<void> {
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

const STORE_CREDIT_SELECT =
  "id, store_id, session_store_id, entry_type, amount, note, recorded_by, recorded_by_name, created_at, deleted_at, updated_at";

type RemoteStoreCreditRow = {
  id: string;
  store_id: string;
  session_store_id: string | null;
  entry_type: "credit" | "payment";
  amount: number;
  note: string | null;
  recorded_by: string;
  recorded_by_name: string | null;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
};

function applyStoreCreditRows(rows: RemoteStoreCreditRow[]): void {
  for (const row of rows) {
    if (row.deleted_at) {
      StoreCreditDao.deleteEntry(row.id);
      continue;
    }
    StoreCreditDao.upsertEntry({
      id: row.id,
      store_id: row.store_id,
      session_store_id: row.session_store_id,
      entry_type: row.entry_type,
      amount: row.amount,
      note: row.note,
      recorded_by: row.recorded_by,
      recorded_by_name: row.recorded_by_name,
      created_at: row.created_at,
    });
  }
}

/**
 * A store newly linked to this agent needs its *entire* credit history, not
 * just entries newer than the shared cursor — otherwise its balance would
 * render short of debt it already had before this agent ever saw it. Scoped
 * only to store ids that have never been pulled; unfiltered by updated_at.
 */
// Session store ids a credit entry points at, excluding deletes (nothing to
// pull sales for) and entries with no visit behind them.
function sessionStoreIdsFrom(rows: RemoteStoreCreditRow[]): string[] {
  return rows
    .filter((row) => !row.deleted_at && row.session_store_id)
    .map((row) => row.session_store_id as string);
}

async function backfillNewStoreCreditHistory(
  unsyncedStoreIds: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from("store_credit_entries")
    .select(STORE_CREDIT_SELECT)
    .in("store_id", unsyncedStoreIds);

  if (error || !data) {
    console.warn(
      "[download] failed to backfill store credit entries:",
      error?.message,
    );
    return [];
  }
  applyStoreCreditRows(data);
  StoreCreditDao.markStoresSynced(unsyncedStoreIds);
  return sessionStoreIdsFrom(data);
}

async function pullStoreCreditEntriesSince(
  storeIds: string[],
): Promise<string[]> {
  const lastSynced = SyncStateDao.getLastSyncedAt("store_credit_entries");
  let query = supabase
    .from("store_credit_entries")
    .select(STORE_CREDIT_SELECT)
    .in("store_id", storeIds);
  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;
  if (error || !data) {
    console.warn(
      "[download] failed to fetch store credit entries:",
      error?.message,
    );
    return [];
  }

  applyStoreCreditRows(data);
  const newCursor = latestUpdatedAt(data);
  if (newCursor)
    SyncStateDao.setLastSyncedAt("store_credit_entries", newCursor);
  return sessionStoreIdsFrom(data);
}

type RemoteSaleRow = {
  id: string;
  session_store_id: string;
  product_id: string;
  snapshot_product_name: string;
  snapshot_price: number;
  quantity_sold: number;
  quantity_bo: number;
  bo_reason: string | null;
  payment_type: "cash" | "credit" | null;
  created_at: string;
};

//We separate the sales table and the credit entry sales here in the local app, due to if we want to keep it at the same table, given how our current structure is
//we would need to backfill session_store -> route_session details just in order to read the sales data.

async function downloadCreditEntrySales(
  sessionStoreIds: string[],
): Promise<void> {
  if (sessionStoreIds.length === 0) return;

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, session_store_id, product_id, snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, payment_type, created_at",
    )
    .in("session_store_id", sessionStoreIds);

  if (error || !data) {
    console.warn(
      "[download] failed to fetch credit entry sales:",
      error?.message,
    );
    return;
  }

  for (const row of data as RemoteSaleRow[]) {
    CreditEntrySalesDao.insert({
      id: row.id,
      sessionStoreId: row.session_store_id,
      productId: row.product_id,
      productName: row.snapshot_product_name,
      price: row.snapshot_price,
      qty: row.quantity_sold,
      boQty: row.quantity_bo,
      boReason: row.bo_reason,
      // Null until the server migration lands; cash is what those rows meant.
      paymentType: row.payment_type ?? "cash",
      createdAt: row.created_at,
    });
  }
}

// Runs the backfill leg (stores never pulled before, unfiltered) and the
// incremental leg (every known store, filtered by the shared cursor), then
// pulls the sale lines for any session_store_id either leg surfaced that
// this device doesn't already have.
async function downloadStoreCreditEntries(): Promise<void> {
  const allStoreIds = StoresDao.getAllStoreIds();
  if (allStoreIds.length === 0) return;

  const unsyncedStoreIds = StoreCreditDao.getUnsyncedStoreIds(allStoreIds);
  const backfilledSessionStoreIds =
    unsyncedStoreIds.length > 0
      ? await backfillNewStoreCreditHistory(unsyncedStoreIds)
      : [];
  const incrementalSessionStoreIds =
    await pullStoreCreditEntriesSince(allStoreIds);

  const sessionStoreIdsToFetch = [
    ...new Set([...backfilledSessionStoreIds, ...incrementalSessionStoreIds]),
  ].filter((id) => !CreditEntrySalesDao.hasSessionStoreId(id));

  await downloadCreditEntrySales(sessionStoreIdsToFetch);
}
