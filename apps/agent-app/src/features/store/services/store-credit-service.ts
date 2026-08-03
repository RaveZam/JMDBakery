import { generateUUID } from "@/src/lib/uuid";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import {
  buildVisitCreditEntry,
  type VisitCreditEntry,
} from "../core/build-visit-credit-entry";
import type { CreditEntry } from "../types/store-types";

function toCreditEntry(
  row: ReturnType<typeof StoreCreditDao.getByStoreId>[number],
): CreditEntry {
  return {
    id: row.id,
    storeId: row.store_id,
    sessionStoreId: row.session_store_id,
    entryType: row.entry_type,
    amount: row.amount,
    note: row.note,
    recordedByName: row.recorded_by_name,
    createdAt: row.created_at,
  };
}

export function getCreditEntriesForStore(storeId: string): CreditEntry[] {
  return StoreCreditDao.getByStoreId(storeId).map(toCreditEntry);
}

// What confirmSessionStoreVisit passes in. Example:
// {
//   sessionStoreId: "sstore_1", storeId: "store_9",
//   paymentType: "credit", netTotal: 750,
//   recordedBy: "user_5", recordedByName: "Juan",
//   createdAt: "2026-07-28T00:00:00.000Z",
// }
type ApplyVisitCreditInput = {
  sessionStoreId: string; // which visit this is for
  storeId: string; // which store owes the money
  paymentType: "cash" | "credit"; // what the agent picked
  netTotal: number; // visit total, becomes the debt amount
  recordedBy: string; // agent's user id
  recordedByName: string; // agent's display name
  createdAt: string; // when the visit was confirmed
};

function removeExistingCreditEntry(entryId: string): void {
  StoreCreditDao.deleteEntry(entryId);
  enqueueOutbox({
    entityType: "store_credit_entry",
    entityId: entryId,
    operation: "delete",
    payload: { id: entryId },
  });
}

function writeCreditEntry(entry: VisitCreditEntry): void {
  StoreCreditDao.upsertEntry({
    id: entry.id,
    store_id: entry.storeId,
    session_store_id: entry.sessionStoreId,
    entry_type: entry.entryType,
    amount: entry.amount,
    note: null,
    recorded_by: entry.recordedBy,
    recorded_by_name: entry.recordedByName,
    created_at: entry.createdAt,
  });

  enqueueOutbox({
    entityType: "store_credit_entry",
    entityId: entry.id,
    operation: "create",
    payload: {
      id: entry.id,
      store_id: entry.storeId,
      session_store_id: entry.sessionStoreId,
      entry_type: entry.entryType,
      amount: entry.amount,
      recorded_by: entry.recordedBy,
      recorded_by_name: entry.recordedByName,
      created_at: entry.createdAt,
    },
  });
}

// Saves or removes this visit's credit entry, based on ApplyVisitCreditInput above.
export function applyVisitCredit(input: ApplyVisitCreditInput): void {
  const existing = StoreCreditDao.getBySessionStoreId(input.sessionStoreId);

  const entry = buildVisitCreditEntry({
    id: existing?.id ?? generateUUID(),
    sessionStoreId: input.sessionStoreId,
    storeId: input.storeId,
    paymentType: input.paymentType,
    netTotal: input.netTotal,
    recordedBy: input.recordedBy,
    recordedByName: input.recordedByName,
    createdAt: input.createdAt,
  });

  if (!entry) {
    // cash, or nothing owed — drop any old credit entry for this visit
    if (existing) removeExistingCreditEntry(existing.id);
    return;
  }

  writeCreditEntry(entry);
}
