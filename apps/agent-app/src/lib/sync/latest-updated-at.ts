/**
 *  Just return the updated_at to insert in synced_state table
 *
 * @param rows - Rows pulled from Supabase, in any order.
 * @returns The new updated_at which we will use to insert in synced_state table
 */
export function latestUpdatedAt(rows: { updated_at: string }[]): string | null {
  let latest: string | null = null;
  for (const row of rows) {
    if (latest === null || row.updated_at > latest) latest = row.updated_at;
  }
  return latest;
}
