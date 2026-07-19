"use client";

import type { ReactElement } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import {
  computeProvinceRanking,
  type ProvinceRevenue,
} from "../helpers/computeProvinceRanking";
import { MetricRail } from "./MetricRail";
import { PanelCard } from "./PanelCard";

function ProvinceRow({
  province,
  rank,
  topRevenue,
}: {
  province: ProvinceRevenue;
  rank: number;
  topRevenue: number;
}) {
  return (
    <li className="border-b border-border/50 py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {String(rank).padStart(2, "0")}
          </span>
          <span className="truncate text-sm font-medium">
            {province.province}
          </span>
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          ₱{Math.round(province.revenue).toLocaleString()}
        </span>
      </div>
      <div className="mt-2">
        <MetricRail
          fraction={topRevenue === 0 ? 0 : province.revenue / topRevenue}
          fillClass="bg-primary"
        />
      </div>
    </li>
  );
}

export function ProvinceRankingChart({
  records,
}: {
  records: SalesRecord[];
}): ReactElement {
  const ranking = computeProvinceRanking(records);
  const topRevenue = ranking[0]?.revenue ?? 0;

  return (
    <PanelCard
      title="Province ranking"
      caption="Total revenue by province, highest first"
    >
      {ranking.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          No data for this period.
        </p>
      ) : (
        <ul>
          {ranking.map((province, index) => (
            <ProvinceRow
              key={province.province}
              province={province}
              rank={index + 1}
              topRevenue={topRevenue}
            />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
