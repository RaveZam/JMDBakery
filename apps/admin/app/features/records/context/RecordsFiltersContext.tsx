"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { useRecordsFilter } from "../hooks/useRecordsFilter";
import type { useRecordsDateRange } from "../hooks/useRecordsDateRange";

export type RecordsFiltersValue = ReturnType<typeof useRecordsFilter> & {
  dateRange: ReturnType<typeof useRecordsDateRange>;
  showPayments: boolean;
};

const RecordsFiltersContext = createContext<RecordsFiltersValue | null>(null);

/** Carries the Records page's filter/pagination state to every component
 * below it, so they read what they need directly instead of threading it
 * down through each layer as props. Mounted once in RecordsClient. */
export function RecordsFiltersProvider({
  value,
  children,
}: {
  value: RecordsFiltersValue;
  children: ReactNode;
}) {
  return (
    <RecordsFiltersContext.Provider value={value}>
      {children}
    </RecordsFiltersContext.Provider>
  );
}

/** Reads the Records page's active filters, pagination, and derived data.
 * Must be called from a component rendered under RecordsFiltersProvider. */
export function useRecordsFilters(): RecordsFiltersValue {
  const context = useContext(RecordsFiltersContext);
  if (!context) {
    throw new Error(
      "useRecordsFilters must be used within RecordsFiltersProvider",
    );
  }
  return context;
}
