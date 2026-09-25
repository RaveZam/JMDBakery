import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import { Figure } from "./Figure";

function TotalBlock({
  label,
  amount,
  pieces,
  tone,
}: {
  label: string;
  amount: number;
  pieces: number;
  tone: "primary" | "destructive";
}): ReactElement {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold">
        <Figure
          className={tone === "primary" ? "text-primary" : "text-destructive"}
        >
          {formatCurrencyPHP(amount)}
        </Figure>
      </p>
      <p className="text-xs text-muted-foreground">
        <Figure>{pieces}</Figure> pcs
      </p>
    </div>
  );
}

export function SessionSalesTotals({
  revenue,
  piecesSold,
  boValue,
  piecesBO,
}: {
  revenue: number;
  piecesSold: number;
  boValue: number;
  piecesBO: number;
}): ReactElement {
  return (
    <div className="flex gap-6">
      <TotalBlock
        label="Revenue"
        amount={revenue}
        pieces={piecesSold}
        tone="primary"
      />
      <TotalBlock
        label="Bad order"
        amount={boValue}
        pieces={piecesBO}
        tone="destructive"
      />
    </div>
  );
}
