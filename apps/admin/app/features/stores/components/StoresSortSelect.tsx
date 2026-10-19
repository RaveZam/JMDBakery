"use client";

import type { ReactElement } from "react";
import { ArrowUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { STORE_SORT_OPTIONS } from "../core/storeSortOptions";
import type { StoreSortKey } from "../types/store-types";

export function StoresSortSelect({
  sortKey,
  onSortChange,
}: {
  sortKey: StoreSortKey;
  onSortChange: (sortKey: StoreSortKey) => void;
}): ReactElement {
  const currentLabel = STORE_SORT_OPTIONS.find(
    (option) => option.key === sortKey,
  )?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Sort stores, currently ${currentLabel}`}
        title={`Sorted by ${currentLabel}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
      >
        <ArrowUpDown className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl bg-card text-card-foreground shadow-lg"
      >
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sortKey}
          onValueChange={(value) => onSortChange(value as StoreSortKey)}
        >
          {STORE_SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.key} value={option.key}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
