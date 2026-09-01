export type FilterRange = "today" | "7days" | "30days";
export const FILTERS: { label: string; value: FilterRange }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
];

export type KpiCardTone =
  | "neutral"
  | "hero"
  | "primary"
  | "healthy"
  | "medium"
  | "warning"
  | "critical";
export type KpiCardAccent = "green" | "gold" | "amber" | "red" | "slate";

export type ProductBoRecord = {
  product: string;
  soldQty: number;
  boQty: number;
};

export type AgentSaleRecord = {
  agent: string;
  total: number;
  paymentType: "cash" | "credit";
};

export type ProductSoldRecord = {
  product: string;
  soldQty: number;
  total: number;
};

export type SalesKpiRecord = {
  store: string;
  total: number;
  soldQty: number;
  boQty: number;
  paymentType: "cash" | "credit";
};

/*
 * Credit repayments reach the dashboard as money with no products or pieces
 * attached, so they get their own narrow shapes rather than being forced into
 * the sale-line ones. Each holds only what its chart needs.
 */

export type StorePaymentRecord = {
  store: string;
  amount: number;
};

export type AgentPaymentRecord = {
  collectedBy: string;
  amount: number;
};

export type TimelinePaymentRecord = {
  date: string;
  createdAt: string;
  amount: number;
};
