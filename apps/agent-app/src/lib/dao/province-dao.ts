import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

const ProvincesDao = {
  insertProvince(routeId: string, name: string) {
    const id = generateUUID();
    getDb().runSync(
      `INSERT INTO provinces (id, route_id, name) VALUES (?, ?, ?)`,
      [id, routeId, name],
    );
    return id;
  },

  deleteProvince(id: string) {
    const db = getDb();
    db.runSync(`DELETE FROM stores WHERE province_id = ?`, [id]);
    db.runSync(`DELETE FROM provinces WHERE id = ?`, [id]);
  },

  getProvincesForRoute(routeId: string) {
    return getDb().getAllSync<{ id: string; name: string; route_id: string }>(
      `SELECT * FROM provinces WHERE route_id = ?`,
      [routeId],
    );
  },

  logAll() {
    const rows = getDb().getAllSync<{
      id: string;
      name: string;
      route_id: string;
    }>(`SELECT * FROM provinces`);
    logTable("provinces", rows as Record<string, unknown>[]);
  },
};
export default ProvincesDao;
