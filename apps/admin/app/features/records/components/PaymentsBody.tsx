"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePaymentsFilter } from "../hooks/usePaymentsFilter";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentsEmptyState } from "./PaymentsEmptyState";
import { RecordsPagination } from "./RecordsPagination";

export function PaymentsBody({ search }: { search: string }) {
  const payments = usePaymentsFilter(search);

  if (payments.isLoading) return <LoadingSpinner />;

  // Without this the empty state below would claim nothing was collected,
  // which is a different fact from "we couldn't read the ledger".
  if (payments.error) {
    return (
      <PaymentsEmptyState
        title="Couldn't load payments"
        message="The credit ledger didn't come back. Try refreshing the page."
      />
    );
  }

  return (
    <>
      <PaymentsTable payments={payments.pagePayments} />
      <RecordsPagination
        page={payments.page}
        totalPages={payments.totalPages}
        totalRecords={payments.payments.length}
        onPageChange={payments.setPage}
      />
    </>
  );
}
