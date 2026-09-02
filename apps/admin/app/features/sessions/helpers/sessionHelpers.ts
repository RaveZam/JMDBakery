import type { InventorySummaryRow } from "../types/session-types";

export function formatSessionDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function visitRate(visited: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((visited / total) * 100)}%`;
}

export function sumSales(
  sales: { quantitySold: number; quantityBO: number; total: number }[],
): { quantitySold: number; quantityBO: number; total: number } {
  return sales.reduce(
    (sum, s) => ({
      quantitySold: sum.quantitySold + s.quantitySold,
      quantityBO: sum.quantityBO + s.quantityBO,
      total: sum.total + s.total,
    }),
    { quantitySold: 0, quantityBO: 0, total: 0 },
  );
}

export function sumInventory(
  rows: InventorySummaryRow[],
): Omit<InventorySummaryRow, "productId" | "productName"> {
  return rows.reduce(
    (sum, r) => ({
      morning: sum.morning + r.morning,
      sold: sum.sold + r.sold,
      backOrder: sum.backOrder + r.backOrder,
      expected: sum.expected + r.expected,
      balance: sum.balance + r.balance,
      ending: sum.ending + r.ending,
      variance: sum.variance + r.variance,
    }),
    { morning: 0, sold: 0, backOrder: 0, expected: 0, balance: 0, ending: 0, variance: 0 },
  );
}
