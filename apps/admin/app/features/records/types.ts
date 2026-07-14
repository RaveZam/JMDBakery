export const RECORDS_PAGE_SIZE = 100;

export type RecordView = "all" | "sales" | "bad-orders";

export const RECORD_VIEWS: { label: string; value: RecordView }[] = [
  { label: "All Records", value: "all" },
  { label: "Sales", value: "sales" },
  { label: "Bad Orders", value: "bad-orders" },
];
