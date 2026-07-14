"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RECORDS_PAGE_SIZE } from "../types";

function PaginationSummary({
  page,
  totalRecords,
}: {
  page: number;
  totalRecords: number;
}) {
  const start = totalRecords === 0 ? 0 : (page - 1) * RECORDS_PAGE_SIZE + 1;
  const end = Math.min(page * RECORDS_PAGE_SIZE, totalRecords);

  return (
    <p className="text-xs text-muted-foreground">
      Showing <span className="font-medium text-foreground">{start}-{end}</span> of{" "}
      <span className="font-medium text-foreground">{totalRecords.toLocaleString()}</span> records
    </p>
  );
}

export function RecordsPagination({
  page,
  totalPages,
  totalRecords,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <PaginationSummary page={page} totalRecords={totalRecords} />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
