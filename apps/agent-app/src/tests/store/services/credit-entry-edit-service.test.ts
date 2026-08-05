import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
  TEST_AGENT_ID,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import {
  deleteCreditEntry,
  getCreditEntriesForStore,
  recordStorePayment,
  updateCreditEntryAmount,
} from "@/src/features/store/services/store-credit-service";
import { addSale } from "@/src/features/store/services/sales-services";
import { computeCreditBalance } from "@/src/features/store/core/compute-credit-balance";

// Correcting and removing a credit row. The rule under all of it: Supabase
// scopes the update and delete policies to recorded_by, so a write against
// another agent's entry must never reach the outbox — it would be rejected on
// push and retried forever.

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

const COLLEAGUE_ID = "agent-2";

/** A visit with one ₱750 credit order, run by `conductedBy`. */
function seedCreditVisit(conductedBy: string = TEST_AGENT_ID) {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = seedRouteSession("North Route", conductedBy);
  const sessionStoreId = seedSessionStore(sessionId, storeId, provinceId);

  addSale({
    sessionStoreId,
    productId: "prod-1",
    productName: "Pandesal",
    price: 750,
    qty: 1,
    boQty: 0,
    boReason: "",
    paymentType: "credit",
  });

  const entry = getCreditEntriesForStore(storeId)[0];
  return { storeId, sessionStoreId, entryId: entry.id };
}

/** The same visit, plus a ₱200 payment against it. */
function seedCreditVisitWithPayment() {
  const visit = seedCreditVisit();
  recordStorePayment({ sessionStoreId: visit.sessionStoreId, amount: 200 });

  const payment = getCreditEntriesForStore(visit.storeId).find(
    (entry) => entry.entryType === "payment",
  );
  return { ...visit, paymentId: payment!.id };
}

function balanceOf(storeId: string): number {
  return computeCreditBalance(getCreditEntriesForStore(storeId));
}

function outboxRowsFor(entityId: string) {
  return getDb()
    .getAllSync<{ operation: string; payload: string }>(
      `SELECT operation, payload FROM outbox WHERE entity_id = ? ORDER BY id`,
      [entityId],
    )
    .map((row) => ({ operation: row.operation, ...JSON.parse(row.payload) }));
}

function amountOf(storeId: string): number | undefined {
  return getCreditEntriesForStore(storeId)[0]?.amount;
}

test("editing a credit corrects what the store owes", () => {
  const { storeId, entryId } = seedCreditVisit();

  updateCreditEntryAmount(entryId, 600);

  expect(amountOf(storeId)).toBe(600);
});

test("an edit is queued for push as an update", () => {
  const { entryId } = seedCreditVisit();

  updateCreditEntryAmount(entryId, 600);

  expect(outboxRowsFor(entryId)).toContainEqual(
    expect.objectContaining({
      operation: "update",
      id: entryId,
      amount: 600,
    }),
  );
});

test("an edit to zero or less is refused, since the server rejects it", () => {
  const { storeId, entryId } = seedCreditVisit();

  updateCreditEntryAmount(entryId, 0);
  updateCreditEntryAmount(entryId, -50);

  expect(amountOf(storeId)).toBe(750);
});

test("deleting a credit takes it off the ledger", () => {
  const { storeId, entryId } = seedCreditVisit();

  deleteCreditEntry(entryId);

  expect(getCreditEntriesForStore(storeId)).toEqual([]);
});

test("a delete is queued for push", () => {
  const { entryId } = seedCreditVisit();

  deleteCreditEntry(entryId);

  expect(outboxRowsFor(entryId)).toContainEqual(
    expect.objectContaining({ operation: "delete", id: entryId }),
  );
});

test("a colleague's credit cannot be edited", () => {
  const { storeId, entryId } = seedCreditVisit(COLLEAGUE_ID);

  updateCreditEntryAmount(entryId, 600);

  expect(amountOf(storeId)).toBe(750);
});

test("a colleague's credit cannot be deleted", () => {
  const { storeId, entryId } = seedCreditVisit(COLLEAGUE_ID);

  deleteCreditEntry(entryId);

  expect(getCreditEntriesForStore(storeId)).toHaveLength(1);
});

test("a refused write leaves nothing behind for the outbox to retry", () => {
  // The failure this guard exists for: a rejected push blocks every queued row
  // behind it, so the write must not be enqueued in the first place.
  const { entryId } = seedCreditVisit(COLLEAGUE_ID);
  const before = outboxRowsFor(entryId).length;

  updateCreditEntryAmount(entryId, 600);
  deleteCreditEntry(entryId);

  expect(outboxRowsFor(entryId)).toHaveLength(before);
});

test("correcting a payment down raises what the store still owes", () => {
  const { storeId, paymentId } = seedCreditVisitWithPayment();
  expect(balanceOf(storeId)).toBe(550); // 750 owed - 200 paid

  updateCreditEntryAmount(paymentId, 50);

  expect(balanceOf(storeId)).toBe(700);
});

test("a corrected payment is not capped at the balance", () => {
  // An overpayment is a real thing a store can do — the ledger shows it as
  // credit on account rather than refusing the number.
  const { storeId, paymentId } = seedCreditVisitWithPayment();

  updateCreditEntryAmount(paymentId, 1000);

  expect(balanceOf(storeId)).toBe(-250);
});

test("deleting a payment puts the debt back", () => {
  const { storeId, paymentId } = seedCreditVisitWithPayment();

  deleteCreditEntry(paymentId);

  expect(balanceOf(storeId)).toBe(750);
});

test("a payment edit and delete are each queued for push", () => {
  const { paymentId } = seedCreditVisitWithPayment();

  updateCreditEntryAmount(paymentId, 50);
  deleteCreditEntry(paymentId);

  const operations = outboxRowsFor(paymentId).map((row) => row.operation);
  expect(operations).toEqual(expect.arrayContaining(["update", "delete"]));
});

test("a corrected payment stays corrected when the visit's orders change", () => {
  // Unlike a credit, nothing re-derives a payment — syncVisitCredit only ever
  // rewrites the credit row for the visit.
  const { storeId, sessionStoreId, paymentId } = seedCreditVisitWithPayment();
  updateCreditEntryAmount(paymentId, 50);

  addSale({
    sessionStoreId,
    productId: "prod-2",
    productName: "Ensaymada",
    price: 100,
    qty: 1,
    boQty: 0,
    boReason: "",
    paymentType: "credit",
  });

  const payment = getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "payment",
  );
  expect(payment!.amount).toBe(50);
});

test("an unknown entry is a no-op, not a crash", () => {
  expect(() => updateCreditEntryAmount("missing-id", 600)).not.toThrow();
  expect(() => deleteCreditEntry("missing-id")).not.toThrow();
});
