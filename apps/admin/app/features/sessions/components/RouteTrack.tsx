import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { routeTrack } from "../helpers/sessionsBoard";

// One tick per stop on the route, filled up to the agent's last visit — so
// coverage reads as a shape before it reads as a number. On a live route the
// next unvisited stop pulses: that is where the van is headed.
function Ticks({
  ticks,
  live,
}: {
  ticks: boolean[];
  live: boolean;
}): ReactElement {
  const leadingEdge = live ? ticks.indexOf(false) : -1;

  return (
    <div className="flex items-center gap-[3px]">
      {ticks.map((visited, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            visited ? "bg-primary" : "bg-border",
            i === leadingEdge && "route-track-live bg-gold",
          )}
        />
      ))}
    </div>
  );
}

function Meter({ filled, live }: { filled: number; live: boolean }): ReactElement {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
      <span
        className={cn(
          "block h-full rounded-full bg-primary",
          live && "route-track-live",
        )}
        style={{ width: `${Math.round(filled * 100)}%` }}
      />
    </div>
  );
}

export function RouteTrack({
  visited,
  total,
  live,
}: {
  visited: number;
  total: number;
  live: boolean;
}): ReactElement {
  const track = routeTrack(visited, total);

  return track.kind === "ticks" ? (
    <Ticks ticks={track.ticks} live={live} />
  ) : (
    <Meter filled={track.filled} live={live} />
  );
}
