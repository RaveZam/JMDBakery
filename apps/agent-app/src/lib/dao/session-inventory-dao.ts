import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

export type InventoryItem = {
  inventoryId: string;
  productId: string;
  productName: string;
  /** Price when the item was loaded; 0 for rows written before it was recorded. */
  price: number;
  qty: number;
};

const SessionInventoryDao = {
  getBySessionId(sessionId: string): InventoryItem[] {
    const rows = getDb().getAllSync<{
      id: string;
      product_id: string;
      snapshot_product_name: string;
      snapshot_price: number | null;
      quantity: number;
    }>(
      `SELECT id, product_id, snapshot_product_name, snapshot_price, quantity
       FROM session_inventory
       WHERE route_session_id = ?
       ORDER BY created_at ASC`,
      [sessionId],
    );
    return rows.map((r) => ({
      inventoryId: r.id,
      productId: r.product_id,
      productName: r.snapshot_product_name,
      price: r.snapshot_price ?? 0,
      qty: r.quantity,
    }));
  },

  getRemainingBySessionStoreId(sessionStoreId: string): Record<string, number> {
    const rows = getDb().getAllSync<{ product_id: string; remaining: number }>(
      `SELECT si.product_id,
              si.quantity - COALESCE((
                SELECT SUM(s.quantity_sold + s.quantity_bo)
                FROM sales s
                JOIN session_stores ss2 ON s.session_store_id = ss2.id
                WHERE ss2.route_session_id = si.route_session_id
                  AND s.product_id = si.product_id
              ), 0) AS remaining
       FROM session_inventory si
       WHERE si.route_session_id = (
         SELECT route_session_id FROM session_stores WHERE id = ?
       )`,
      [sessionStoreId],
    );
    const map: Record<string, number> = {};
    for (const r of rows) map[r.product_id] = r.remaining;
    return map;
  },

  insert(input: {
    sessionId: string;
    productId: string;
    snapshotName: string;
    snapshotPrice: number;
    quantity: number;
    createdAt: string;
    id?: string;
  }) {
    const id = input.id ?? generateUUID();
    getDb().runSync(
      `INSERT INTO session_inventory (id, route_session_id, product_id, snapshot_product_name, snapshot_price, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.sessionId,
        input.productId,
        input.snapshotName,
        input.snapshotPrice,
        input.quantity,
        input.createdAt,
      ],
    );
    return id;
  },

  updateQuantity(id: string, quantity: number) {
    getDb().runSync(`UPDATE session_inventory SET quantity = ? WHERE id = ?`, [
      quantity,
      id,
    ]);
  },

  delete(id: string) {
    getDb().runSync(`DELETE FROM session_inventory WHERE id = ?`, [id]);
  },

  logAll() {
    const rows = getDb().getAllSync<{
      id: string;
      route_session_id: string;
      product_id: string;
      snapshot_product_name: string;
      snapshot_price: number | null;
      quantity: number;
      created_at: string;
    }>(`SELECT * FROM session_inventory`);
    logTable("session_inventory", rows as Record<string, unknown>[]);
  },
};

export default SessionInventoryDao;
