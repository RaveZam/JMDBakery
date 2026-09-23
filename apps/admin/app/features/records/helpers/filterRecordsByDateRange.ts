import type { SalesRecord } from "@/app/server/salesData/getBaseData";

/**
 * Narrows sales rows to those whose date falls within [dateStart, dateEnd].
 *
 * @param records - Sales rows to filter.
 * @param dateStart - Inclusive lower bound, "YYYY-MM-DD"; blank means no lower bound.
 * @param dateEnd - Inclusive upper bound, "YYYY-MM-DD"; blank means no upper bound.
 * @returns A new array of matching rows; the input is untouched.
 */
export function filterRecordsByDateRange(
  records: SalesRecord[],
  dateStart: string,
  dateEnd: string,
): SalesRecord[] {
  if (!dateStart && !dateEnd) return records;

  return records.filter((record) => {
    if (dateStart && record.date < dateStart) return false;
    if (dateEnd && record.date > dateEnd) return false;
    return true;
  });
}
