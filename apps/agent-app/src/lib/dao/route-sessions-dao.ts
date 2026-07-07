import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

export type RouteSessionRow = {
  id: string;
  route_name: string;
  session_date: string;
  conducted_by: string;
  status: string;
  morning_inventory_finished: 0 | 1;
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

  // Idempotent upsert for the download/pull path — the server is the source of
  // truth, so a repeated pull updates the existing row instead of colliding on id.
  upsertSession(
    routeName: string,
    sessionDate: string,
    conductedBy: string,
    status: string,
    id: string = generateUUID(),
  ): string {
    getDb().runSync(
      `INSERT INTO route_sessions (id, route_name, session_date, conducted_by, status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         route_name   = excluded.route_name,
         session_date = excluded.session_date,
         conducted_by = excluded.conducted_by,
         status       = excluded.status`,
      [id, routeName, sessionDate, conductedBy, status],
    );
    return id;
  },

  complete(id: string) {
    getDb().runSync(
      `UPDATE route_sessions SET status = 'completed' WHERE id = ?`,
      [id],
    );
  },

  cancel(id: string) {
    getDb().runSync(
      `UPDATE route_sessions SET status = 'cancelled' WHERE id = ?`,
      [id],
    );
  },

  markInventoryFinished(id: string) {
    getDb().runSync(
      `UPDATE route_sessions SET morning_inventory_finished = 1 WHERE id = ?`,
      [id],
    );
  },

  getOngoing() {
    return getDb().getFirstSync<RouteSessionRow>(
      `SELECT * FROM route_sessions WHERE status = 'ongoing' ORDER BY created_at DESC LIMIT 1`,
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
};

export default RouteSessionsDao;
