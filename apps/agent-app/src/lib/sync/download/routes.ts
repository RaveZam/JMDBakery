import { supabase } from "@/src/lib/supabase";
import RoutesDao from "@/src/lib/dao/routes-dao";

/**
 * Full pull of the agent's routes (RLS-scoped server-side). Returns how many
 * rows landed, or null if the fetch failed — provinces and stores hang off
 * routes by FK, so a null tells the caller to stop rather than pull children
 * that have nothing to attach to.
 */
export async function downloadRoutes(): Promise<number | null> {
  const { data, error } = await supabase
    .from("agent_routes")
    .select("id, name");
  if (error || !data) {
    console.warn("[download] failed to fetch routes:", error?.message);
    return null;
  }
  for (const row of data) {
    RoutesDao.upsertRoute(row.id, row.name);
  }
  return data.length;
}
