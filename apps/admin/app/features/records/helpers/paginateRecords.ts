export function paginateRecords<T>(
  records: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return records.slice(start, start + pageSize);
}
