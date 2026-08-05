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
  paymentType: "cash" | "credit";
};

type SaleRow = {
  id: string;
  product_id: string;
  snapshot_name: string;
  snapshot_price: number;
  quantity_sold: number;
  quantity_bo: number;
  bo_reason: string | null;
  payment_type: "cash" | "credit";
};

function toLoggedItem(row: SaleRow): LoggedItem {
  return {
    saleId: row.id,
    productId: row.product_id,
    productName: row.snapshot_name,
    price: row.snapshot_price,
    qty: row.quantity_sold,
    boQty: row.quantity_bo,
    boReason: row.bo_reason ?? undefined,
    paymentType: row.payment_type,
  };
}

const SalesDao = {
  getBySessionStoreId(sessionStoreId: string): LoggedItem[] {
    return getDb()
      .getAllSync<SaleRow>(
        `SELECT id, product_id, snapshot_name, snapshot_price,
              quantity_sold, quantity_bo, bo_reason, payment_type
       FROM sales
       WHERE session_store_id = ?
       ORDER BY created_at ASC`,
        [sessionStoreId],
      )
      .map(toLoggedItem);
  },

  getByRouteSessionId(routeSessionId: string): LoggedItem[] {
    return getDb()
      .getAllSync<SaleRow>(
        `SELECT s.id, s.product_id, s.snapshot_name, s.snapshot_price,
              s.quantity_sold, s.quantity_bo, s.bo_reason, s.payment_type
       FROM sales s
       JOIN session_stores ss ON ss.id = s.session_store_id
       WHERE ss.route_session_id = ?
       ORDER BY s.created_at ASC`,
        [routeSessionId],
      )
      .map(toLoggedItem);
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
    paymentType: "cash" | "credit";
    createdAt: string;
  }) {
    getDb().runSync(
      `INSERT INTO sales (id, session_store_id, product_id, snapshot_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, payment_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionStoreId,
        input.productId,
        input.snapshotName,
        input.snapshotPrice,
        input.quantitySold,
        input.quantityBo,
        input.boReason,
        input.paymentType,
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
    paymentType: "cash" | "credit";
  }) {
    getDb().runSync(
      `UPDATE sales SET product_id = ?, snapshot_name = ?, snapshot_price = ?, quantity_sold = ?, quantity_bo = ?, bo_reason = ?, payment_type = ? WHERE id = ?`,
      [
        input.productId,
        input.snapshotName,
        input.snapshotPrice,
        input.quantitySold,
        input.quantityBo,
        input.boReason,
        input.paymentType,
        input.saleId,
      ],
    );
  },

  deleteSale(saleId: string) {
    getDb().runSync(`DELETE FROM sales WHERE id = ?`, [saleId]);
  },

  getSessionStoreId(saleId: string): string | null {
    const row = getDb().getFirstSync<{ session_store_id: string }>(
      `SELECT session_store_id FROM sales WHERE id = ?`,
      [saleId],
    );
    return row?.session_store_id ?? null;
  },

  getNetTotal(sessionStoreId: string): number {
    const row = getDb().getFirstSync<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE session_store_id = ?`,
      [sessionStoreId],
    );
    return row?.total ?? 0;
  },

  // What the store owes from this visit: only the orders taken on credit, not
  // the whole stop. A visit that mixes the two owes just the credit half.
  getCreditTotal(sessionStoreId: string): number {
    const row = getDb().getFirstSync<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM sales
       WHERE session_store_id = ? AND payment_type = 'credit'`,
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
