import type { ReactElement } from "react";
import { CalendarDays, Store, Trash2, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AgentRow } from "../types/agent-types";

const AVATAR_COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-violet-200 text-violet-800",
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-800",
  "bg-emerald-200 text-emerald-800",
  "bg-cyan-200 text-cyan-800",
  "bg-pink-200 text-pink-800",
  "bg-orange-200 text-orange-800",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function visitRate(visited: number, planned: number): string {
  if (planned === 0) return "0%";
  return `${Math.round((visited / planned) * 100)}%`;
}

// Same formula as the Intelligence BO ranking: bad orders out of all pieces handed out.
function badOrderRate(sold: number, badOrdered: number): string {
  if (sold + badOrdered === 0) return "0%";
  return `${Math.round((badOrdered / (sold + badOrdered)) * 100)}%`;
}

export function AgentCard({
  agent,
  onDelete,
}: {
  agent: AgentRow;
  onDelete: (id: string) => void;
}): ReactElement {
  const rate = visitRate(agent.totalStoresVisited, agent.totalStoresPlanned);
  const boRate = badOrderRate(agent.totalSold, agent.totalBadOrdered);

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(agent.name)}`}
            >
              {initials(agent.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{agent.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {agent.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-600"
              onClick={() => onDelete(agent.id)}
              aria-label={`Delete ${agent.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Sessions
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {agent.totalSessions}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Store className="h-3 w-3" />
              Stores
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {agent.totalStoresVisited}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Visit Rate
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{rate}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">BO Rate</p>
          <p className="text-sm font-semibold tabular-nums">{boRate}</p>
        </div>
      </CardContent>
    </Card>
  );
}
