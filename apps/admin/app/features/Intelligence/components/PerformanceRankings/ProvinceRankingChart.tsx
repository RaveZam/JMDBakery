"use client";

import { useState, type ReactElement } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { CreditPayment } from "@/app/features/records/types";
import {
  computeProvinceRanking,
  type ProvinceRevenue,
} from "../../helpers/computeProvinceRanking";
import { flipOrder } from "../../helpers/flipOrder";
import { FlipOrderButton } from "./FlipOrderButton";
import { PanelCard } from "./PanelCard";
import { RankingRow } from "./RankingRow";

const VISIBLE_ROW_COUNT = 5;

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
    <RankingRow
      rank={rank}
      label={
        <span className="truncate text-sm font-medium">
          {province.province}
        </span>
      }
      value={`₱${Math.round(province.revenue).toLocaleString()}`}
      fraction={topRevenue === 0 ? 0 : province.revenue / topRevenue}
      fillClass="bg-primary"
    />
  );
}

export function ProvinceRankingChart({
  records,
  payments,
}: {
  records: SalesRecord[];
  payments: CreditPayment[];
}): ReactElement {
  const ranking = computeProvinceRanking(records, payments);
  const [isFlipped, setIsFlipped] = useState(false);
  const topRevenue = ranking[0]?.revenue ?? 0;
  const visibleRanking = flipOrder(ranking, isFlipped).slice(
    0,
    VISIBLE_ROW_COUNT,
  );

  return (
    <PanelCard
      isEmpty={ranking.length === 0}
      title="Province ranking"
      caption="Revenue collected, highest first"
      action={
        <FlipOrderButton
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      }
    >
      <ul>
        {visibleRanking.map((province, index) => (
          <ProvinceRow
            key={province.province}
            province={province}
            rank={index + 1}
            topRevenue={topRevenue}
          />
        ))}
      </ul>
    </PanelCard>
  );
}
