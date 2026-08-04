import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getCurrentUserId, getCurrentUserName } from "@/src/lib/current-user";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import type { LoggedItem } from "@/src/lib/dao/sales-dao";
import {
  buildVisitCreditEntry,
  type VisitCreditEntry,
} from "../core/build-visit-credit-entry";
import {
  buildStorePaymentEntry,
  type StorePaymentEntry,
} from "../core/build-store-payment-entry";
import { computeCreditBalance } from "../core/compute-credit-balance";
import type { CreditEntry } from "../types/store-types";
import { getSalesBySessionStore } from "./sales-services";

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

//This is where we get the sessionstore-id and grab the sales from credit_entry_sales table that we downloaded from download,ts upon app load
export function getCreditEntryItems(sessionStoreId: string): LoggedItem[] {
  const ownSales = getSalesBySessionStore(sessionStoreId);
  if (ownSales.length > 0) return ownSales;
  return CreditEntrySalesDao.getBySessionStoreId(sessionStoreId);
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

type WritableEntry = VisitCreditEntry | StorePaymentEntry;

// Only the pushed payload carries the collector: nothing on the device reads
// it back, so the local table has no columns for it.
function tenderedFields(entry: WritableEntry): {
  tendered_by?: string;
  tendered_by_name?: string | null;
} {
  if (entry.entryType !== "payment" || !entry.tenderedBy) return {};
  return {
    tendered_by: entry.tenderedBy,
    tendered_by_name: entry.tenderedByName,
  };
}

function writeCreditEntry(entry: WritableEntry): void {
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
      ...tenderedFields(entry),
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

/**
 * Records a store paying down its balance, as one 'payment' row in the same
 * ledger the credits live in. Nothing is updated: the balance is the running
 * sum of the entries, so a payment only ever adds to the history.
 *
 * Everything but the amount is resolved here from local SQLite, so this works
 * with no signal. recorded_by is the agent signed in on this device — whoever
 * typed it — while tendered_by is the agent whose session the store is being
 * visited under, the person who actually took the cash. They are usually the
 * same, and buildStorePaymentEntry drops tendered_by when they are.
 *
 * A no-op when the visit is unknown, nobody is signed in, or the payment would
 * be rejected by the server (see buildStorePaymentEntry).
 */
export function recordStorePayment(input: {
  sessionStoreId: string;
  amount: number;
}): void {
  const sessionStore = SessionStoresDao.getById(input.sessionStoreId);
  if (!sessionStore) return;

  const session = RouteSessionsDao.getById(sessionStore.route_session_id);
  const recordedBy = getCurrentUserId();
  if (!recordedBy) return;

  const entry = buildStorePaymentEntry({
    id: generateUUID(),
    storeId: sessionStore.store_id,
    amount: input.amount,
    outstandingBalance: computeCreditBalance(
      getCreditEntriesForStore(sessionStore.store_id),
    ),
    recordedBy,
    recordedByName: getCurrentUserName() ?? "Unknown",
    tenderedBy: session?.conducted_by ?? null,
    tenderedByName: session?.conducted_by_name ?? null,
    createdAt: getPhTime().toISOString(),
  });
  if (!entry) return;

  getDb().withTransactionSync(() => {
    writeCreditEntry(entry);
  });
}
