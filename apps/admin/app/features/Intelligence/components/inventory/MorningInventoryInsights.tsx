import { MapPin, MapPinned } from "lucide-react";
import { RevenueRankCard } from "./RevenueRankCard";
import { IntelligenceStockAllocation } from "./IntelligenceStockAllocation";
import { IntelligenceVarianceTracker } from "./IntelligenceVarianceTracker";
import type { GeoRevenueRow } from "../../constants/staticBarangays";

export function MorningInventoryInsights({
  provinces,
  barangays,
}: {
  provinces: { province: string; revenue: number }[];
  barangays: GeoRevenueRow[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Morning inventory insights</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueRankCard
          title="Provinces by revenue"
          icon={MapPinned}
          iconClassName="text-orange-500"
          rows={provinces.map((p) => ({
            key: p.province,
            title: p.province,
            revenue: p.revenue,
          }))}
          emptyLabel="No province revenue recorded in the last 6 months."
        />
        <RevenueRankCard
          title="Barangays by revenue"
          icon={MapPin}
          iconClassName="text-amber-500"
          rows={barangays.map((b) => ({
            key: `${b.province}|${b.barangay}`,
            title: b.barangay,
            caption: b.province || null,
            revenue: b.revenue,
          }))}
          emptyLabel="No barangay revenue recorded in the last 6 months."
        />
      </div>
      <div className="mt-4 space-y-4">
        <IntelligenceStockAllocation />
        <IntelligenceVarianceTracker />
      </div>
    </section>
  );
}
