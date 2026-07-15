import type { SalesRecord } from "@/app/server/getBaseData";
import { computeRevenueTodayAndYesterday } from "./computeRevenueTodayAndYesterday";
import { computeAverageSalesOnThatDay } from "./computeAverageSalesOnThatDay";
import { computeMovingAverageAndDayAverage } from "./computeMovingAverageAndDayAverage";
import { computeBORateThisMonth } from "./computeBORateThisMonth";
import { deriveBORisk, type BORisk } from "./deriveBORisk";

export interface IntelligenceMetrics {
  totalSalesToday: number;
  totalSalesYesterday: number;
  percentageDiff: number;
  predictedRevenueForTomorrow: number;
  dayToday: number;
  averageSalesNextWeek: number;
  borate: number;
  boRisk: BORisk;
}

export function getIntelligenceMetrics(data: SalesRecord[]): IntelligenceMetrics {
  const { totalSalesToday, totalSalesYesterday, percentageDiff } =
    computeRevenueTodayAndYesterday(data);
  const { predictedRevenueForTomorrow, dayToday } =
    computeAverageSalesOnThatDay(data);
  const { averageSalesNextWeek } = computeMovingAverageAndDayAverage(data);
  const { borate } = computeBORateThisMonth(data);

  return {
    totalSalesToday,
    totalSalesYesterday,
    percentageDiff,
    predictedRevenueForTomorrow,
    dayToday,
    averageSalesNextWeek,
    borate,
    boRisk: deriveBORisk(borate),
  };
}
