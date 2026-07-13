"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatHMS } from "../helpers/formatHMS";

function TimeTrackerView({
  time,
  running,
  onToggle,
  onReset,
}: {
  time: string;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}): ReactElement {
  return (
    <Card className="relative overflow-hidden border-0 shadow-soft">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.25),transparent_60%),linear-gradient(135deg,#0b3b2a,#05261c)]" />
      <div className="relative p-5 text-white">
        <p className="text-sm font-medium text-emerald-50/90">Time Tracker</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight">{time}</p>
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" size="icon" variant="ghost" className={cn("h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/15 hover:text-white")} onClick={onToggle} aria-label={running ? "Pause timer" : "Start timer"}>
            {running ? <Pause /> : <Play />}
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={onReset} aria-label="Stop and reset timer">
            <Square />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function TimeTracker({
  initialSeconds = 1 * 3600 + 24 * 60 + 8,
}: {
  initialSeconds?: number;
}): ReactElement {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const time = useMemo(() => formatHMS(seconds), [seconds]);

  return (
    <TimeTrackerView
      time={time}
      running={running}
      onToggle={() => setRunning((r) => !r)}
      onReset={() => {
        setRunning(false);
        setSeconds(initialSeconds);
      }}
    />
  );
}

