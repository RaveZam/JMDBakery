"use server";
import { createClient } from "@/utils/supabase/server";
import { computeInventoryVariance } from "@/lib/computeInventoryVariance";

export type VarianceRecord = {
  sessionId: string;
  date: string;
  productId: string;
  morning: number;
  sold: number;
  boQty: number;
  ending: number;
  expected: number;
  variance: number;
};

type RawSessionInventory = { product_id: string; quantity: number | null };
type RawEndingInventory = { product_id: string; quantity: number | null };
type RawSale = {
  product_id: string | null;
  quantity_sold: number | null;
  quantity_bo: number | null;
};
type RawSessionStore = { sales: RawSale[] };
type RawSession = {
  id: string;
  session_date: string;
  session_inventory: RawSessionInventory[];
  ending_inventory: RawEndingInventory[];
  session_stores: RawSessionStore[];
};

const DATASET_WINDOW_MONTHS = 1;

/**
 * Computes the earliest `session_date` to include in the variance dataset.
 *
 * @returns Date string in `YYYY-MM-DD` format, exactly `DATASET_WINDOW_MONTHS`
 *          months before today.
 */
function windowStartDate(): string {
  const d = new Date();
  //rolls the date back by the window size, e.g. today minus 1 month
  d.setMonth(d.getMonth() - DATASET_WINDOW_MONTHS);

  //toISOString gives "2026-06-22T00:00:00.000Z", slice(0,10) trims it to "2026-06-22"
  return d.toISOString().slice(0, 10);
}

type ProductTotals = {
  morning: number;
  sold: number;
  boQty: number;
  ending: number;
  hasEnding: boolean;
};

/**
 * Gets the running totals bucket for a product within a totals map, creating
 * it (zeroed out) on first access.
 *
 * @param totals - Map being accumulated into, keyed by `productId`. Mutated in place:
 *                 a missing entry is inserted before being returned.
 * @param productId - Product to look up or initialize.
 * @returns The `ProductTotals` object stored in `totals` for `productId` — safe to
 *          mutate directly, since it's the same reference held in the map.
 */
function getEntry(
  totals: Map<string, ProductTotals>,
  productId: string,
): ProductTotals {
  let entry = totals.get(productId);
  if (!entry) {
    //first time we've seen this product in this session, start it at zero
    entry = { morning: 0, sold: 0, boQty: 0, ending: 0, hasEnding: false };
    totals.set(productId, entry);
  }
  return entry;
}

/**
 * Aggregates one route session's inventory and sales rows into per-product totals.
 *
 * ending_inventory/session_inventory are keyed per (route_session_id,
 * product_id) -- one end-of-route total, not per store. Mirrors the same
 * morning/sold/back_order/ending totals as the get_session_inventory_summary
 * RPC, just aggregated in JS across the whole dashboard date window instead
 * of one session at a time.
 *
 * @param session - A single route session with its nested session_inventory,
 *                  ending_inventory, and session_stores(sales) rows as returned
 *                  by the Supabase query.
 * @returns Map keyed by `productId` to `{ morning, sold, boQty, ending, hasEnding }`
 *          totals, summed across all of the session's stores. Products with null
 *          quantities are treated as 0. `hasEnding` is true only if an actual
 *          ending_inventory row was seen for that product (distinct from ending
 *          staying 0 because none was ever recorded). A product absent from all
 *          three row types never appears in the map.
 */
function sumSessionTotals(session: RawSession): Map<string, ProductTotals> {
  const totals = new Map<string, ProductTotals>();

  //morning stock counted at the start of the route, one row per product
  for (const row of session.session_inventory) {
    getEntry(totals, row.product_id).morning += row.quantity ?? 0;
  }
  //leftover stock counted at the end of the route, one row per product
  for (const row of session.ending_inventory) {
    const entry = getEntry(totals, row.product_id);
    entry.ending += row.quantity ?? 0;
    entry.hasEnding = true;
  }
  //sales are per store, so we loop stores then each store's sale rows to roll them up session-wide
  for (const store of session.session_stores) {
    for (const sale of store.sales) {
      if (!sale.product_id) continue;
      const entry = getEntry(totals, sale.product_id);
      entry.sold += sale.quantity_sold ?? 0;
      entry.boQty += sale.quantity_bo ?? 0;
      //This will return product  { morning, sold, boqty, ending}
    }
  }

  return totals;
}

/**
 * Converts one route session into its per-product variance rows.
 *
 * Expected remaining stock is `morning - sold` (see `computeInventoryVariance`
 * — BO is not subtracted, a bad-order unit is still on the truck, not sold);
 * variance is how far the physically counted `ending` stock differs from that
 * expectation (positive means more was counted than expected, negative means
 * less).
 *
 * @param session - A single route session with its nested inventory/sales rows.
 * @returns One `VarianceRecord` per product that has an actual ending_inventory
 *          row for this session (order follows Map iteration/insertion order,
 *          not any particular sort). Products with morning stock or sales but
 *          no ending count are skipped — a missing ending count means the
 *          product was never physically counted back in, not that 0 remained,
 *          so no variance can be computed for it.
 */
function mapSession(session: RawSession): VarianceRecord[] {
  const totals = sumSessionTotals(session);

  return Array.from(totals.entries())
    .filter(([, t]) => t.hasEnding)
    .map(([productId, t]) => {
      const { expected, variance } = computeInventoryVariance(t.morning, t.sold, t.ending);
      return {
        sessionId: session.id,
        date: session.session_date,
        productId,
        morning: t.morning,
        sold: t.sold,
        boQty: t.boQty,
        ending: t.ending,
        expected,
        variance,
      };
    });
}

/**
 * Fetches and computes the dashboard's variance KPI dataset: one row per
 * (session, product) pair showing how counted ending stock compares to
 * expected stock, for every route session in a fixed trailing window.
 *
 * Single source of truth for the dashboard's variance KPI. Replaces the
 * previous approach of computing variance inline in the UI on a session
 * record's inventory section. Meant to be cached client-side via React Query;
 * the dashboard applies its own date-range filter against the returned rows
 * in memory, same pattern as `getSalesDataset`.
 *
 * @returns Flat array of `VarianceRecord`, one per product per session, covering
 *          all route sessions with `session_date >= windowStartDate()`
 *          (last `DATASET_WINDOW_MONTHS` month(s)), newest session first.
 * @throws Error with the Supabase error message if the query fails.
 */
export const getVarianceDataset = async (): Promise<VarianceRecord[]> => {
  const supabase = await createClient();

  //pulls each session in the window along with its nested inventory + sales rows in one query.
  //data comes back as:
  //{
  //  id: string;
  //  session_date: string;
  //  session_inventory: { product_id: string; quantity: number | null }[];
  //  ending_inventory: { product_id: string; quantity: number | null }[];
  //  session_stores: {
  //    sales: {
  //      product_id: string | null;
  //      quantity_sold: number | null;
  //      quantity_bo: number | null;
  //    }[];
  //  }[];
  //}[]
  const { data, error } = await supabase
    .from("route_sessions")
    .select(
      `
      id, session_date,
      session_inventory(product_id, quantity),
      ending_inventory(product_id, quantity),
      session_stores!inner(sales(product_id, quantity_sold, quantity_bo))
    `,
    )
    .gte("session_date", windowStartDate())
    .is("deleted_at", null)
    .order("session_date", { ascending: false });

  if (error) throw new Error(error.message);

  //Supabase's inferred type for nested selects doesn't match our narrower RawSession shape, so we assert it
  const rows = (data ?? []) as unknown as RawSession[];

  //turns each session into its per-product variance rows, then flattens all sessions into one list
  return rows.flatMap(mapSession);
};
