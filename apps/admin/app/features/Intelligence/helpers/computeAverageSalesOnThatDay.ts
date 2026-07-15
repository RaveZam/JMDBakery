import type { SalesRecord } from "@/app/server/getBaseData";
import { phNow } from "./phNow";

export function computeAverageSalesOnThatDay(data: SalesRecord[]) {
  const dayToday = phNow().getDay();

  const salesThatDay = data.filter(
    (r) => new Date(r.date).getDay() === dayToday + 1,
  );

  const totalSalesThatDay = salesThatDay.reduce((sum, r) => r.total + sum, 0);

  const howManyDaysOfThatDayInAMonth = new Set(
    salesThatDay.map((r) => r.date),
  ).size;

  const predictedRevenueForTomorrow =
    howManyDaysOfThatDayInAMonth === 0
      ? 0
      : totalSalesThatDay / howManyDaysOfThatDayInAMonth;

  return {
    predictedRevenueForTomorrow,
    dayToday,
  };
}
