import { Banknote, Percent, PackageX, ShoppingBag, Store } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { useComputeSalesKPI } from "../hooks/useComputeSalesKPI";
import { FilterRange } from "../types";

const FILTER_LABEL: Record<FilterRange, string> = {
  today: "Today",
  "7days": "Past 7 Days",
  "30days": "Past 30 Days",
};

export function KpiStrip({ data, filter }: { data: any; filter: FilterRange }) {
  const { totalSales, avgPerStore, totalBO, finalBboRate, totalSold } =
    useComputeSalesKPI(data);

  const label = FILTER_LABEL[filter];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        title={`Total Sales · ${label}`}
        primary={"₱" + totalSales.toLocaleString()}
        tone="hero"
        icon={Banknote}
      />
      <KpiCard
        title="Avg Sales per Store"
        primary={
          "₱" +
          avgPerStore.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }
        accent="green"
        icon={Store}
      />
      <KpiCard
        title={`Total Sold · ${label}`}
        primary={totalSold.toLocaleString() + " pcs"}
        accent="gold"
        icon={ShoppingBag}
      />
      <KpiCard
        title={`Total BO · ${label}`}
        primary={Number(totalBO).toLocaleString() + " pcs"}
        accent="amber"
        icon={PackageX}
      />
      <KpiCard
        title="BO Rate"
        primary={finalBboRate.toFixed(2) + "%"}
        accent="red"
        icon={Percent}
      />
    </div>
  );
}
