import { useMemo } from "react";
import { useCreditPaymentsQuery } from "@/app/server/creditPayments/useCreditPaymentsQuery";
import { RECORDS_PAGE_SIZE } from "../types";
import { filterPayments } from "../helpers/filterPayments";
import { usePagination } from "./usePagination";

/** The Payments tab's data: the credit ledger narrowed by the search box. */
export function usePaymentsFilter(search: string) {
  const { data: allPayments, isLoading, error } = useCreditPaymentsQuery();

  const payments = useMemo(
    () => filterPayments(allPayments, search),
    [allPayments, search],
  );

  const { page, setPage, totalPages, pageRecords } = usePagination(
    payments,
    RECORDS_PAGE_SIZE,
    search,
  );

  return {
    isLoading,
    error,
    payments,
    pagePayments: pageRecords,
    page,
    setPage,
    totalPages,
  };
}
