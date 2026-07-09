import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

export type LoggedItem = {
  saleId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  boQty: number;
  boReason?: string;
};

const SalesDao = {
  getBySessionStoreId(sessionStoreId: string): LoggedItem[] {
    const rows = getDb().getAllSync<{
      id: string;
      product_id: string;
      snapshot_name: string;
      snapshot_price: number;
      quantity_sold: number;
      quantity_bo: number;
      bo_reason: string | null;
    }>(
      `SELECT id, product_id, snapshot_name, snapshot_price,
              quantity_sold, quantity_bo, bo_reason
       FROM sales
       WHERE session_store_id = ?
       ORDER BY created_at ASC`,
      [sessionStoreId],
    );
    return rows.map((r) => ({
      saleId: r.id,
      productId: r.product_id,
      productName: r.snapshot_name,
      price: r.snapshot_price,
      qty: r.quantity_sold,
      boQty: r.quantity_bo,
      boReason: r.bo_reason ?? undefined,
    }));
  },

  insertSale(input: {
    id: string;
    sessionStoreId: string;
    productId: string;
    snapshotName: string;
    snapshotPrice: number;
    quantitySold: number;
    quantityBo: number;
    boReason: string;
    createdAt: string;
  }) {
    getDb().runSync(
      `INSERT INTO sales (id, session_store_id, product_id, snapshot_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionStoreId,
        input.productId,
        input.snapshotName,
        input.snapshotPrice,
        input.quantitySold,
        input.quantityBo,
        input.boReason,
        input.createdAt,
      ],
    );
    return input.id;
  },

  updateSale(input: {
    saleId: string;
    productId: string;
    snapshotName: string;
    snapshotPrice: number;
    quantitySold: number;
    quantityBo: number;
    boReason: string;
  }) {
    getDb().runSync(
      `UPDATE sales SET product_id = ?, snapshot_name = ?, snapshot_price = ?, quantity_sold = ?, quantity_bo = ?, bo_reason = ? WHERE id = ?`,
      [
        input.productId,
        input.snapshotName,
        input.snapshotPrice,
        input.quantitySold,
        input.quantityBo,
        input.boReason,
        input.saleId,
      ],
    );
  },

  deleteSale(saleId: string) {
    getDb().runSync(`DELETE FROM sales WHERE id = ?`, [saleId]);
  },

  getNetTotal(sessionStoreId: string): number {
    const row = getDb().getFirstSync<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE session_store_id = ?`,
      [sessionStoreId],
    );
    return row?.total ?? 0;
  },

  logAll() {
    const rows = getDb().getAllSync<{
      id: string;
      session_store_id: string;
      product_id: string;
      snapshot_price: number;
      quantity_sold: number;
      quantity_bo: number;
      bo_reason: string | null;
      created_at: string;
    }>(`SELECT * FROM sales`);
    logTable("sales", rows as Record<string, unknown>[]);
  },
};

export default SalesDao;
