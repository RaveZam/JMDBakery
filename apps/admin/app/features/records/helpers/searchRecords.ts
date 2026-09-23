import type { SalesRecord } from "@/app/server/salesData/getBaseData";

/**
 * Narrows sales rows to those matching the Records page search box.
 *
 * Matches on store name only, case-insensitively — agent and product have
 * their own dropdown filters, and province has its own text filter.
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

  return records.filter((record) => record.store.toLowerCase().includes(query));
}
