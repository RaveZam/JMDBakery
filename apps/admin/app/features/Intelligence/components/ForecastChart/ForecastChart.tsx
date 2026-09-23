"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForecastChart } from "../../hooks/useForecastChart";
import { PlotArea } from "./PlotArea";
import { DisplayMetricToggle, type DisplayMetric } from "./DisplayMetricToggle";
import { useState } from "react";

export function ForecastChart(): React.ReactElement {
  const [displayMetric, setDisplayMetric] = useState<DisplayMetric>("pesos");
  const forecast = useForecastChart(displayMetric);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{forecast.series.title}</CardTitle>
          <DisplayMetricToggle
            value={displayMetric}
            onChange={setDisplayMetric}
          />
        </div>
        {forecast.series.note ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {forecast.series.note}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <PlotArea displayMetric={displayMetric} />
        </div>
      </CardContent>
    </Card>
  );
}
