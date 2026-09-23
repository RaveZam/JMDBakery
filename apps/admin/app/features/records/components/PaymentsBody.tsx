"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePaymentsFilter } from "../hooks/usePaymentsFilter";
import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentsEmptyState } from "./PaymentsEmptyState";
import { RecordsPagination } from "./RecordsPagination";

// Payments has no view/province/agent/product of its own -- it shares only
// the search box with the sales-records filters, via context.
export function PaymentsBody() {
  const { filters } = useRecordsFilters();
  const payments = usePaymentsFilter(filters.search);

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
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PaymentsTable payments={payments.pagePayments} />
      <RecordsPagination
        page={payments.page}
        totalPages={payments.totalPages}
        totalRecords={payments.payments.length}
        onPageChange={payments.setPage}
      />
    </div>
  );
}
