import type { ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StoreSalesPageButtons({
  page,
  hasNextPage,
  onPageChange,
}: {
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}): ReactElement {
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
