import { DataPoint, ForecastChartData } from "../types/forecast_types";
import type { SalesRecord } from "@/app/server/getBaseData";
import { phNow } from "./phNow";
import { toDateKey } from "./toDateKey";
import { computeForecastBounds } from "./computeForecastBounds";

export function forecastNextWeek(data: SalesRecord[]): ForecastChartData {
  const sevenDayForecastData: DataPoint[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dateToFind = phNow();
    dateToFind.setDate(dateToFind.getDate() - dayOffset);
    const dateToFindStr = toDateKey(dateToFind);

    const salesThatDate = data.filter((item) => item.date === dateToFindStr);
    const totalSalesThatDay = salesThatDate.reduce(
      (sum, r) => r.total + sum,
      0,
    );

    sevenDayForecastData.push({
      label: dateToFindStr,
      actual: totalSalesThatDay,
    });

    const dateToForecast = phNow();
    dateToForecast.setDate(dateToForecast.getDate() + dayOffset + 1);
    const dateToForecastStr = toDateKey(dateToForecast);
    const dayOfTheSalesToForecast = dateToForecast.getDay();

    const salesThatDayOfTheWeekInTheMonth = data.filter(
      (item) => new Date(item.date).getDay() === dayOfTheSalesToForecast,
    );

    const totalSalesOfThatDayThePastMonth = salesThatDayOfTheWeekInTheMonth.reduce(
      (sum, r) => r.total + sum,
      0,
    );

    const numberOfThatDayConductedInTheMonth = new Set(
      salesThatDayOfTheWeekInTheMonth.map((r) => r.date),
    ).size;

    const forecastOfNextWeekOnThatDay =
      totalSalesOfThatDayThePastMonth === 0
        ? 0
        : totalSalesOfThatDayThePastMonth / numberOfThatDayConductedInTheMonth;

    sevenDayForecastData.push({
      label: dateToForecastStr,
      forecast: forecastOfNextWeekOnThatDay,
    });
  }

  const sortedData = sevenDayForecastData.sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return {
    title: "7-day revenue forecast",
    ...computeForecastBounds(sortedData),
    yFormatter: (v) => `₱${(v / 1000).toFixed(0)}k`,
    data: sortedData,
  };
}
