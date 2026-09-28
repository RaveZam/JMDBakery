import type { ReactElement } from "react";

import { STORE_SALES_PAGE_SIZE } from "../types/store-types";
import { StoreSalesPageButtons } from "./StoreSalesPageButtons";

export function StoreSalesPagination({
  page,
  totalCount,
  onPageChange,
}: {
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}): ReactElement {
  const start = totalCount === 0 ? 0 : (page - 1) * STORE_SALES_PAGE_SIZE + 1;
  const end = Math.min(page * STORE_SALES_PAGE_SIZE, totalCount);

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground">
        {start}–{end} of {totalCount.toLocaleString()}
      </p>
      <StoreSalesPageButtons page={page} hasNextPage={end < totalCount} onPageChange={onPageChange} />
    </div>
  );
}
