import type { SalesRecord } from "@/app/server/getBaseData";
import { phNow } from "../shared/phNow";
import { toDateKey } from "../shared/toDateKey";

export function computeRevenueTodayAndYesterday(data: SalesRecord[]) {
  const today = toDateKey(phNow());

  const yesterdayPh = phNow();
  yesterdayPh.setDate(yesterdayPh.getDate() - 1);
  const yesterday = toDateKey(yesterdayPh);

  const todayData = data.filter((r) => r.date === today);
  const yesterdayData = data.filter((r) => r.date === yesterday);
  const totalSalesToday = todayData.reduce((sum, r) => sum + r.total, 0);
  const totalSalesYesterday = yesterdayData.reduce(
    (sum, r) => sum + r.total,
    0,
  );
  const percentageDiff =
    totalSalesYesterday === 0
      ? 0
      : ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100;

  return {
    totalSalesToday,
    totalSalesYesterday,
    percentageDiff,
  };
}
