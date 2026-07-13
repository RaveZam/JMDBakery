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
};

export type ProductSoldRecord = {
  product: string;
  soldQty: number;
  total: number;
};
