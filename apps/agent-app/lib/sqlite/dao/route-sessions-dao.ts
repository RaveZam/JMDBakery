import { db } from "../db-migration";
import { v4 as uuidv4 } from "uuid";
import { logTable } from "../log-table";
import OutboxDao from "./outbox-dao";

const RouteSessionsDao = {
  insert(routeName: string, sessionDate: string, conductedBy: string): string {
    const id = uuidv4();
    db.runSync(
      `INSERT INTO route_sessions (id, route_name, session_date, conducted_by, status) VALUES (?, ?, ?, ?, 'ongoing')`,
      [id, routeName, sessionDate, conductedBy],
    );
    return id;
  },

  complete(id: string) {
    db.runSync(`UPDATE route_sessions SET status = 'completed' WHERE id = ?`, [
      id,
    ]);
    const session = db.getFirstSync<{
      id: string;
      route_name: string;
      session_date: string;
      conducted_by: string;
      status: string;
      created_at: string;
    }>(`SELECT * FROM route_sessions WHERE id = ?`, [id]);
    if (session) {
      OutboxDao.insertOutbox(
        "SESSION_PLAN_COMPLETED",
        JSON.stringify(session),
        2,
      );
    }
  },

  getOngoing() {
    return db.getFirstSync<{
      id: string;
      route_name: string;
      session_date: string;
      conducted_by: string;
      status: string;
      created_at: string;
    }>(`SELECT * FROM route_sessions WHERE status = 'ongoing' `);
  },

  getAll() {
    return db.getAllSync<{
      id: string;
      route_name: string;
      session_date: string;
      conducted_by: string;
      status: string;
      created_at: string;
    }>(`SELECT * FROM route_sessions ORDER BY created_at DESC`);
  },

  getById(id: string) {
    return db.getFirstSync<{
      id: string;
      route_name: string;
      session_date: string;
      conducted_by: string;
      status: string;
      created_at: string;
    }>(`SELECT * FROM route_sessions WHERE id = ?`, [id]);
  },

  logAll() {
    const rows = db.getAllSync<{
      id: string;
      route_name: string;
      session_date: string;
      conducted_by: string;
      status: string;
      created_at: string;
    }>(`SELECT * FROM route_sessions`);
    logTable("route_sessions", rows as Record<string, unknown>[]);
  },
};

export default RouteSessionsDao;
