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
      expectedBo: sum.expectedBo + r.expectedBo,
      endingBo: sum.endingBo + r.endingBo,
      boVariance: sum.boVariance + r.boVariance,
      expectedBalance: sum.expectedBalance + r.expectedBalance,
      endingBalance: sum.endingBalance + r.endingBalance,
      balanceVariance: sum.balanceVariance + r.balanceVariance,
    }),
    {
      morning: 0,
      sold: 0,
      expectedBo: 0,
      endingBo: 0,
      boVariance: 0,
      expectedBalance: 0,
      endingBalance: 0,
      balanceVariance: 0,
    },
  );
}
