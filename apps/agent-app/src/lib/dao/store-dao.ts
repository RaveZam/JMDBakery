import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

type StoreRow = {
  id: string;
  name: string;
  province_id: string | null;
  province: string;
  city: string;
  barangay: string;
  contact_number: string;
  contact_name: string;
  /** Who registered the store. Whether that is *this* agent is a question for
   *  the app, not the database — see features/routes/core/is-own-store.ts. */
  created_by: string | null;
  created_by_name: string | null;
};

type InsertStoreInput = {
  provinceId: string | null;
  name: string;
  province?: string;
  city?: string;
  barangay?: string;
  contactName?: string;
  contactPhone?: string;
  createdBy?: string | null;
  createdByName?: string | null;
};

const StoresDao = {
  // Reached through province_stores, not stores.province_id, so a store another
  // agent registered shows up on this route once it has been linked onto one of
  // its provinces.
  getStoresForRoute(routeId: string) {
    return getDb().getAllSync<StoreRow & { link_province_id: string }>(
      `SELECT s.*, MIN(ps.province_id) AS link_province_id
       FROM stores s
       INNER JOIN province_stores ps ON ps.store_id = s.id
       INNER JOIN provinces p ON ps.province_id = p.id
       WHERE p.route_id = ?
       GROUP BY s.id`,
      [routeId],
    );
  },

  getStoresForProvince(provinceId: string) {
    return getDb().getAllSync<StoreRow>(
      `SELECT s.* FROM stores s
       INNER JOIN province_stores ps ON ps.store_id = s.id
       WHERE ps.province_id = ?`,
      [provinceId],
    );
  },

  getStoreById(id: string) {
    return getDb().getFirstSync<StoreRow>(
      `SELECT s.* FROM stores s WHERE s.id = ?`,
      [id],
    );
  },

  getAllStoreIds(): string[] {
    return getDb()
      .getAllSync<{ id: string }>(`SELECT id FROM stores`)
      .map((row) => row.id);
  },

  upsertStore(input: InsertStoreInput & { id: string }) {
    getDb().runSync(
      `INSERT INTO stores (id, province_id, name, province, city, barangay, contact_number, contact_name, created_by, created_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         province_id   = excluded.province_id,
         name          = excluded.name,
         province      = excluded.province,
         city          = excluded.city,
         barangay      = excluded.barangay,
         contact_number = excluded.contact_number,
         contact_name  = excluded.contact_name,
         created_by    = excluded.created_by,
         created_by_name = excluded.created_by_name`,
      [
        input.id,
        input.provinceId,
        input.name,
        input.province ?? "",
        input.city ?? "",
        input.barangay ?? "",
        input.contactPhone ?? "",
        input.contactName ?? "",
        input.createdBy ?? null,
        input.createdByName ?? null,
      ],
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
       (id, province_id, name, province, city, barangay, contact_number, contact_name, created_by, created_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.provinceId,
        input.name,
        input.province ?? "",
        input.city ?? "",
        input.barangay ?? "",
        input.contactPhone ?? "",
        input.contactName ?? "",
        input.createdBy ?? null,
        input.createdByName ?? null,
      ],
    );
    return id;
  },
};
export default StoresDao;
