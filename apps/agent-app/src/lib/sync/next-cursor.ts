import { latestUpdatedAt } from "./latest-updated-at";

/** How far behind the newest row we park the cursor. */
const SAFETY_LAG_MS = 5_000;

/**
 * The cursor to store after a page has been applied locally.
 *
 * Sits SAFETY_LAG_MS behind the newest row in the page on purpose. `updated_at`
 * is stamped when a row is written, but the row only becomes visible to other
 * connections when its transaction commits — those are different moments. A row
 * stamped 10:00:00 whose transaction commits at 10:00:03 is invisible to a pull
 * running at 10:00:01, and if the cursor had advanced to 10:00:02 that row would
 * sit behind the window forever. Parking short of the newest timestamp keeps it
 * inside the next window instead.
 *
 * Re-reading the overlap is free: every write in the pull path is an upsert or a
 * delete by id, so applying the same row twice changes nothing.
 *
 * Derived only from server timestamps, never the device clock, so a phone with a
 * skewed clock can't push the cursor past rows it never received.
 *
 * @param rows - The page that was just applied.
 * @returns The cursor to persist, or null if the page was empty.
 */
export function nextCursor(rows: { updated_at: string }[]): string | null {
  const newest = latestUpdatedAt(rows);
  if (newest === null) return null;

  const lagged = new Date(newest).getTime() - SAFETY_LAG_MS;
  return new Date(lagged).toISOString();
}
