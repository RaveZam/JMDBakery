import type { SalesRecord } from "@/app/server/getBaseData";

export function paginateRecords(
  records: SalesRecord[],
  page: number,
  pageSize: number,
): SalesRecord[] {
  const start = (page - 1) * pageSize;
  return records.slice(start, start + pageSize);
}
