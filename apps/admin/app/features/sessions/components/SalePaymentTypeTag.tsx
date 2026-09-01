import type { ReactElement } from "react";

// How the order was settled. A visit can mix both, so it is marked per item.
export function SalePaymentTypeTag({
  paymentType,
}: {
  paymentType: "cash" | "credit";
}): ReactElement {
  const isCredit = paymentType === "credit";
  return (
    <span
      className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
        isCredit
          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      }`}
    >
      {isCredit ? "Credit" : "Cash"}
    </span>
  );
}
