import { supabase } from "@/src/lib/supabase";
import ProvincesDao from "@/src/lib/dao/province-dao";

/**
 * Full pull of the agent's provinces. Must run after downloadRoutes — each
 * province references a route by FK. Returns the row count, or null on failure.
 */
export async function downloadProvinces(): Promise<number | null> {
  const { data, error } = await supabase
    .from("agent_provinces")
    .select("id, name, route_id");
  if (error || !data) {
    console.warn("[download] failed to fetch provinces:", error?.message);
    return null;
  }
  for (const row of data) {
    ProvincesDao.upsertProvince(row.id, row.route_id, row.name);
  }
  return data.length;
}
