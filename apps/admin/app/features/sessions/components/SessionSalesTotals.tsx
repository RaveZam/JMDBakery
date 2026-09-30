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
  pieces?: number;
  tone: "primary" | "accent" | "destructive";
}): ReactElement {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold">
        <Figure
          className={
            tone === "primary"
              ? "text-primary"
              : tone === "accent"
                ? "text-blue-700 dark:text-blue-300"
                : "text-destructive"
          }
        >
          {formatCurrencyPHP(amount)}
        </Figure>
      </p>
      {pieces === undefined ? null : (
        <p className="text-xs text-muted-foreground">
          <Figure>{pieces}</Figure> pcs
        </p>
      )}
    </div>
  );
}

export function SessionSalesTotals({
  cashTotal,
  cashPieces,
  creditTotal,
  creditPieces,
  boValue,
  piecesBO,
  collectedTotal,
}: {
  cashTotal: number;
  cashPieces: number;
  creditTotal: number;
  creditPieces: number;
  boValue: number;
  piecesBO: number;
  collectedTotal: number;
}): ReactElement {
  return (
    <div className="flex gap-6">
      <TotalBlock
        label="Cash collected"
        amount={cashTotal}
        pieces={cashPieces}
        tone="primary"
      />
      {collectedTotal > 0 ? (
        <TotalBlock
          label="Collected from credits"
          amount={collectedTotal}
          tone="primary"
        />
      ) : null}
      <TotalBlock
        label="Credited"
        amount={creditTotal}
        pieces={creditPieces}
        tone="accent"
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
