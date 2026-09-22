"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForecastChart } from "../../hooks/useForecastChart";
import { PlotArea } from "./PlotArea";

export function ForecastChart(): React.ReactElement {
  const forecast = useForecastChart();

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{forecast.series.title}</CardTitle>
        </div>
        {forecast.series.note ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {forecast.series.note}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <PlotArea />
        </div>
      </CardContent>
    </Card>
  );
}
