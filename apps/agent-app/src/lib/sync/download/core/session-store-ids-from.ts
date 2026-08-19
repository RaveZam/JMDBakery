import type { RemoteStoreCreditRow } from "./to-local-credit-entry";

/**
 * The session_store ids worth pulling sales for, out of a batch of credit
 * entries. Deleted rows are skipped — their sales are about to be dropped
 * locally, so fetching them would be wasted work.
 */
export function sessionStoreIdsFrom(rows: RemoteStoreCreditRow[]): string[] {
  return rows
    .filter((row) => !row.deleted_at && row.session_store_id)
    .map((row) => row.session_store_id as string);
}
