import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

export type EndingInventoryItem = {
  id: string;
  productId: string;
  productName: string;
  endingBo: number;
  endingBalance: number;
};

const EndingInventoryDao = {
  getBySessionId(sessionId: string): EndingInventoryItem[] {
    const rows = getDb().getAllSync<{
      id: string;
      product_id: string;
      snapshot_product_name: string;
      ending_bo: number;
      ending_balance: number;
    }>(
      `SELECT id, product_id, snapshot_product_name, ending_bo, ending_balance
       FROM ending_inventory
       WHERE route_session_id = ?
       ORDER BY created_at ASC`,
      [sessionId],
    );
    return rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.snapshot_product_name,
      endingBo: r.ending_bo,
      endingBalance: r.ending_balance,
    }));
  },

  upsert(input: {
    sessionId: string;
    productId: string;
    snapshotName: string;
    endingBo: number;
    endingBalance: number;
    createdAt: string;
    id?: string;
  }) {
    const id = input.id ?? generateUUID();
    getDb().runSync(
      `INSERT INTO ending_inventory (id, route_session_id, product_id, snapshot_product_name, ending_bo, ending_balance, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(route_session_id, product_id) DO UPDATE SET
         ending_bo = excluded.ending_bo,
         ending_balance = excluded.ending_balance`,
      [
        id,
        input.sessionId,
        input.productId,
        input.snapshotName,
        input.endingBo,
        input.endingBalance,
        input.createdAt,
      ],
    );
    return id;
  },
};

export default EndingInventoryDao;
