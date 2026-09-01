export const RECORDS_PAGE_SIZE = 100;

export type RecordView =
  | "all"
  | "sales"
  | "bad-orders"
  | "credits"
  | "payments";

export const RECORD_VIEWS: { label: string; value: RecordView }[] = [
  { label: "All Records", value: "all" },
  { label: "Sales", value: "sales" },
  { label: "Bad Orders", value: "bad-orders" },
  { label: "Credits", value: "credits" },
  { label: "Payments", value: "payments" },
];

/** One repayment a store made against its credit. */
export type CreditPayment = {
  id: string;
  /** The day it was collected, in Philippine time. */
  date: string;
  /** Raw collection timestamp, for hourly views and the time on each row. */
  createdAt: string;
  store: string;
  province: string;
  /** The agent who recorded the payment. */
  collectedBy: string;
  note: string | null;
  amount: number;
};
