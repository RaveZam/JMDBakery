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
  store: string;
  province: string;
  /** Who physically accepted the cash at the store. */
  collectedBy: string;
  /** Who typed it into the app. Usually the same person as collectedBy. */
  encodedBy: string;
  note: string | null;
  amount: number;
};
