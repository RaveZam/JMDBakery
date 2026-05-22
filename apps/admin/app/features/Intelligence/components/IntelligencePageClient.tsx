"use client";
import { KpiCard } from "../../dashboard/components/KpiCard";
import { computeRevenueTodayAndYesterday } from "../helpers/computeRevenueTodayAndYesterday";
import { IntelligenceActionCard } from "./IntelligenceActionCard";
import { IntelligenceAgentForecast } from "./IntelligenceAgentForecast";
import { IntelligenceForecastChart } from "./IntelligenceForecastChart";
import { IntelligenceProductForecast } from "./IntelligenceProductForecast";
import { IntelligenceSellThroughChart } from "./IntelligenceSellThroughChart";
import { IntelligenceStockAllocation } from "./IntelligenceStockAllocation";
import { IntelligenceRouteHotspot } from "./IntelligenceRouteHotspot";
import { IntelligenceVarianceTracker } from "./IntelligenceVarianceTracker";
import { computeAverageSalesOnThatDay } from "../helpers/computeAverageSalesOnThatDay";
import { computeMovingAverageAndDayAverage } from "../helpers/computeMovingAverageAndDayAverage";
import { computeBORateThisMonth } from "../helpers/computeBORateThisMonth";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export function IntelligencePageClient({
  data,
  yearData,
  allTimeData,
}: {
  data: any;
  yearData: any;
  allTimeData: any;
}) {
  computeMovingAverageAndDayAverage(data);
  const { totalSalesToday, totalSalesYesterday, percentageDiff } =
    computeRevenueTodayAndYesterday(data);
  const { predictedRevenueForTomorrow, dayToday } =
    computeAverageSalesOnThatDay(data);
  const { averageSalesNextWeek } = computeMovingAverageAndDayAverage(data);

  const { borate } = computeBORateThisMonth(data);

  const boRiskTone =
    borate < 5
      ? "healthy"
      : borate < 10
        ? "medium"
        : borate < 20
          ? "warning"
          : "critical";

  const boRiskLabel =
    borate < 5
      ? "Healthy"
      : borate < 10
        ? "Medium"
        : borate < 20
          ? "At Risk"
          : "Critical";

  const boRiskIcon =
    borate < 5
      ? ShieldCheck
      : borate < 10
        ? AlertCircle
        : borate < 20
          ? AlertTriangle
          : ShieldAlert;

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Intelligence
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Health overview, predicted revenue, next best actions, and agent
                risk signals
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Business health overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Revenue trend vs previous day"
                primary={`${
                  percentageDiff >= 0 ? "+" : ""
                }${percentageDiff.toFixed(1)}%`}
                secondary={
                  "Today ₱" +
                  totalSalesToday +
                  " vs Yesterday ₱" +
                  totalSalesYesterday
                }
                tone="primary"
                icon={percentageDiff >= 0 ? TrendingUp : TrendingDown}
              />
              <KpiCard
                title="Predicted sales Tomorrow"
                primary={
                  "₱" +
                  (isNaN(predictedRevenueForTomorrow)
                    ? 0
                    : predictedRevenueForTomorrow)
                }
                secondary={`Your Typical Sales On  ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(dayToday + 1) % 7]}`}
                tone="primary"
                icon={CalendarDays}
              />
              <KpiCard
                title="Projected 7 Day Revenue"
                primary={
                  "₱" + Math.round(averageSalesNextWeek).toLocaleString()
                }
                secondary="Based From your weekly Sales This Month"
                tone="primary"
                icon={BarChart2}
              />
              <KpiCard
                title="BO risk level"
                primary={boRiskLabel}
                secondary={"BO Rate " + borate.toFixed(1) + "% This Month"}
                tone={boRiskTone}
                icon={boRiskIcon}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Next best actions</h2>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
              <IntelligenceActionCard
                action={{
                  id: "a-1",
                  title: "Reduce Spanish Bread allocation",
                  why: "BO rate hit 44% over the last 3 sessions — excess stock is not selling through.",
                  action:
                    "Cut delivery by 20% for next run and monitor sell-through.",
                  priority: "P1",
                  confidence: "High",
                }}
              />
              <IntelligenceActionCard
                action={{
                  id: "a-2",
                  title: "Follow up with Ben on variance discrepancy",
                  why: "5-unit variance recorded on 2026-02-21 with no return logged.",
                  action: "Request end-of-day reconciliation sheet from agent.",
                  priority: "P2",
                  confidence: "Med",
                }}
              />
              <IntelligenceActionCard
                action={{
                  id: "a-3",
                  title: "Increase Pandesal allocation at SM City",
                  why: "Consistently sells out — Angel's last 3 sessions show zero BO for this SKU.",
                  action:
                    "Add 10 units to next delivery and track for over-ordering.",
                  priority: "P2",
                  confidence: "Med",
                }}
              />
            </div>
          </section>

          <section>
            <IntelligenceForecastChart
              data={data}
              yearData={yearData}
              allTimeData={allTimeData}
            />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Morning inventory insights
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <IntelligenceSellThroughChart />
              <IntelligenceRouteHotspot />
            </div>
            <div className="mt-4 space-y-4">
              <IntelligenceStockAllocation />
              <IntelligenceVarianceTracker />
            </div>
          </section>

          {/* <section>
            <IntelligenceAgentForecast />
          </section>
            Future Possible Features nalang to since i want to make everything fully funcitonal and bug free
          <section>
            <IntelligenceProductForecast />
          </section> */}
        </div>
      </div>
    </>
  );
}
