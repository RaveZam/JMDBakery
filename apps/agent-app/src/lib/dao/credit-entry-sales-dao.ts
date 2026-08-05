import { getDb } from "@/src/lib/db";
import type { LoggedItem } from "@/src/lib/dao/sales-dao";

const CreditEntrySalesDao = {
  insert(input: {
    id: string;
    sessionStoreId: string;
    productId: string;
    productName: string;
    price: number;
    qty: number;
    boQty: number;
    boReason: string | null;
    paymentType: "cash" | "credit";
    createdAt: string;
  }) {
    getDb().runSync(
      `INSERT OR REPLACE INTO credit_entry_sales
         (id, session_store_id, product_id, snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, payment_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionStoreId,
        input.productId,
        input.productName,
        input.price,
        input.qty,
        input.boQty,
        input.boReason,
        input.paymentType,
        input.createdAt,
      ],
    );
  },

  getBySessionStoreId(sessionStoreId: string): LoggedItem[] {
    const rows = getDb().getAllSync<{
      id: string;
      product_id: string;
      snapshot_product_name: string;
      snapshot_price: number;
      quantity_sold: number;
      quantity_bo: number;
      bo_reason: string | null;
      payment_type: "cash" | "credit";
    }>(
      `SELECT id, product_id, snapshot_product_name, snapshot_price,
              quantity_sold, quantity_bo, bo_reason, payment_type
       FROM credit_entry_sales
       WHERE session_store_id = ?
       ORDER BY created_at ASC`,
      [sessionStoreId],
    );
    return rows.map((r) => ({
      saleId: r.id,
      productId: r.product_id,
      productName: r.snapshot_product_name,
      price: r.snapshot_price,
      qty: r.quantity_sold,
      boQty: r.quantity_bo,
      boReason: r.bo_reason ?? undefined,
      paymentType: r.payment_type,
    }));
  },

  // A visit already pulled down doesn't need to be asked for again.
  hasSessionStoreId(sessionStoreId: string): boolean {
    return (
      getDb().getFirstSync<{ id: string }>(
        `SELECT id FROM credit_entry_sales WHERE session_store_id = ? LIMIT 1`,
        [sessionStoreId],
      ) != null
    );
  },
};

export default CreditEntrySalesDao;
