import { supabase } from "@/src/lib/supabase";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { nextPageCursor } from "./next-page-cursor";
import { nextCursor } from "./next-cursor";

/** PostgREST caps a response at 1000 rows, so a page is never bigger than this. */
const PAGE_SIZE = 1000;

/**
 * Fetches one page of rows at or after `cursor`, oldest first.
 *
 * The ordering is the whole point. PostgREST returns at most PAGE_SIZE rows, and
 * without an ORDER BY those rows are an arbitrary subset — advancing a cursor
 * past an arbitrary subset skips every row that didn't make the cut, silently
 * and permanently. Ordering by `updated_at` ascending makes a page a contiguous
 * prefix instead, so the cursor can only move over rows that were handed back.
 *
 * @returns The page, or null if the fetch failed.
 */
async function fetchPage<Row extends { updated_at: string }>(
  tableName: string,
  columns: string,
  cursor: string | null,
): Promise<Row[] | null> {
  let query = supabase
    .from(tableName)
    .select(columns)
    .order("updated_at", { ascending: true })
    .limit(PAGE_SIZE);

  // `gte`, not `gt`: a row written in the same instant as the cursor must not
  // fall through the gap, and re-applying the boundary row is harmless.
  if (cursor) query = query.gte("updated_at", cursor);

  const { data, error } = await query.returns<Row[]>();

  if (error || !data) {
    console.warn(`[download] failed to fetch ${tableName}:`, error?.message);
    return null;
  }

  return data;
}

type IncrementalPull<Row> = {
  /** Supabase table, also the `sync_state` key. */
  tableName: string;
  /** Select list; must include `updated_at`. */
  columns: string;
  /** Writes one page to SQLite. Must be idempotent. */
  applyPage: (rows: Row[]) => void;
};

/**
 * Runs one incremental pull of a server-owned table: reads the cursor from
 * `sync_state`, walks every row newer than it a page at a time, hands each page
 * to the caller to write locally, and advances the cursor as it goes.
 *
 * `applyPage` runs before the cursor advances, so a crash mid-pull re-reads the
 * page rather than losing it. It must be idempotent — upserts and deletes by id.
 *
 * A failed fetch stops the walk with the cursor untouched, so the same window is
 * retried on the next run.
 */
export async function pullIncremental<Row extends { updated_at: string }>(
  params: IncrementalPull<Row>,
): Promise<void> {
  // Drives the page walk. Starts at the stored cursor, then tracks the exact
  // newest row of each page — the stored cursor sits deliberately behind that,
  // and walking from the stored value would re-read the same page forever.
  let cursor = SyncStateDao.getLastSyncedAt(params.tableName);

  for (;;) {
    const page = await fetchPage<Row>(params.tableName, params.columns, cursor);

    if (page === null || page.length === 0) return;

    params.applyPage(page);

    const persisted = nextCursor(page);
    if (persisted) SyncStateDao.setLastSyncedAt(params.tableName, persisted);

    const next = nextPageCursor(page, cursor, PAGE_SIZE);

    if (next === null) {
      // A full page that stops the walk is the pathological case, not the end
      // of the changes — worth a line in the log.
      if (page.length === PAGE_SIZE)
        console.warn(
          `[download] ${params.tableName}: full page at a single updated_at, stopping`,
        );
      return;
    }

    cursor = next;
  }
}
