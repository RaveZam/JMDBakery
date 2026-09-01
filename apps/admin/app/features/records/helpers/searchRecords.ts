import type { SalesRecord } from "@/app/server/salesData/getBaseData";

/**
 * Narrows sales rows to those matching the Records page search box.
 *
 * Matches on agent, store, province, and product name, case-insensitively.
 *
 * @param records - Sales rows to search.
 * @param search - Raw search box text; blank or whitespace matches everything.
 * @returns A new array of matching rows; the input is untouched.
 */
export function searchRecords(
  records: SalesRecord[],
  search: string,
): SalesRecord[] {
  const query = search.trim().toLowerCase();
  if (!query) return records;

  return records.filter(
    (record) =>
      record.agent.toLowerCase().includes(query) ||
      record.store.toLowerCase().includes(query) ||
      record.province.toLowerCase().includes(query) ||
      record.product.toLowerCase().includes(query),
  );
}
