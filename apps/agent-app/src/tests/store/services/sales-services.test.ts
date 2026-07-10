import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
  seedProduct,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import {
  addSale,
  updateSale,
  removeSale,
  getSalesBySessionStore,
  getSalesByRouteSession,
  getNetTotalBySessionStore,
} from "@/src/features/store/services/sales-services";

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

/** Seeds the full parent chain and returns the ids a sale needs. */
function seedVisit() {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = seedRouteSession();
  const sessionStoreId = seedSessionStore(sessionId, storeId, provinceId);
  const productId = seedProduct();
  return { sessionId, sessionStoreId, productId, provinceId };
}

function makeSaleInput(
  sessionStoreId: string,
  productId: string,
  overrides: Partial<Parameters<typeof addSale>[0]> = {},
) {
  return {
    sessionStoreId,
    productId,
    productName: "Pandesal",
    price: 10,
    qty: 3,
    boQty: 1,
    boReason: "Damaged",
    ...overrides,
  };
}

test("addSale writes the sale row with a computed total", () => {
  const { sessionStoreId, productId } = seedVisit();

  addSale(makeSaleInput(sessionStoreId, productId));

  const row = getDb().getFirstSync<{
    session_store_id: string;
    product_id: string;
    snapshot_name: string;
    snapshot_price: number;
    quantity_sold: number;
    quantity_bo: number;
    bo_reason: string;
    total: number;
  }>("SELECT * FROM sales WHERE session_store_id = ?", [sessionStoreId]);
  expect(row).toMatchObject({
    session_store_id: sessionStoreId,
    product_id: productId,
    snapshot_name: "Pandesal",
    snapshot_price: 10,
    quantity_sold: 3,
    quantity_bo: 1,
    bo_reason: "Damaged",
    total: 30,
  });
});

test("addSale enqueues a remote-shaped create outbox row in the same write", () => {
  const { sessionStoreId, productId } = seedVisit();

  addSale(makeSaleInput(sessionStoreId, productId));

  const rows = getOutbox("sale");
  expect(rows).toHaveLength(1);
  const [saved] = getSalesBySessionStore(sessionStoreId);
  expect(rows[0].operation).toBe("create");
  expect(rows[0].entity_id).toBe(saved.saleId);
  expect(JSON.parse(rows[0].payload)).toEqual({
    id: saved.saleId,
    session_store_id: sessionStoreId,
    product_id: productId,
    snapshot_product_name: "Pandesal",
    snapshot_price: 10,
    quantity_sold: 3,
    quantity_bo: 1,
    bo_reason: "Damaged",
    created_at: expect.any(String),
  });
});

test("updateSale rewrites the row and enqueues an update outbox row", () => {
  const { sessionStoreId, productId } = seedVisit();
  addSale(makeSaleInput(sessionStoreId, productId));
  const [saved] = getSalesBySessionStore(sessionStoreId);

  updateSale({
    ...makeSaleInput(sessionStoreId, productId, {
      qty: 5,
      boQty: 0,
      boReason: "",
    }),
    saleId: saved.saleId,
  });

  const items = getSalesBySessionStore(sessionStoreId);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ saleId: saved.saleId, qty: 5, boQty: 0 });

  const outbox = latestOutboxFor(saved.saleId);
  expect(outbox).toMatchObject({
    entity_type: "sale",
    operation: "update",
    payload: {
      id: saved.saleId,
      quantity_sold: 5,
      quantity_bo: 0,
      bo_reason: "",
    },
  });
});

test("removeSale deletes the row and enqueues a delete outbox row", () => {
  const { sessionStoreId, productId } = seedVisit();
  addSale(makeSaleInput(sessionStoreId, productId));
  const [saved] = getSalesBySessionStore(sessionStoreId);

  removeSale(saved.saleId);

  expect(getSalesBySessionStore(sessionStoreId)).toHaveLength(0);
  expect(latestOutboxFor(saved.saleId)).toMatchObject({
    entity_type: "sale",
    operation: "delete",
    payload: { id: saved.saleId },
  });
});

test("getSalesByRouteSession spans all stores of the session, not just one stop", () => {
  const { sessionId, sessionStoreId, productId, provinceId } = seedVisit();
  const otherStoreId = seedStore(provinceId, "Store B");
  const otherSessionStoreId = seedSessionStore(
    sessionId,
    otherStoreId,
    provinceId,
  );
  addSale(makeSaleInput(sessionStoreId, productId, { qty: 2 }));
  addSale(makeSaleInput(otherSessionStoreId, productId, { qty: 4 }));

  const sales = getSalesByRouteSession(sessionId);

  expect(sales).toHaveLength(2);
  expect(sales.map((s) => s.qty).sort()).toEqual([2, 4]);
  // per-stop read stays scoped to its own session store
  expect(getSalesBySessionStore(sessionStoreId)).toHaveLength(1);
});

test("getNetTotalBySessionStore sums price * qty sold, ignoring BO quantity", () => {
  const { sessionStoreId, productId } = seedVisit();
  addSale(makeSaleInput(sessionStoreId, productId, { qty: 3, boQty: 5 }));
  addSale(makeSaleInput(sessionStoreId, productId, { qty: 2, boQty: 0 }));

  expect(getNetTotalBySessionStore(sessionStoreId)).toBe(50);
});

test("getNetTotalBySessionStore returns 0 when nothing is logged", () => {
  const { sessionStoreId } = seedVisit();
  expect(getNetTotalBySessionStore(sessionStoreId)).toBe(0);
});
