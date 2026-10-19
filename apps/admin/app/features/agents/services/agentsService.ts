"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { windowStartDate } from "@/app/server/datasetWindow";
import type { AgentRow } from "../types/agent-types";

export async function getAgents(): Promise<AgentRow[]> {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const supabase = await createClient();
  const windowStart = windowStartDate();

  const [usersResult, sessResult, ssResult] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabase
      .from("route_sessions")
      .select("id, conducted_by, status")
      .gte("session_date", windowStart),
    supabase
      .from("session_stores")
      .select(
        "route_session_id, visited, sales(quantity_sold, quantity_bo), route_sessions!inner(session_date)",
      )
      .gte("route_sessions.session_date", windowStart),
  ]);

  if (usersResult.error) throw new Error(usersResult.error.message);
  if (sessResult.error) throw new Error(sessResult.error.message);
  if (ssResult.error) throw new Error(ssResult.error.message);

  const agents = usersResult.data.users.filter(
    (u) => u.user_metadata?.role === "agent",
  );

  // Session stats per agent
  const sessionToAgent = new Map<string, string>();
  const sessionsByAgent = new Map<
    string,
    { total: number; completed: number }
  >();
  for (const s of sessResult.data ?? []) {
    sessionToAgent.set(s.id, s.conducted_by);
    const existing = sessionsByAgent.get(s.conducted_by);
    if (existing) {
      existing.total += 1;
      if (s.status === "completed") existing.completed += 1;
    } else {
      sessionsByAgent.set(s.conducted_by, {
        total: 1,
        completed: s.status === "completed" ? 1 : 0,
      });
    }
  }

  // Store visit and bad order stats per agent
  const storeStatsByAgent = new Map<
    string,
    { planned: number; visited: number; sold: number; badOrdered: number }
  >();
  for (const ss of ssResult.data ?? []) {
    const agentId = sessionToAgent.get(ss.route_session_id);
    if (!agentId) continue;
    const sales = ss.sales ?? [];
    const sold = sales.reduce((sum, s) => sum + (s.quantity_sold ?? 0), 0);
    const badOrdered = sales.reduce((sum, s) => sum + (s.quantity_bo ?? 0), 0);
    const existing = storeStatsByAgent.get(agentId);
    if (existing) {
      existing.planned += 1;
      if (ss.visited) existing.visited += 1;
      existing.sold += sold;
      existing.badOrdered += badOrdered;
    } else {
      storeStatsByAgent.set(agentId, {
        planned: 1,
        visited: ss.visited ? 1 : 0,
        sold,
        badOrdered,
      });
    }
  }

  return agents.map((a) => {
    const sess = sessionsByAgent.get(a.id) ?? { total: 0, completed: 0 };
    const stores = storeStatsByAgent.get(a.id) ?? {
      planned: 0,
      visited: 0,
      sold: 0,
      badOrdered: 0,
    };
    return {
      id: a.id,
      email: a.email ?? "",
      name:
        (a.user_metadata?.name as string) || a.email || "Unknown",
      createdAt: a.created_at,
      totalSessions: sess.total,
      completedSessions: sess.completed,
      totalStoresVisited: stores.visited,
      totalStoresPlanned: stores.planned,
      totalSold: stores.sold,
      totalBadOrdered: stores.badOrdered,
    };
  });
}
