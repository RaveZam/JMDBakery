import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getCurrentUserId, getCurrentUserName } from "@/src/lib/current-user";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SalesDao, { type LoggedItem } from "@/src/lib/dao/sales-dao";
import {
  buildVisitCreditEntry,
  type VisitCreditEntry,
} from "../core/build-visit-credit-entry";
import {
  buildStorePaymentEntry,
  type StorePaymentEntry,
} from "../core/build-store-payment-entry";
import { computeCreditBalance } from "../core/compute-credit-balance";
import { canModifyCreditEntry } from "../core/can-modify-credit-entry";
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
    recordedBy: row.recorded_by,
    recordedByName: row.recorded_by_name,
    createdAt: row.created_at,
  };
}

export function getCreditEntriesForStore(storeId: string): CreditEntry[] {
  return StoreCreditDao.getByStoreId(storeId).map(toCreditEntry);
}

/**
 * The order lines behind a visit's debt — only the ones taken on credit, since
 * a stop can settle some orders in cash and those aren't part of what's owed.
 *
 * Own visits read straight from sales. For a visit another agent ran, this
 * device has no sales rows, so it falls back to credit_entry_sales: the copy
 * download.ts pulled from the server on app load.
 */
export function getCreditEntryItems(sessionStoreId: string): LoggedItem[] {
  const ownSales = SalesDao.getBySessionStoreId(sessionStoreId);
  const items =
    ownSales.length > 0
      ? ownSales
      : CreditEntrySalesDao.getBySessionStoreId(sessionStoreId);
  return items.filter((item) => item.paymentType === "credit");
}

// The last word before a write leaves this device. The UI already hides edit
// and delete on a colleague's entry, but a stale screen or a downloaded row
// arriving mid-edit must not get as far as the outbox: Supabase would reject
// the push and retry it forever.
function isOwnedByCurrentUser(entryId: string): boolean {
  const entry = StoreCreditDao.getById(entryId);
  if (!entry) return false;
  // No visit is open down here, so the "derived credit reverts" half of the
  // rule doesn't apply — that's a question about what the screen should offer,
  // and a write that reached this far already answered it.
  return canModifyCreditEntry(
    {
      recordedBy: entry.recorded_by,
      entryType: entry.entry_type,
      sessionStoreId: entry.session_store_id,
    },
    getCurrentUserId(),
    null,
  );
}

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

/**
 * Brings this visit's `store_credit_entries` row in line with its orders: the
 * debt is the sum of the ones taken on credit, so the entry is written, raised,
 * lowered or dropped entirely from whatever the sales table currently says.
 *
 * Derived rather than accumulated, which makes it safe to run after any sale
 * write — adding, editing and deleting all land on the right number, and
 * running it twice changes nothing.
 *
 * A no-op for an unknown visit or a session that isn't on this device.
 *
 * Writes without opening a transaction of its own: `sales-services` calls this
 * inside the same transaction as the sale it belongs to, so the order and the
 * debt it creates commit together or not at all.
 */
export function syncVisitCredit(sessionStoreId: string): void {
  const sessionStore = SessionStoresDao.getById(sessionStoreId);
  if (!sessionStore) return;

  const session = RouteSessionsDao.getById(sessionStore.route_session_id);
  if (!session) return;

  const existing = StoreCreditDao.getBySessionStoreId(sessionStoreId);

  const entry = buildVisitCreditEntry({
    id: existing?.id ?? generateUUID(),
    sessionStoreId,
    storeId: sessionStore.store_id,
    creditTotal: SalesDao.getCreditTotal(sessionStoreId),
    recordedBy: session.conducted_by,
    recordedByName: session.conducted_by_name ?? "Unknown",
    createdAt: existing?.created_at ?? getPhTime().toISOString(),
  });

  if (!entry) {
    // all cash, or nothing owed — drop any old credit entry for this visit
    if (existing) removeExistingCreditEntry(existing.id);
    return;
  }

  writeCreditEntry(entry);
}

/**
 * Corrects the amount on a ledger entry, credit or payment, for the times the
 * ledger and what happened disagree — a line the agent never logged, or a
 * figure the store and the agent settled on by hand.
 *
 * A no-op for an amount of zero or less: the server rejects those, and a
 * rejected row would jam the outbox retrying forever. Deleting is how an entry
 * goes to nothing.
 *
 * A payment correction is permanent. A **credit** correction is not, for the
 * visit currently open: that amount is derived from the visit's credit orders,
 * so the next add/edit/delete on the order log recomputes it and replaces the
 * correction. Credits from past visits and from other agents' visits are never
 * re-derived here, so a correction to those stands.
 */
export function updateCreditEntryAmount(entryId: string, amount: number): void {
  if (amount <= 0) return;
  if (!isOwnedByCurrentUser(entryId)) return;

  getDb().withTransactionSync(() => {
    StoreCreditDao.updateAmount(entryId, amount);
    enqueueOutbox({
      entityType: "store_credit_entry",
      entityId: entryId,
      operation: "update",
      payload: { id: entryId, amount },
    });
  });
}

/**
 * Removes a ledger entry, credit or payment, locally and on the server.
 * Deleting a payment puts its amount back onto what the store owes, since the
 * balance is the running sum of the entries.
 *
 * Same caveat as updateCreditEntryAmount: a **credit** on the visit currently
 * open comes back the next time an order on it changes, because it is derived
 * from the credit orders. Deleting the orders is what removes it for good.
 */
export function deleteCreditEntry(entryId: string): void {
  if (!isOwnedByCurrentUser(entryId)) return;

  getDb().withTransactionSync(() => {
    removeExistingCreditEntry(entryId);
  });
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
