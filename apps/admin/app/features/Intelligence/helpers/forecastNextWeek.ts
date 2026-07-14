import { DataPoint, ForecastChartData } from "../types/forecast_types";
import { phNow } from "./phNow";
import { computeForecastBounds } from "./computeForecastBounds";

export function forecastNextWeek(data: any[]): ForecastChartData {
  let dayOffset = 0;
  const sevenDayForecastData: DataPoint[] = [];

  for (dayOffset; dayOffset < 7; dayOffset++) {
    const dateToFind = phNow();
    dateToFind.setDate(dateToFind.getDate() - dayOffset);
    const dateToFindStr = dateToFind.toISOString().split("T")[0];

    const SalesThatDate = data.filter((item) => {
      const rawDate = item.createdAt.split("T")[0];
      const saleDate = new Date(rawDate);
      const saleDateStr = saleDate.toISOString().split("T")[0];
      return saleDateStr === dateToFindStr;
    });

    const totalSalesThatDay = SalesThatDate.reduce(
      (sum: number, r: any) => r.total + sum,
      0,
    );

    sevenDayForecastData.push({
      label: dateToFindStr,
      actual: totalSalesThatDay,
    });

    const dateToForecast = phNow();
    dateToForecast.setDate(dateToForecast.getDate() + dayOffset + 1);
    const dateToForecastStr = dateToForecast.toISOString().split("T")[0];

    const dayOfTheSalesToForecast = dateToForecast.getDay();

    const totalSalesThatDayOfTheWeekinTheMonth = data.filter((item) => {
      const rawDate = item.createdAt.split("T")[0];
      const dateToFind = new Date(rawDate);
      const dayOfTheRawDate = dateToFind.getDay();
      return dayOfTheSalesToForecast === dayOfTheRawDate;
    });

    const totalSalesOfThatDayThePastMonth =
      totalSalesThatDayOfTheWeekinTheMonth.reduce(
        (sum: number, r: any) => r.total + sum,
        0,
      );

    const numberOfThatDayConductedInTheMonth = new Set(
      totalSalesThatDayOfTheWeekinTheMonth?.map(
        (r: any) => r.createdAt.split("T")[0],
      ),
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
