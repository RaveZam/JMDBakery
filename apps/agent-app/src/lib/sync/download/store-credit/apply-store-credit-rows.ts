import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import {
  toLocalCreditEntry,
  type RemoteStoreCreditRow,
} from "../core/to-local-credit-entry";

/** The column list every store_credit_entries pull shares. */
export const STORE_CREDIT_SELECT =
  "id, store_id, session_store_id, entry_type, amount, note, recorded_by, recorded_by_name, created_at, deleted_at, updated_at";

/**
 * Writes a pulled batch of credit entries to the local DB. Rows stamped with
 * `deleted_at` on the server are removed here — locally there is no deleted
 * column, the row is simply gone.
 */
export function applyStoreCreditRows(rows: RemoteStoreCreditRow[]): void {
  for (const row of rows) {
    if (row.deleted_at) {
      StoreCreditDao.deleteEntry(row.id);
      continue;
    }
    StoreCreditDao.upsertEntry(toLocalCreditEntry(row));
  }
}
