import type { ReactElement } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyPHP } from "@/lib/utils";
import { formatSessionDate, visitRate } from "../helpers/sessionHelpers";
import type { SessionRow } from "../types/session-types";

function SessionDetailMeta({
  session,
  collectedTotal,
}: {
  session: SessionRow;
  collectedTotal: number;
}): ReactElement {
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      {formatSessionDate(session.sessionDate)} &middot;{" "}
      <span className="font-[family-name:var(--font-mono)] font-medium tabular-nums text-foreground">
        {visitRate(session.visitedStores, session.totalStores)}
      </span>{" "}
      of stops covered
      {collectedTotal > 0 ? (
        <>
          {" "}
          &middot;{" "}
          <span className="font-[family-name:var(--font-mono)] font-medium tabular-nums text-primary">
            {formatCurrencyPHP(collectedTotal)}
          </span>{" "}
          collected
        </>
      ) : null}
    </p>
  );
}

export function SessionDetailHeader({
  session,
  collectedTotal,
  onViewInventory,
}: {
  session: SessionRow;
  collectedTotal: number;
  onViewInventory: () => void;
}): ReactElement {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
          Route detail
        </p>
        <CardTitle className="mt-1 text-base">{session.routeName}</CardTitle>
        <SessionDetailMeta session={session} collectedTotal={collectedTotal} />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-2xl"
        onClick={onViewInventory}
      >
        <ClipboardList className="h-4 w-4" />
        View inventory
      </Button>
    </CardHeader>
  );
}
