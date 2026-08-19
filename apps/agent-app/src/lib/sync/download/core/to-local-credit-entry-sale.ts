export type RemoteSaleRow = {
  id: string;
  session_store_id: string;
  product_id: string;
  snapshot_product_name: string;
  snapshot_price: number;
  quantity_sold: number;
  quantity_bo: number;
  bo_reason: string | null;
  payment_type: "cash" | "credit" | null;
  created_at: string;
};

/** Reshapes a pulled `sales` row for CreditEntrySalesDao.insert. */
export function toLocalCreditEntrySale(row: RemoteSaleRow) {
  return {
    id: row.id,
    sessionStoreId: row.session_store_id,
    productId: row.product_id,
    productName: row.snapshot_product_name,
    price: row.snapshot_price,
    qty: row.quantity_sold,
    boQty: row.quantity_bo,
    boReason: row.bo_reason,
    // Null until the server migration lands; cash is what those rows meant.
    paymentType: row.payment_type ?? "cash",
    createdAt: row.created_at,
  };
}
