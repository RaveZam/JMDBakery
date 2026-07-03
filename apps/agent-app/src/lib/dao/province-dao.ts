import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

const ProvincesDao = {
  insertProvince(routeId: string, name: string) {
    const id = generateUUID();
    getDb().runSync(
      `INSERT INTO provinces (id, route_id, name) VALUES (?, ?, ?)`,
      [id, routeId, name],
    );
    return id;
  },

  upsertProvince(id: string, routeId: string, name: string) {
    getDb().runSync(
      `INSERT INTO provinces (id, name, route_id) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, route_id = excluded.route_id`,
      [id, name, routeId],
    );
  },

  renameProvince(id: string, name: string) {
    getDb().runSync(`UPDATE provinces SET name = ? WHERE id = ?`, [name, id]);
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
};
export default ProvincesDao;
