import type { SalesRecord } from "@/app/server/getBaseData";

export function computeMovingAverageAndDayAverage(data: SalesRecord[]) {
  let averageSalesNextWeek = 0;

  for (let day = 0; day < 7; day++) {
    const salesThatDay = data.filter((r) => new Date(r.date).getDay() === day);

    const howManyDaysOfThatDayInAMonth = new Set(
      salesThatDay.map((r) => r.date),
    ).size;

    const totalSalesThatDay = salesThatDay.reduce(
      (sum, r) => r.total + sum,
      0,
    );

    const averageWeeklySaleOfTheDay =
      totalSalesThatDay / (howManyDaysOfThatDayInAMonth || 1);

    averageSalesNextWeek += averageWeeklySaleOfTheDay;
  }

  return {
    averageSalesNextWeek,
  };
}
