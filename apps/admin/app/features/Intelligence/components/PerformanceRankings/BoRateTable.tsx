import { useState } from "react";
import type { BoRateRow } from "../../helpers/computeBoRateByKey";
import { badOrderSeverity } from "../../helpers/badOrderSeverity";
import { flipOrder } from "../../helpers/flipOrder";
import { FlipOrderButton } from "./FlipOrderButton";
import { PanelCard } from "./PanelCard";
import { RankingRow } from "./RankingRow";
import { SeverityBadge } from "./SeverityBadge";

const VISIBLE_ROW_COUNT = 5;

function BadOrderRow({
  row,
  rank,
  worstRatePct,
}: {
  row: BoRateRow;
  rank: number;
  worstRatePct: number;
}) {
  const severity = badOrderSeverity(row.boRatePct);

  return (
    <RankingRow
      rank={rank}
      label={
        <>
          <span className="truncate text-sm font-medium">{row.key}</span>
          <SeverityBadge severity={severity} />
        </>
      }
      value={`${row.boRatePct.toFixed(1)}%`}
      valueClassName={severity.textClass}
      detail={
        <>
          <span className="truncate">
            {row.bo.toLocaleString()} bad of{" "}
            {(row.sold + row.bo).toLocaleString()} units
          </span>
          <span className="shrink-0">
            ₱{Math.round(row.boAmount).toLocaleString()} lost
          </span>
        </>
      }
      fraction={worstRatePct === 0 ? 0 : row.boRatePct / worstRatePct}
      fillClass={severity.fillClass}
    />
  );
}

export function BoRateTable({
  title,
  caption,
  rows,
}: {
  title: string;
  caption: string;
  rows: BoRateRow[];
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const worstRatePct = rows[0]?.boRatePct ?? 0;
  const visibleRows = flipOrder(rows, isFlipped).slice(0, VISIBLE_ROW_COUNT);

  return (
    <PanelCard
      isEmpty={rows.length === 0}
      title={title}
      caption={caption}
      action={
        <FlipOrderButton
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      }
    >
      <ul>
        {visibleRows.map((row, index) => (
          <BadOrderRow
            key={row.key}
            row={row}
            rank={index + 1}
            worstRatePct={worstRatePct}
          />
        ))}
      </ul>
    </PanelCard>
  );
}
