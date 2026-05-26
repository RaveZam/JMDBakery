"use server";

import { createClient } from "@/utils/supabase/server";

export type GeoRevenueRow = {
  province: string;
  barangay: string;
  revenue: number;
};

function sixMonthsAgoDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

async function getGeoSales() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("route_sessions")
    .select(
      `
      session_date,
      session_stores!inner(
        stores!inner(province, barangay),
        sales(total)
      )
    `,
    )
    .gte("session_date", sixMonthsAgoDate());

  if (error) throw new Error(error.message);

  return (data ?? []).flatMap((session: any) =>
    (session.session_stores as any[]).map((ss) => ({
      province: (ss.stores?.province ?? "").trim(),
      barangay: (ss.stores?.barangay ?? "").trim(),
      revenue: (ss.sales as any[]).reduce(
        (sum, sale) => sum + Number(sale.total ?? 0),
        0,
      ),
    })),
  );
}

async function aggregateProvinces(): Promise<
  { province: string; revenue: number }[]
> {
  const rows = await getGeoSales();

  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!row.province) continue;
    totals.set(row.province, (totals.get(row.province) ?? 0) + row.revenue);
  }

  return [...totals.entries()]
    .map(([province, revenue]) => ({ province, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function aggregateBarangays(): Promise<GeoRevenueRow[]> {
  const rows = await getGeoSales();

  const totals = new Map<string, GeoRevenueRow>();
  for (const row of rows) {
    if (!row.barangay) continue;
    const key = `${row.province}|${row.barangay}`;
    const existing = totals.get(key);
    if (existing) {
      existing.revenue += row.revenue;
    } else {
      totals.set(key, {
        province: row.province,
        barangay: row.barangay,
        revenue: row.revenue,
      });
    }
  }

  return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
}

export async function getTopProvincesByRevenue(): Promise<
  { province: string; revenue: number }[]
> {
  return (await aggregateProvinces()).slice(0, 5);
}

export async function getTopBarangaysByRevenue(): Promise<GeoRevenueRow[]> {
  return (await aggregateBarangays()).slice(0, 5);
}

export async function getBottomProvincesByRevenue(): Promise<
  { province: string; revenue: number }[]
> {
  return (await aggregateProvinces()).slice(-3).reverse();
}

export async function getBottomBarangaysByRevenue(): Promise<GeoRevenueRow[]> {
  return (await aggregateBarangays()).slice(-3).reverse();
}
