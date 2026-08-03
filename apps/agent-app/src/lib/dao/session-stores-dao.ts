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
  payment_type: "cash" | "credit";
  created_at: string;
};

//This gets the stores from the session_stores table, then links the province name from the store_province table
const SESSION_STORE_SELECT = `SELECT ss.*, s.name as store_name, s.province as store_province,
              s.city as store_city, s.barangay as store_barangay,
              s.contact_name as store_contact_name, p.name as province_name
       FROM session_stores ss
       INNER JOIN stores s ON ss.store_id = s.id
       LEFT JOIN provinces p ON ss.province_id = p.id`;

const SessionStoresDao = {
  insert(input: {
    routeSessionId: string;
    storeId: string;
    createdAt: string;
    provinceId?: string | null;
    id?: string;
  }): string {
    const id = input.id ?? generateUUID();
    getDb().runSync(
      `INSERT INTO session_stores (id, route_session_id, store_id, province_id, created_at) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        input.routeSessionId,
        input.storeId,
        input.provinceId ?? null,
        input.createdAt,
      ],
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

  setPaymentType(sessionStoreId: string, paymentType: "cash" | "credit") {
    getDb().runSync(
      `UPDATE session_stores SET payment_type = ? WHERE id = ?`,
      [paymentType, sessionStoreId],
    );
  },
};

export default SessionStoresDao;
