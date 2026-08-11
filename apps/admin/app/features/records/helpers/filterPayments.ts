import type { CreditPayment } from "../types";

export function filterPayments(
  payments: CreditPayment[],
  search: string,
): CreditPayment[] {
  const query = search.trim().toLowerCase();
  if (!query) return payments;

  return payments.filter(
    (payment) =>
      payment.store.toLowerCase().includes(query) ||
      payment.province.toLowerCase().includes(query) ||
      payment.collectedBy.toLowerCase().includes(query) ||
      payment.encodedBy.toLowerCase().includes(query) ||
      (payment.note ?? "").toLowerCase().includes(query),
  );
}
