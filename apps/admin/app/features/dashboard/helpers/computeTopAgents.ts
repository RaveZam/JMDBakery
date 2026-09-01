import { excludeCreditSales } from "@/app/server/salesData/excludeCreditSales";
import type {
  AgentPaymentRecord,
  AgentSaleRecord,
} from "../types/dashboard-types";

/**
 * Ranks agents by the money they brought in, best five first.
 *
 * Counts cash orders plus any old credit they collected, matching the Total
 * Sales card. Credit orders are left out — the agent gets the credit for that
 * money on the day someone actually collects it.
 *
 * @param data - Sale lines already narrowed to the selected date range.
 * @param payments - Credit repayments collected in that same range, attributed
 *                   to whoever physically took the cash.
 * @returns Up to five `{ agent, revenue }` entries, highest revenue first.
 */
export function computeTopAgents(
  data: AgentSaleRecord[],
  payments: AgentPaymentRecord[],
) {
  const totals: { [agent: string]: number } = {};

  for (const row of excludeCreditSales(data)) {
    if (!totals[row.agent]) totals[row.agent] = 0;
    totals[row.agent] += row.total;
  }

  for (const payment of payments) {
    if (!totals[payment.collectedBy]) totals[payment.collectedBy] = 0;
    totals[payment.collectedBy] += payment.amount;
  }

  return Object.entries(totals)
    .map(([agent, revenue]) => ({ agent, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
