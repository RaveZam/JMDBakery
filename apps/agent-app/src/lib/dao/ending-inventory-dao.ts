import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

export type EndingInventoryItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
};

const EndingInventoryDao = {
  getBySessionId(sessionId: string): EndingInventoryItem[] {
    const rows = getDb().getAllSync<{
      id: string;
      product_id: string;
      snapshot_product_name: string;
      quantity: number;
    }>(
      `SELECT id, product_id, snapshot_product_name, quantity
       FROM ending_inventory
       WHERE route_session_id = ?
       ORDER BY created_at ASC`,
      [sessionId],
    );
    return rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.snapshot_product_name,
      quantity: r.quantity,
    }));
  },

  upsert(
    sessionId: string,
    productId: string,
    snapshotName: string,
    quantity: number,
    id: string = generateUUID(),
  ) {
    getDb().runSync(
      `INSERT INTO ending_inventory (id, route_session_id, product_id, snapshot_product_name, quantity)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(route_session_id, product_id) DO UPDATE SET quantity = excluded.quantity`,
      [id, sessionId, productId, snapshotName, quantity],
    );
    return id;
  },
};

export default EndingInventoryDao;
