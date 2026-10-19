import { useState } from "react";
import type { BoReasonRow } from "../../helpers/computeBoReasonRanking";
import { flipOrder } from "../../helpers/flipOrder";
import { FlipOrderButton } from "./FlipOrderButton";
import { PanelCard } from "./PanelCard";
import { RankingRow } from "./RankingRow";

const VISIBLE_ROW_COUNT = 5;

function BoReasonRowItem({
  row,
  rank,
  topBo,
}: {
  row: BoReasonRow;
  rank: number;
  topBo: number;
}) {
  return (
    <RankingRow
      rank={rank}
      label={<span className="truncate text-sm font-medium">{row.reason}</span>}
      value={`${row.sharePct.toFixed(1)}%`}
      detail={
        <>
          <span className="truncate">{row.bo.toLocaleString()} units</span>
          <span className="shrink-0">
            ₱{Math.round(row.boAmount).toLocaleString()} lost
          </span>
        </>
      }
      fraction={topBo === 0 ? 0 : row.bo / topBo}
      fillClass="bg-primary"
    />
  );
}

export function BoReasonTable({ rows }: { rows: BoReasonRow[] }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const topBo = rows[0]?.bo ?? 0;
  const visibleRows = flipOrder(rows, isFlipped).slice(0, VISIBLE_ROW_COUNT);

  return (
    <PanelCard
      isEmpty={rows.length === 0}
      title="Bad order reasons"
      caption="Units lost by reason, biggest cause first"
      action={
        <FlipOrderButton
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      }
    >
      <ul>
        {visibleRows.map((row, index) => (
          <BoReasonRowItem
            key={row.reason}
            row={row}
            rank={index + 1}
            topBo={topBo}
          />
        ))}
      </ul>
    </PanelCard>
  );
}
