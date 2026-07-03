import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

type SessionStoreRow = {
  id: string;
  route_session_id: string;
  store_id: string;
  store_name: string;
  store_province: string | null;
  store_city: string | null;
  store_barangay: string | null;
  store_contact_name: string | null;
  province_name: string | null;
  visited: number;
  created_at: string;
};

const SESSION_STORE_SELECT = `SELECT ss.*, s.name as store_name, s.province as store_province,
              s.city as store_city, s.barangay as store_barangay,
              s.contact_name as store_contact_name, p.name as province_name
       FROM session_stores ss
       INNER JOIN stores s ON ss.store_id = s.id
       LEFT JOIN provinces p ON s.province_id = p.id`;

const SessionStoresDao = {
  insert(
    routeSessionId: string,
    storeId: string,
    provinceId: string | null = null,
    id: string = generateUUID(),
  ): string {
    getDb().runSync(
      `INSERT INTO session_stores (id, route_session_id, store_id, province_id) VALUES (?, ?, ?, ?)`,
      [id, routeSessionId, storeId, provinceId],
    );
    return id;
  },

  getBySessionId(sessionId: string) {
    return getDb().getAllSync<SessionStoreRow>(
      `${SESSION_STORE_SELECT} WHERE ss.route_session_id = ?`,
      [sessionId],
    );
  },

  getById(id: string) {
    return getDb().getFirstSync<SessionStoreRow>(
      `${SESSION_STORE_SELECT} WHERE ss.id = ?`,
      [id],
    );
  },

  markVisited(sessionStoreId: string) {
    getDb().runSync(`UPDATE session_stores SET visited = 1 WHERE id = ?`, [
      sessionStoreId,
    ]);
  },
};

export default SessionStoresDao;
