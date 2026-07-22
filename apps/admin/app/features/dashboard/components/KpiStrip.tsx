import { Banknote, PackageX, Scale, ShoppingBag, Store } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { computeSalesKPI } from "../helpers/computeSalesKPI";
import { computeVarianceTotal } from "../helpers/computeVarianceTotal";
import type { VarianceRecord } from "@/app/server/varianceData/getVarianceDataset";
import { FilterRange, SalesKpiRecord } from "../types/dashboard-types";

const FILTER_LABEL: Record<FilterRange, string> = {
  today: "Today",
  "7days": "Past 7 Days",
  "30days": "Past 30 Days",
};

export function KpiStrip({
  data,
  varianceData,
  filter,
}: {
  data: SalesKpiRecord[];
  varianceData: VarianceRecord[];
  filter: FilterRange;
}) {
  const { totalSales, avgPerStore, totalBO, finalBboRate, totalSold } =
    computeSalesKPI(data);
  const varianceTotal = computeVarianceTotal(varianceData);

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
        primary={totalSold.toLocaleString()}
        unit="pcs"
        accent="gold"
        icon={ShoppingBag}
      />
      <KpiCard
        title={`Bad Order · ${label}`}
        primary={finalBboRate.toFixed(2) + "%"}
        secondary={`${Number(totalBO).toLocaleString()} pieces`}
        accent="red"
        icon={PackageX}
      />
      <KpiCard
        title={`Inventory Variance · ${label}`}
        primary={varianceTotal.toLocaleString()}
        unit="pcs"
        accent="amber"
        icon={Scale}
      />
    </div>
  );
}
