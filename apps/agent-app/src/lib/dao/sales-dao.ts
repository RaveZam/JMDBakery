import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";
import type { LoggedItem } from "@/src/features/store/hooks/useDistributionLog";

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

  insertSale(
    id: string,
    sessionStoreId: string,
    productId: string,
    snapshotName: string,
    snapshotPrice: number,
    quantitySold: number,
    quantityBo: number,
    boReason: string,
  ) {
    getDb().runSync(
      `INSERT INTO sales (id, session_store_id, product_id, snapshot_name, snapshot_price, quantity_sold, quantity_bo, bo_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sessionStoreId,
        productId,
        snapshotName,
        snapshotPrice,
        quantitySold,
        quantityBo,
        boReason,
      ],
    );
    return id;
  },

  updateSale(
    saleId: string,
    productId: string,
    snapshotName: string,
    snapshotPrice: number,
    quantitySold: number,
    quantityBo: number,
    boReason: string,
  ) {
    getDb().runSync(
      `UPDATE sales SET product_id = ?, snapshot_name = ?, snapshot_price = ?, quantity_sold = ?, quantity_bo = ?, bo_reason = ? WHERE id = ?`,
      [
        productId,
        snapshotName,
        snapshotPrice,
        quantitySold,
        quantityBo,
        boReason,
        saleId,
      ],
    );
  },

  deleteSale(saleId: string) {
    getDb().runSync(`DELETE FROM sales WHERE id = ?`, [saleId]);
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
