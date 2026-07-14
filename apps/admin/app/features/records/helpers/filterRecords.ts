import type { SalesRecord } from "@/app/server/getBaseData";
import type { RecordView } from "../types";

export function filterRecords(
  records: SalesRecord[],
  view: RecordView,
  search: string,
): SalesRecord[] {
  const query = search.trim().toLowerCase();

  return records.filter((record) => {
    if (view === "sales" && record.soldQty <= 0) return false;
    if (view === "bad-orders" && record.boQty <= 0) return false;
    if (!query) return true;

    return (
      record.agent.toLowerCase().includes(query) ||
      record.store.toLowerCase().includes(query) ||
      record.province.toLowerCase().includes(query) ||
      record.product.toLowerCase().includes(query)
    );
  });
}
