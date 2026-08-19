import {
  toLocalCreditEntrySale,
  type RemoteSaleRow,
} from "@/src/lib/sync/download/core/to-local-credit-entry-sale";

const remoteSale: RemoteSaleRow = {
  id: "sale-1",
  session_store_id: "session-store-1",
  product_id: "product-1",
  snapshot_product_name: "Pandesal",
  snapshot_price: 5,
  quantity_sold: 20,
  quantity_bo: 2,
  bo_reason: "stale",
  payment_type: "credit",
  created_at: "2026-08-01T08:00:00+00:00",
};

test("carries the snapshot name and price over as the local name and price", () => {
  const local = toLocalCreditEntrySale(remoteSale);

  expect(local.productName).toBe("Pandesal");
  expect(local.price).toBe(5);
  expect(local.qty).toBe(20);
  expect(local.boQty).toBe(2);
  expect(local.boReason).toBe("stale");
});

test("treats a missing payment type as cash", () => {
  const local = toLocalCreditEntrySale({ ...remoteSale, payment_type: null });

  expect(local.paymentType).toBe("cash");
});

test("keeps an explicit payment type", () => {
  expect(toLocalCreditEntrySale(remoteSale).paymentType).toBe("credit");
});
