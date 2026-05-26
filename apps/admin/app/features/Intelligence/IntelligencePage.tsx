import { getRecords } from "@/app/server/getBaseData";
import { IntelligencePageClient } from "./components/IntelligencePageClient";
import { parseRecordsFiltersLast30Days } from "@/lib/selectors/filters";
import { getOneYearOfSalesData } from "./services/getOneYearOfSalesData";
import { getAllDailySalesData } from "./services/getAllDailySalesData";
import {
  getTopProvincesByRevenue,
  getTopBarangaysByRevenue,
  getBottomProvincesByRevenue,
  getBottomBarangaysByRevenue,
} from "../dashboard/services/revenueGeoService";

export async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseRecordsFiltersLast30Days(await searchParams);

  const params = await searchParams;
  const range = params["range"] ?? "weekly";
  const [
    data,
    yearData,
    allTimeData,
    topProvinces,
    topBarangays,
    bottomProvinces,
    bottomBarangays,
  ] = await Promise.all([
    getRecords(filters),
    range === "monthly" ? getOneYearOfSalesData() : Promise.resolve(null),
    range === "yearly" ? getAllDailySalesData() : Promise.resolve(null),
    getTopProvincesByRevenue(),
    getTopBarangaysByRevenue(),
    getBottomProvincesByRevenue(),
    getBottomBarangaysByRevenue(),
  ]);

  return (
    <IntelligencePageClient
      data={data}
      yearData={yearData}
      allTimeData={allTimeData}
      topProvinces={topProvinces}
      topBarangays={topBarangays}
      bottomProvinces={bottomProvinces}
      bottomBarangays={bottomBarangays}
    />
  );
}

export default IntelligencePage;
