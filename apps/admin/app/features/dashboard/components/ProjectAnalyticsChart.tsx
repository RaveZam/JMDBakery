import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import type { DayDatum } from "../types/dashboard-types";

const defaultData: DayDatum[] = [
  { day: "S", value: 42, tone: "striped" },
  { day: "M", value: 66, tone: "solid" },
  { day: "T", value: 52, tone: "striped" },
  { day: "W", value: 78, tone: "solid" },
  { day: "T", value: 58, tone: "striped" },
  { day: "F", value: 64, tone: "solid" },
  { day: "S", value: 48, tone: "striped" },
];

function AnalyticsSvg({
  data,
  max,
}: {
  data: DayDatum[];
  max: number;
}): ReactElement {
  const paddingX = 18;
  const paddingTop = 10;
  const paddingBottom = 28;
  const width = 520;
  const height = 190;
  const keys = data.map((d, i) => `${d.day}-${i}`);
  const yMax = height - paddingBottom;
  const xScale = scaleBand<string>({
    domain: keys,
    range: [paddingX, width - paddingX],
    padding: 0.25,
  });
  const yScale = scaleLinear<number>({
    domain: [0, max],
    range: [yMax, paddingTop],
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[170px] w-full"
      role="img"
      aria-label="Weekly project analytics"
    >
      <defs>
        <linearGradient id="solidBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.95)" />
          <stop offset="100%" stopColor="rgba(5,150,105,0.95)" />
        </linearGradient>
        <pattern
          id="diagStripe"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="10" height="10" fill="rgba(16,185,129,0.08)" />
          <rect width="4" height="10" fill="rgba(16,185,129,0.22)" />
        </pattern>
      </defs>
      {data.map((d, i) => {
        const key = keys[i]!;
        const x = xScale(key);
        if (x == null) return null;
        const barW = xScale.bandwidth();
        const y = yScale(d.value);
        const h = yMax - y;
        const rx = Math.min(18, barW / 2);
        const fill = d.tone === "solid" ? "url(#solidBar)" : "url(#diagStripe)";
        return (
          <g key={`${d.day}-${i}`}>
            <Bar x={x} y={y} width={barW} height={h} rx={rx} fill={fill} />
            <text
              x={x + barW / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(100,116,139,1)"
            >
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ProjectAnalyticsChart({
  data = defaultData,
  className,
}: {
  data?: DayDatum[];
  className?: string;
}): ReactElement {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={cn("shadow-soft", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Project Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <AnalyticsSvg data={data} max={max} />
      </CardContent>
    </Card>
  );
}
