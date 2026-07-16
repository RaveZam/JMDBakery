import type { SalesRecord } from "@/app/server/getBaseData";
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { nowInManila, toDateKey, addDays } from "./dateUtils";
import { toDailyTotals } from "./dailyTotals";
import { averageRevenueForWeekday } from "./weekdayAverage";

export type BackorderRiskTone = "healthy" | "medium" | "warning" | "critical";

export type BackorderRisk = {
  tone: BackorderRiskTone;
  label: string;
  icon: LucideIcon;
};

export type IntelligenceKpis = {
  revenueToday: number;
  revenueYesterday: number;
  revenueChangePct: number;
  tomorrowWeekday: number;
  predictedRevenueTomorrow: number;
  projectedRevenueNext7Days: number;
  backorderRatePct: number;
  backorderRisk: BackorderRisk;
};

function revenueOn(records: SalesRecord[], dateKey: string): number {
  return records
    .filter((r) => r.date === dateKey)
    .reduce((sum, r) => sum + r.total, 0);
}

function classifyBackorderRisk(ratePct: number): BackorderRisk {
  if (ratePct < 5) return { tone: "healthy", label: "Healthy", icon: ShieldCheck };
  if (ratePct < 10) return { tone: "medium", label: "Medium", icon: AlertCircle };
  if (ratePct < 20) return { tone: "warning", label: "At Risk", icon: AlertTriangle };
  return { tone: "critical", label: "Critical", icon: ShieldAlert };
}

/** Computes the four Intelligence KPIs from a window of sales records
 * (the caller is expected to pass a recent window, e.g. last 30 days). */
export function computeIntelligenceKpis(records: SalesRecord[]): IntelligenceKpis {
  const today = nowInManila();
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  const revenueToday = revenueOn(records, todayKey);
  const revenueYesterday = revenueOn(records, yesterdayKey);
  const revenueChangePct =
    revenueYesterday === 0
      ? 0
      : ((revenueToday - revenueYesterday) / revenueYesterday) * 100;

  const dailyTotals = toDailyTotals(records);
  const tomorrowWeekday = addDays(today, 1).getDay();
  const predictedRevenueTomorrow = averageRevenueForWeekday(
    dailyTotals,
    tomorrowWeekday,
  );

  let projectedRevenueNext7Days = 0;
  for (let weekday = 0; weekday < 7; weekday++) {
    projectedRevenueNext7Days += averageRevenueForWeekday(dailyTotals, weekday);
  }

  const totalSold = records.reduce((sum, r) => sum + r.soldQty, 0);
  const totalBackordered = records.reduce((sum, r) => sum + r.boQty, 0);
  const backorderRatePct =
    totalSold === 0 ? 0 : (totalBackordered / totalSold) * 100;

  return {
    revenueToday,
    revenueYesterday,
    revenueChangePct,
    tomorrowWeekday,
    predictedRevenueTomorrow,
    projectedRevenueNext7Days,
    backorderRatePct,
    backorderRisk: classifyBackorderRisk(backorderRatePct),
  };
}
