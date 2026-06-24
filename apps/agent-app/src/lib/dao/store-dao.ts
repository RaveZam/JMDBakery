import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { logTable } from "@/src/lib/log-table";

type StoreRow = {
  id: string;
  name: string;
  province_id: string;
  province: string;
  city: string;
  barangay: string;
  contact_number: string;
  contact_name: string;
};

type InsertStoreInput = {
  provinceId: string;
  name: string;
  province?: string;
  city?: string;
  barangay?: string;
  contactName?: string;
  contactPhone?: string;
};

const StoresDao = {
  getStoresForRoute(routeId: string) {
    return getDb().getAllSync<StoreRow>(
      `SELECT s.* FROM stores s
       INNER JOIN provinces p ON s.province_id = p.id
       WHERE p.route_id = ?`,
      [routeId],
    );
  },

  getStoresForProvince(provinceId: string) {
    return getDb().getAllSync<StoreRow>(
      `SELECT * FROM stores WHERE province_id = ?`,
      [provinceId],
    );
  },

  deleteStore(id: string) {
    getDb().runSync(`DELETE FROM stores WHERE id = ?`, [id]);
  },

  updateStore(id: string, input: Omit<InsertStoreInput, "provinceId">) {
    getDb().runSync(
      `UPDATE stores SET name = ?, province = ?, city = ?, barangay = ?, contact_number = ?, contact_name = ? WHERE id = ?`,
      [
        input.name,
        input.province ?? "",
        input.city ?? "",
        input.barangay ?? "",
        input.contactPhone ?? "",
        input.contactName ?? "",
        id,
      ],
    );
  },

  insertStore(input: InsertStoreInput) {
    const id = generateUUID();
    getDb().runSync(
      `INSERT INTO stores
       (id, province_id, name, province, city, barangay, contact_number, contact_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.provinceId,
        input.name,
        input.province ?? "",
        input.city ?? "",
        input.barangay ?? "",
        input.contactPhone ?? "",
        input.contactName ?? "",
      ],
    );
    return id;
  },

  logAll() {
    const rows = getDb().getAllSync<StoreRow>(`SELECT * FROM stores`);
    logTable("stores", rows as Record<string, unknown>[]);
  },
};
export default StoresDao;
