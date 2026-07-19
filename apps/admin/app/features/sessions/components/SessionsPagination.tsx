"use client";

import type { ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Figure } from "./Figure";

function PageCount({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}): ReactElement {
  return (
    <span className="text-xs text-muted-foreground">
      Page <Figure className="text-foreground">{page}</Figure> of{" "}
      <Figure className="text-foreground">{totalPages}</Figure>
    </span>
  );
}

export function SessionsPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <PageCount page={page} totalPages={totalPages} />
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
