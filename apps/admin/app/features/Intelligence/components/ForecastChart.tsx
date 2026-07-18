"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useForecastChart,
  type ForecastChartState,
} from "../hooks/useForecastChart";
import { bridgeForecastSeam } from "../helpers/bridgeForecastSeam";
import { ForecastRangeToggle } from "./ForecastRangeToggle";
import { ForecastPlot } from "./ForecastPlot";

function ChartMessage({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function PlotArea({
  forecast,
}: {
  forecast: ForecastChartState;
}): React.ReactElement {
  const data = bridgeForecastSeam(forecast.series.data);

  if (forecast.isLoading) {
    return (
      <ChartMessage>
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-emerald-600 animate-spin" />
      </ChartMessage>
    );
  }
  if (forecast.error)
    return <ChartMessage>Could not load forecast data.</ChartMessage>;
  if (data.length === 0) {
    return (
      <ChartMessage>Not enough sales history for this forecast.</ChartMessage>
    );
  }
  return <ForecastPlot series={forecast.series} data={data} />;
}

export function ForecastChart(): React.ReactElement {
  const forecast = useForecastChart();

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{forecast.series.title}</CardTitle>
          <ForecastRangeToggle
            range={forecast.range}
            onChange={forecast.setRange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* The loading state lives inside the fixed-height plot area so the
            header and range buttons stay mounted and clickable while fetching,
            and the card does not collapse and reflow the page. */}
        <div className="h-[280px] w-full">
          <PlotArea forecast={forecast} />
        </div>
      </CardContent>
    </Card>
  );
}
