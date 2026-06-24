import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

export type RouteSessionRow = {
  id: string;
  route_name: string;
  session_date: string;
  conducted_by: string;
  status: string;
  created_at: string;
};

const RouteSessionsDao = {
  insert(
    routeName: string,
    sessionDate: string,
    conductedBy: string,
    id: string = generateUUID(),
  ): string {
    getDb().runSync(
      `INSERT INTO route_sessions (id, route_name, session_date, conducted_by, status) VALUES (?, ?, ?, ?, 'ongoing')`,
      [id, routeName, sessionDate, conductedBy],
    );
    return id;
  },

  complete(id: string) {
    getDb().runSync(
      `UPDATE route_sessions SET status = 'completed' WHERE id = ?`,
      [id],
    );
  },

  getOngoing() {
    return getDb().getFirstSync<RouteSessionRow>(
      `SELECT * FROM route_sessions WHERE status = 'ongoing' `,
    );
  },

  getAll() {
    return getDb().getAllSync<RouteSessionRow>(
      `SELECT * FROM route_sessions ORDER BY created_at DESC`,
    );
  },

  getById(id: string) {
    return getDb().getFirstSync<RouteSessionRow>(
      `SELECT * FROM route_sessions WHERE id = ?`,
      [id],
    );
  },

  logAll() {
    const rows = getDb().getAllSync<RouteSessionRow>(
      `SELECT * FROM route_sessions`,
    );
    logTable("route_sessions", rows as Record<string, unknown>[]);
  },
};

export default RouteSessionsDao;
