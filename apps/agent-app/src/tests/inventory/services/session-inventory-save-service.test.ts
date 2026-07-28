import {
  createSchema,
  resetDb,
  seedRouteSession,
  seedProduct,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import {
  addMorningInventoryItem,
  updateMorningInventoryQty,
  removeMorningInventoryItem,
} from "@/src/features/inventory/services/session-inventory-save-service";

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

/** Insert an inventory row directly (no outbox) and return its id. */
function seedInventoryItem(sessionId: string, productId: string, qty = 10): string {
  const id = "inv-1";
  SessionInventoryDao.insert({
    sessionId,
    productId,
    snapshotName: "Pandesal",
    snapshotPrice: 10,
    quantity: qty,
    createdAt: "2026-06-30T00:00:00.000Z",
    id,
  });
  return id;
}

test("add inserts the item and enqueues a create with the snake_case payload", () => {
  const sessionId = seedRouteSession();
  const productId = seedProduct();

  addMorningInventoryItem({
    sessionId,
    productId,
    productName: "Pandesal",
    price: 10,
    qty: 12,
  });

  const items = SessionInventoryDao.getBySessionId(sessionId);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({
    productId,
    productName: "Pandesal",
    price: 10,
    qty: 12,
  });

  const rows = getOutbox("session_inventory");
  expect(rows).toHaveLength(1);
  expect(rows[0].operation).toBe("create");
  expect(JSON.parse(rows[0].payload)).toMatchObject({
    id: items[0].inventoryId,
    route_session_id: sessionId,
    product_id: productId,
    snapshot_product_name: "Pandesal",
    quantity: 12,
  });
});

test("update changes the quantity and enqueues an update with only the quantity", () => {
  const sessionId = seedRouteSession();
  const productId = seedProduct();
  const inventoryId = seedInventoryItem(sessionId, productId);

  updateMorningInventoryQty(inventoryId, 7);

  expect(SessionInventoryDao.getBySessionId(sessionId)[0].qty).toBe(7);

  const outbox = latestOutboxFor(inventoryId);
  expect(outbox).toMatchObject({
    entity_type: "session_inventory",
    operation: "update",
    payload: { quantity: 7 },
  });
});

test("remove deletes the row and enqueues a delete", () => {
  const sessionId = seedRouteSession();
  const productId = seedProduct();
  const inventoryId = seedInventoryItem(sessionId, productId);

  removeMorningInventoryItem(inventoryId);

  expect(SessionInventoryDao.getBySessionId(sessionId)).toHaveLength(0);

  const outbox = latestOutboxFor(inventoryId);
  expect(outbox).toMatchObject({
    entity_type: "session_inventory",
    operation: "delete",
    payload: { id: inventoryId },
  });
});
