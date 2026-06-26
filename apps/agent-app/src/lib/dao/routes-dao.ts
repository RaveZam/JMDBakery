import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

const RoutesDao = {
  getAllRoutes() {
    return getDb().getAllSync<{ id: string; name: string }>(
      `SELECT * FROM routes`,
    );
  },

  insertRoute(name: string) {
    const id = generateUUID();
    getDb().runSync(`INSERT INTO routes (id, name) VALUES (?, ?)`, [id, name]);
    return id;
  },

  renameRoute(id: string, name: string) {
    getDb().runSync(`UPDATE routes SET name = ? WHERE id = ?`, [name, id]);
  },

  deleteRoute(id: string) {
    const db = getDb();
    db.runSync(
      `DELETE FROM stores WHERE province_id IN (SELECT id FROM provinces WHERE route_id = ?)`,
      [id],
    );
    db.runSync(`DELETE FROM provinces WHERE route_id = ?`, [id]);
    db.runSync(`DELETE FROM routes WHERE id = ?`, [id]);
  },

  logAll() {
    const rows = getDb().getAllSync<{ id: string; name: string }>(
      `SELECT * FROM routes`,
    );
    logTable("routes", rows as Record<string, unknown>[]);
  },
};

export default RoutesDao;
