"use client";

import { useMemo } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { computeProductBoRate } from "../helpers/computeProductBoRate";
import { computeAgentBoRate } from "../helpers/computeAgentBoRate";
import { ProvinceRankingChart } from "./ProvinceRankingChart";
import { BoRateTable } from "./BoRateTable";
import { SectionHeading } from "./SectionHeading";

export function PerformanceRankings({ records }: { records: SalesRecord[] }) {
  const productBoRate = useMemo(() => computeProductBoRate(records), [records]);
  const agentBoRate = useMemo(() => computeAgentBoRate(records), [records]);

  return (
    <section>
      <SectionHeading
        title="Performance rankings"
        caption="Where revenue comes from, and where units are being lost."
      />
      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <ProvinceRankingChart records={records} />
        <BoRateTable
          title="Product bad order rate"
          caption="Worst products first, by share of units returned"
          rows={productBoRate}
        />
        <BoRateTable
          title="Agent bad order rate"
          caption="Worst performing agent, by share of units returned"
          rows={agentBoRate}
        />
      </div>
    </section>
  );
}
