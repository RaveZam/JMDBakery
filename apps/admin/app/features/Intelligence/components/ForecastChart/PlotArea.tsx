"use client";

import { useForecastChart } from "../../hooks/useForecastChart";
import { bridgeForecastSeam } from "../../helpers/bridgeForecastSeam";
import { ChartMessage } from "./ChartMessage";
import { ForecastPlot } from "./ForecastPlot";

export function PlotArea(): React.ReactElement {
  const forecast = useForecastChart();
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
